/**
 * 思维导图数据管理工具
 * 处理与 Supabase 的数据交互，包括基础节点数据和用户自定义数据
 */
import supabase from './supabase';
import { downloadFile } from '../utils/supabaseStorage';

// 本地存储键名
const STORAGE_KEY = 'mindmap_nodes_cache';
const STORAGE_USER_KEY_PREFIX = 'mindmap_user_cache_';

// 数据缓存
const dataCache = {
    mindMapNodes: null,
    userCustomNodes: new Map(), // 按 userId 缓存
    timestamp: 0,
    CACHE_DURATION: 30 * 60 * 1000, // 30 分钟缓存 - 基础数据变化不频繁
    isFetching: false, // 防止重复请求
    fetchPromises: new Map() // 存储进行中的请求 Promise
};


// 使用import.meta.env.BASE_URL来动态获取base路径，确保在不同部署环境下都能正确访问资源
const csvFilePath = `${import.meta.env.BASE_URL}backend_data/nodes_details_data_0405.csv`;

// CSV文件在 Supabase 存储桶中的路径
const CSV_STORAGE_PATH = 'backend_data/nodes_details_data_0405.csv';

// 浏览器端解析CSV文件的函数（使用Papa Parse库）
export async function parseCSV_mindmapData() {
  try {
    // 从 Supabase 下载 CSV 文件
    const blob = await downloadFile(CSV_STORAGE_PATH);

    // 从本地文件系统读取CSV文件--用于快速调试
    //const response = await fetch(csvFilePath);
    //const blob = await response.blob();
    // 将 Blob 转换为 ArrayBuffer，以便手动处理编码
    const arrayBuffer = await blob.arrayBuffer();
    
    // 尝试使用GBK编码解码CSV文件（Windows系统常见编码）
    let csvText;
    try {
      const decoder = new TextDecoder('gbk');
      csvText = decoder.decode(arrayBuffer);
    } catch (error) {
      // 如果GBK解码失败，回退到UTF-8编码
      console.error('GBK解码失败，尝试使用UTF-8编码:', error);
      const decoder = new TextDecoder('utf-8');
      csvText = decoder.decode(arrayBuffer);
    }
    
    // 使用Papa Parse解析CSV文本
    return new Promise((resolve, reject) => {
      import('papaparse').then(({ default: Papa }) => {
        Papa.parse(csvText, {
          header: true, // 使用第一行作为表头
          skipEmptyLines: true, // 跳过空行
          complete: (results) => {
            // 转换数值类型的字段
            const formattedResults = results.data.map(item => ({
              ...item,
              id: parseInt(item.id),
              node_id: parseInt(item.node_id),
              parent_id: item.parent_id ? parseInt(item.parent_id) : null,
              create_user_id: parseInt(item.create_user_id),
              parent_mindMap_id: parseInt(item.parent_mindMap_id)
            }));
            resolve(formattedResults);
          },
          error: (error) => {
            reject(error);
          }
        });
      });
    });
  } catch (error) {
    console.error('下载 CSV 文件失败:', error);
    throw error;
  }
};

/**
 * 从 localStorage 加载缓存数据
 */
function loadFromLocalStorage() {
    try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            // 缓存 1 小时
            if (Date.now() - timestamp < 60 * 60 * 1000) {
                console.log('[性能] 从 localStorage 加载基础节点缓存');
                return data;
            }
        }
    } catch (error) {
        console.error('加载本地缓存失败:', error);
    }
    return null;
}

/**
 * 保存数据到 localStorage
 */
function saveToLocalStorage(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            data,
            timestamp: Date.now()
        }));
        console.log('[性能] 基础节点数据已保存到 localStorage');
    } catch (error) {
        console.error('保存本地缓存失败:', error);
    }
}

/**
 * 从 localStorage 加载用户自定义数据
 */
function loadUserCacheFromLocalStorage(userId) {
    try {
        const key = STORAGE_USER_KEY_PREFIX + userId;
        const cached = localStorage.getItem(key);
        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            // 用户数据缓存 10 分钟
            if (Date.now() - timestamp < 10 * 60 * 1000) {
                console.log('[性能] 从 localStorage 加载用户自定义缓存');
                return data;
            }
        }
    } catch (error) {
        console.error('加载用户本地缓存失败:', error);
    }
    return null;
}

/**
 * 保存用户自定义数据到 localStorage
 */
function saveUserCacheToLocalStorage(userId, data) {
    try {
        const key = STORAGE_USER_KEY_PREFIX + userId;
        localStorage.setItem(key, JSON.stringify({
            data,
            timestamp: Date.now()
        }));
        console.log('[性能] 用户自定义数据已保存到 localStorage');
    } catch (error) {
        console.error('保存用户本地缓存失败:', error);
    }
}

/**
 * 检查缓存是否有效
 */
function isCacheValid() {
    return Date.now() - dataCache.timestamp < dataCache.CACHE_DURATION;
}

/**
 * 从 Supabase 获取基础思维导图节点数据（带缓存）
 * @returns {Promise<Array>} 节点数据数组
 */
export async function getMindMapNodes() {
    const startTime = performance.now();
    console.log('[性能] 开始获取基础节点数据');
    
    // 1. 优先从 localStorage 加载
    const localData = loadFromLocalStorage();
    if (localData) {
        dataCache.mindMapNodes = localData;
        dataCache.timestamp = Date.now();
        const cacheTime = performance.now() - startTime;
        console.log(`[性能] ✓ 使用 localStorage 缓存，耗时：${cacheTime.toFixed(2)}ms`);
        return localData;
    }
    
    // 2. 尝试内存缓存
    if (dataCache.mindMapNodes && isCacheValid()) {
        const cacheTime = performance.now() - startTime;
        console.log(`[性能] ✓ 使用内存缓存，耗时：${cacheTime.toFixed(2)}ms`);
        return dataCache.mindMapNodes;
    }
    // 3. 尝试读取supabase中存储的csv文件
    if (!dataCache.isFetching && !dataCache.mindMapNodes) {
        const data = await parseCSV_mindmapData();
        const cacheTime = performance.now() - startTime;
        console.log(`[性能] ✓ 使用CSV读取，耗时：${cacheTime.toFixed(2)}ms`);
        // 更新所有缓存
        dataCache.mindMapNodes = data || [];
        dataCache.timestamp = Date.now();
        saveToLocalStorage(data || []);
        return data;
    }
    
    // 4. 尝试读取supabase的数据库表，1）先检查是否有进行中的请求，避免重复请求
    if (dataCache.isFetching && dataCache.fetchPromises.has('mindMapNodes')) {
        console.log('[性能] 等待进行中的请求...');
        try {
            const result = await dataCache.fetchPromises.get('mindMapNodes');
            const cacheTime = performance.now() - startTime;
            console.log(`[性能] ✓ 复用进行中的请求结果，耗时：${cacheTime.toFixed(2)}ms`);
            return result;
        } catch (error) {
            console.error('[性能] 等待进行中的请求失败:', error);
        }
    }
    
    // 4. 尝试读取supabase的数据库表，2）标记为正在获取
    dataCache.isFetching = true;
    
    try {
        const queryStart = performance.now();
        console.log('[性能] 开始从 Supabase 查询...');
        // 4. 读取supabase的数据库表
        const { data, error } = await supabase
            .from('mindmap_nodes')
            .select('*')
            .order('node_id', { ascending: true });
        
        const queryTime = performance.now() - queryStart;
        console.log(`[性能] ✓ Supabase 查询完成，耗时：${queryTime.toFixed(2)}ms`);
        
        if (error) {
            console.error('获取思维导图节点失败:', error);
            throw error;
        }
        
        // 5. 更新所有缓存
        dataCache.mindMapNodes = data || [];
        dataCache.timestamp = Date.now();
        saveToLocalStorage(data || []);
        
        const totalTime = performance.now() - startTime;
        console.log(`[性能] ✓ 基础节点数据加载完成，共 ${data.length} 条，总耗时：${totalTime.toFixed(2)}ms`);
        
        return data || [];
    } catch (error) {
        const errorTime = performance.now() - startTime;
        console.error(`[性能] ✗ 获取思维导图节点异常，耗时：${errorTime.toFixed(2)}ms`, error);
        throw error;
    } finally {
        // 重置标志
        dataCache.isFetching = false;
        dataCache.fetchPromises.delete('mindMapNodes');
    }
}

/**
 * 获取用户的自定义节点数据（带缓存）
 * @param {string} userId - 用户 ID
 * @returns {Promise<Array>} 用户自定义节点数组
 */
export async function getUserCustomNodes(userId) {
    if (!userId) {
        console.warn('未提供用户 ID，无法获取自定义节点');
        return [];
    }
    
    const startTime = performance.now();
    console.log(`[性能] 开始获取用户 ${userId.substring(0, 8)}... 的自定义节点数据`);
    
    // 1. 优先从 localStorage 加载
    const localData = loadUserCacheFromLocalStorage(userId);
    if (localData) {
        dataCache.userCustomNodes.set(userId, localData);
        const cacheTime = performance.now() - startTime;
        console.log(`[性能] ✓ 使用 localStorage 用户缓存，耗时：${cacheTime.toFixed(2)}ms`);
        return localData;
    }
    
    // 2. 尝试内存缓存
    const cachedData = dataCache.userCustomNodes.get(userId);
    if (cachedData && isCacheValid()) {
        const cacheTime = performance.now() - startTime;
        console.log(`[性能] ✓ 使用内存用户缓存，耗时：${cacheTime.toFixed(2)}ms`);
        return cachedData;
    }
    
    try {
        const queryStart = performance.now();
        console.log('[性能] 开始从 Supabase 查询用户自定义数据...');
        
        const { data, error } = await supabase
            .from('user_custom_nodes')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        
        const queryTime = performance.now() - queryStart;
        console.log(`[性能] ✓ Supabase 查询完成，耗时：${queryTime.toFixed(2)}ms`);
        
        if (error) {
            console.error('获取用户自定义节点失败:', error);
            throw error;
        }
        
        // 3. 更新所有缓存
        dataCache.userCustomNodes.set(userId, data || []);
        saveUserCacheToLocalStorage(userId, data || []);
        
        const totalTime = performance.now() - startTime;
        console.log(`[性能] ✓ 用户自定义节点数据加载完成，共 ${(data || []).length} 条，总耗时：${totalTime.toFixed(2)}ms`);
        
        return data || [];
    } catch (error) {
        const errorTime = performance.now() - startTime;
        console.error(`[性能] ✗ 获取用户自定义节点异常，耗时：${errorTime.toFixed(2)}ms`, error);
        return [];
    }
}

/**
 * 清除用户自定义数据缓存
 * @param {string} userId - 用户 ID
 */
export function clearUserCustomCache(userId) {
    if (userId) {
        dataCache.userCustomNodes.delete(userId);
        console.log('已清除用户自定义数据缓存');
    }
}

/**
 * 保存用户自定义节点（新增或更新）
 * @param {Object} nodeData - 节点数据
 * @param {string} userId - 用户 ID
 * @param {string} actionType - 操作类型：'create' | 'update' | 'delete'
 * @returns {Promise<Object>} 保存结果
 */
export async function saveUserCustomNode(nodeData, userId, actionType = 'update') {
    if (!userId) {
        throw new Error('未提供用户 ID');
    }
    
    try {
        const customNodeData = {
            user_id: userId,
            node_id: parseInt(nodeData.node_id),
            name: nodeData.name || null,
            details: nodeData.details || null,
            img_url: nodeData.img_url || null,
            attachment_url: nodeData.attachment_url || null,
            attachment_name: nodeData.attachment_name || null,
            is_premium: nodeData.is_premium || false,
            is_expand: nodeData.is_expand !== undefined ? nodeData.is_expand : true,
            action_type: actionType
        };
        
        // 使用 upsert 方法，如果存在则更新，不存在则插入
        const { data, error } = await supabase
            .from('user_custom_nodes')
            .upsert(customNodeData, {
                onConflict: 'user_id,node_id'
            })
            .select()
            .single();
        
        if (error) {
            console.error('保存用户自定义节点失败:', error);
            throw error;
        }
        
        // 清除缓存，确保下次加载时获取最新数据
        clearUserCustomCache(userId);
        
        console.log('用户自定义节点保存成功:', data);
        return data;
    } catch (error) {
        console.error('保存用户自定义节点异常:', error);
        throw error;
    }
}

/**
 * 删除用户的自定义节点记录
 * @param {string} userId - 用户 ID
 * @param {number} nodeId - 节点 ID
 * @returns {Promise<Object>} 删除结果
 */
export async function deleteUserCustomNode(userId, nodeId) {
    if (!userId || !nodeId) {
        throw new Error('用户 ID 和节点 ID 不能为空');
    }
    
    try {
        const { error } = await supabase
            .from('user_custom_nodes')
            .delete()
            .eq('user_id', userId)
            .eq('node_id', nodeId);
        
        if (error) {
            console.error('删除用户自定义节点失败:', error);
            throw error;
        }
        
        // 清除缓存，确保下次加载时获取最新数据
        clearUserCustomCache(userId);
        
        console.log(`用户自定义节点 ${nodeId} 删除成功`);
        return { success: true };
    } catch (error) {
        console.error('删除用户自定义节点异常:', error);
        throw error;
    }
}

/**
 * 合并基础节点数据和用户自定义数据
 * @param {Array} baseNodes - 基础节点数据
 * @param {Array} userCustomNodes - 用户自定义节点数据
 * @returns {Array} 合并后的节点数据
 */
export function mergeNodeData(baseNodes, userCustomNodes) {
    const startTime = performance.now();
    console.log(`[性能] 开始合并数据，基础节点：${baseNodes.length} 条，用户自定义：${userCustomNodes.length} 条`);
    
    if (!Array.isArray(baseNodes)) {
        console.error('基础节点数据不是数组');
        return [];
    }
    
    if (!Array.isArray(userCustomNodes)) {
        console.warn('用户自定义节点数据不是数组，使用空数组');
        userCustomNodes = [];
    }
    
    // 创建用户自定义数据的 Map，以 node_id 为键
    const customNodesMap = new Map();
    userCustomNodes.forEach(node => {
        customNodesMap.set(node.node_id, node);
    });
    
    // 合并数据
    const mergedData = baseNodes.map(baseNode => {
        const customNode = customNodesMap.get(baseNode.node_id);
        
        if (!customNode) {
            // 没有用户自定义数据，返回基础数据
            return baseNode;
        }
        
        if (customNode.action_type === 'delete') {
            // 用户删除了该节点，标记为已删除
            return {
                ...baseNode,
                _deleted: true
            };
        }
        
        // 用户修改了该节点，合并数据（用户数据优先）
        return {
            ...baseNode,
            name: customNode.name !== null ? customNode.name : baseNode.name,
            details: customNode.details !== null ? customNode.details : baseNode.details,
            img_url: customNode.img_url !== null ? customNode.img_url : baseNode.img_url,
            attachment_url: customNode.attachment_url !== null ? customNode.attachment_url : baseNode.attachment_url,
            attachment_name: customNode.attachment_name !== null ? customNode.attachment_name : baseNode.attachment_name,
            is_premium: customNode.is_premium !== null ? customNode.is_premium : baseNode.is_premium,
            is_expand: customNode.is_expand !== null ? customNode.is_expand : baseNode.is_expand,
            _customized: true // 标记该节点已被用户自定义
        };
    });
    
    // 过滤掉被用户删除的节点
    const result = mergedData.filter(node => !node._deleted);
    const totalTime = performance.now() - startTime;
    console.log(`[性能] ✓ 数据合并完成，最终节点：${result.length} 条，耗时：${totalTime.toFixed(2)}ms`);
    return result;
}

/**
 * 获取合并后的思维导图数据
 * @param {string} userId - 用户 ID（可选）
 * @returns {Promise<Array>} 合并后的节点数据
 */
export async function getMergedMindMapData(userId) {
    const startTime = performance.now();
    console.log(`\n[性能] ====== 开始加载思维导图数据 ======`);
    console.log(`[性能] 用户 ID: ${userId ? userId.substring(0, 8) + '...' : '未登录'}`);
    
    try {
        // 并行获取基础节点数据和用户自定义数据
        const baseNodesPromise = getMindMapNodes();
        
        if (userId) {
            const userCustomNodesPromise = getUserCustomNodes(userId);
            
            // 等待两个请求都完成
            const [baseNodes, userCustomNodes] = await Promise.all([
                baseNodesPromise,
                userCustomNodesPromise
            ]);
            
            const mergedData = mergeNodeData(baseNodes, userCustomNodes);
            const totalTime = performance.now() - startTime;
            console.log(`[性能] ====== 思维导图数据加载完成，总耗时：${totalTime.toFixed(2)}ms ======\n`);
            return mergedData;
        }
        
        const baseNodes = await baseNodesPromise;
        const totalTime = performance.now() - startTime;
        console.log(`[性能] ====== 思维导图数据加载完成，总耗时：${totalTime.toFixed(2)}ms ======\n`);
        return baseNodes;
    } catch (error) {
        const totalTime = performance.now() - startTime;
        console.error(`[性能] ====== 获取合并后的思维导图数据失败，耗时：${totalTime.toFixed(2)}ms ======`, error);
        throw error;
    }
}
