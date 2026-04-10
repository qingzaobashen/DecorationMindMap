import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { marked } from 'marked';
import { Modal, Button } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useUser } from '../context/UserContext';
import MindMap_SimpleMindMap from '../MindMap_SimpleMindMap';
import MindMapSaver from './MindMapSaver';
import VipNodeEditor from './VipNodeEditor';
import { sampleData } from '../utils/sampleData';
import supabase from '../utils/supabase';
import { downloadFile, getFileUrl } from '../utils/supabaseStorage';
import { getMergedMindMapData } from '../utils/mindmapData';

// 导入Swiper样式
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const PORT = 5000;
// 使用import.meta.env.BASE_URL来动态获取base路径，确保在不同部署环境下都能正确访问资源
const csvFilePath = `${import.meta.env.BASE_URL}backend_data/nodes_details_data_0405.csv`;

// CSV文件在 Supabase 存储桶中的路径
const CSV_STORAGE_PATH = 'backend_data/nodes_details_data_0405.csv';
// 图片存储桶中的根路径
const IMAGE_STORAGE_PATH = 'backend_data/images/';
// Supabase 存储桶中的图片 URL 前缀
const supabaseImageUrl = getFileUrl(IMAGE_STORAGE_PATH);//.replace(IMAGE_STORAGE_PATH, '');
console.log("supabaseImageUrl:", supabaseImageUrl);
// 浏览器端解析CSV文件的函数（使用Papa Parse库）
const parseCSV = async () => {
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
 * 构建思维导图结构的函数
 * @param {Array} flatData - 平面节点数据
 * @returns {Object} 构建好的思维导图结构
 */
function buildMindMapStructure(flatData) {
  const nodeMap = new Map();
  let root = null;

  if (!Array.isArray(flatData) || flatData.length === 0) {
    console.error('无效的平面数据格式');
    return sampleData;
  }

  // 创建基础节点结构
  flatData.forEach(item => {
    if (!nodeMap.has(item.node_id)) {
      // 将数据平铺为，每个节点有自己的名字、详情、子节点，详情里面有文字和图片
      nodeMap.set(item.node_id, {
        name: item.name,
        details: item.details ? [{ text: item.details, image: item.image }] : [],
        img_url: item.img_url, // Assuming img_url collects images
        attachment_url: item.attachment_url,
        attachment_name: item.attachment_name,
        children: [],
        parent_id: item.parent_id,
        node_id: item.node_id,
        is_premium: item.is_premium,
        is_expand: item.is_expand
      });
    } else {
      // 这里是防止原始数据里有重复的node_id，若有，则合并详情和图片列表
      if (item.details) {
        nodeMap.get(item.node_id).details.push({ text: item.details, image: item.image });
      }
      if (item.img_url) {
        // Optional: collect all images in img_url if needed, though details has them
        const node = nodeMap.get(item.node_id);
        if (!node.img_url) node.img_url = [];
        node.img_url.push(item.image);
      }
    }
    // 设置根节点
    if (item.parent_id === null && !isNaN(item.node_id)) {
      root = nodeMap.get(item.node_id);
    }
  });

  const nodeMapCp = nodeMap;
  // 遍历节点，将具有父子关系的节点关联，构建父子关系
  nodeMapCp.forEach(item => {
    if (item.parent_id !== null && nodeMap.has(item.parent_id)) {
      const parent = nodeMap.get(item.parent_id);
      parent.children.push({
        name: item.name,
        details: item.details,
        img_url: item.img_url,
        attachment_url: item.attachment_url,
        attachment_name: item.attachment_name,
        children: item.children,
        node_id: item.node_id,
        is_premium: item.is_premium,
        is_expand: item.is_expand
      });
    }
  });
  //console.log("buildMindMapStructure(): ", root);
  return root ? {
    name: root.name,
    details: root.details,
    children: root.children,
    node_id: root.node_id,
    img_url: root.img_url,
    attachment_url: root.attachment_url,
    attachment_name: root.attachment_name
  } : sampleData;
}

/**
 * 主应用UI组件
 * 包含思维导图及节点弹窗
 * @param {Object} props - 组件属性
 * @param {boolean} props.isAuthenticated - 登录状态
 * @param {boolean} props.isPremium - VIP用户状态
 * @param {function} props.logout - 退出登录函数
 * @param {function} props.showLogin - 显示登录模态框的函数
 */
function MainAppUI({ isAuthenticated, isPremium, logout, showLogin }) 
{
  const [selectedNode, setSelectedNode] = useState(null);  // 当前选择的叶节点
  const [panelVisible, setPanelVisible] = useState(false); // 弹出窗是否可见
  const [isClosingByPopState, setIsClosingByPopState] = useState(false); // 是否通过popstate事件关闭
  const [mindData, setMindData] = useState(null);          // 思维导图的数据
  const [loading, setLoading] = useState(true);            // 是否正在加载中，初始为true
  const [viewType] = useState('simplemindmap'); // 导图的显示类型，默认simplemindmap
  const [fullscreenImageVisible, setFullscreenImageVisible] = useState(false); // 全屏图片查看器是否可见
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // 当前查看的图片索引
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0); // 当前轮播图索引
  const mindMapInstanceRef = useRef(null);                   // 缓存思维导图实例
  const swiperInstanceRef = useRef(null);                    // 缓存 Swiper 实例
  const [paymentQRCode, setPaymentQRCode] = useState(null);  // 支付二维码
  const [paymentLoading, setPaymentLoading] = useState(false); // 支付加载状态
  const [paymentPolling, setPaymentPolling] = useState(false); // 是否正在轮询支付状态
  const [vipEditorVisible, setVipEditorVisible] = useState(false); // VIP 编辑器弹窗
  const [editingNode, setEditingNode] = useState(null); // 正在编辑的节点

  const { isAuthenticated: userIsAuthenticated, isPremium: userIsPremium, upgradeToPremium, completeUpgradeToPremium,
     purchaseArticle, completePurchaseArticle, paymentModalVisible, closePaymentModal,
     paymentType, hasPurchasedArticle, currentAoid } = useUser();
  const { setAoid } = useUser();  // 获取用户的当前订单号和设置订单号的函数
  // 生成支付二维码
  const generatePaymentQRCode = async () => {
    try {
      setPaymentLoading(true);
      
      // 导入XorPay工具
      const { createPayment, generateOrderNo } = await import('../utils/xorPay');
      
      // 获取当前用户ID
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      
      if (!userId) {
        return;
      }
      
      // 生成订单信息
      const orderId = generateOrderNo();
      
      // 构建支付参数
      const paymentParams = {
        name: paymentType === 'vip' ? 'VIP升级' : '单篇文章购买',
        price: paymentType === 'vip' ? '15.00' : '3.00', // 单位：元
        order_id: orderId,
        user_id: userId,
        pay_type: 'alipay' // 默认使用支付宝
      };
      
      // 调用XorPay生成支付二维码
      const paymentResult = await createPayment(paymentParams);
      // 临时存储当前订单号
      setAoid(paymentResult.aoid);
      
      if (paymentResult && paymentResult.qr) {
        // 这里要用XorPay的URL拼接，而不是直接使用二维码字符串
        setPaymentQRCode(`https://xorpay.com/qr?data=${paymentResult.qr}`);
        
      } else {
        console.error('生成支付二维码失败');
      }
    } catch (error) {
      console.error('生成支付二维码失败:', error);
    } finally {
      setPaymentLoading(false);
    }
  };

  // 当支付模态框打开时，生成支付二维码
  useEffect(() => {
    if (paymentModalVisible) {
      generatePaymentQRCode();
      setPaymentPolling(true); // 开始轮询
    } else {
      // 关闭模态框时清空二维码
      setPaymentQRCode(null);
      setPaymentPolling(false); // 停止轮询
    }
  }, [paymentModalVisible, paymentType]);

  // 轮询检测支付状态
  useEffect(() => {
    if (!paymentPolling || !paymentModalVisible) return;
    const pollPaymentStatus = async () => {
      const { verifyPayment } = await import('../utils/xorPay');
      const success = await verifyPayment(currentAoid);
      if (success) {
        setPaymentPolling(false);
        if (paymentType === 'vip') {
          const upgradeSuccess = await completeUpgradeToPremium();
          if (upgradeSuccess) {
            console.log('VIP升级成功！');
            window.location.reload(); // 刷新页面
            closePaymentModal();
          }
        } else if (paymentType === 'article') {
          const purchaseSuccess = await completePurchaseArticle();
          if (purchaseSuccess) {
            console.log('文章购买成功！');
            closePaymentModal();
            window.location.reload();
          }
        }
      }
    };

    // 每3秒轮询一次
    const interval = setInterval(pollPaymentStatus, 3000);
    return () => clearInterval(interval);
  }, [paymentPolling, paymentModalVisible, paymentType, currentAoid, completeUpgradeToPremium, completePurchaseArticle]);

  // 截断文本函数，用于付费内容的部分显示
  const truncateText = (text, maxLength = 200) => {
    if (!text || text.length <= maxLength) return text;
    // 截断文本并添加省略号
    return text.substring(0, maxLength) + '...';
  };

  // 设置思维导图实例缓存的回调函数，传给MindMap_SimpleMindMap子组件，让它创建好实例后把实例缓存起来
  const memoizedOnMindMapLoad = useCallback((instance) => {
    //console.log("MindMap instance loaded/reloaded in MainAppUI:", instance);
    mindMapInstanceRef.current = instance;
  }, []);

  // 监听浏览器返回事件，处理手机端返回手势和返回键
  useEffect(() => {
    const handlePopState = (event) => {
      if (panelVisible) {
        event.preventDefault();
        setIsClosingByPopState(true);
        setPanelVisible(false);
      }
    };

    if (panelVisible) {
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [panelVisible]);

  // 关闭详情面板的函数
  const closeDetailPanel = useCallback(() => {
    setPanelVisible(false);
    // 只有在非popstate关闭时才调用history.back()
    if (!isClosingByPopState) {
      window.history.back();
    }
    setIsClosingByPopState(false);
  }, [isClosingByPopState]);

  // 处理节点点击事件的回调函数，传给 MindMap_SimpleMindMap 子组件，让它点击节点时调用
  // 主要是拿到点击节点的数据，然后弹出详情页
  const memoizedHandleNodeClick = useCallback((nodeData, nodeInstance, clickDetails) => {
    const nodeName = nodeData.name || nodeData.data?.text || nodeData.text || '未命名节点';
    let details = nodeData.details || nodeData.data?.details || [];
    if (typeof details === 'string') details = [{ text: details }];
    if (!Array.isArray(details) || !details.every(item => typeof item === 'object' && item !== null)) {
      details = nodeData.data?.note ? [{ text: nodeData.data.note }] : [{ text: '暂无详细信息。' }];
    }
    let img_url = nodeData.img_url || nodeData.data?.img_url || [];
    // 添加节点的付费状态
    const is_premium = nodeData.is_premium || nodeData.data?.is_premium || false;
    // 获取节点的唯一标识，优先使用 node_id，其次使用 name 作为回退
    const nodeId = nodeData.node_id || nodeData.data?.node_id || nodeName;
    // 获取节点完整数据用于编辑
    const fullNodeData = {
      ...nodeData,
      name: nodeName,
      details: details,
      img_url: img_url,
      is_premium,
      node_id: nodeId
    };
    //console.log("is_premium: ", is_premium);
    setSelectedNode({ name: nodeName, details, img_url: img_url, is_premium, id: nodeId, fullNodeData });
    setPanelVisible(true);
    // 添加历史记录条目，以便用户可以通过返回手势或返回键关闭详情页
    window.history.pushState({ panelVisible: true }, '', window.location.href);
    if (clickDetails && clickDetails.type === 'attachment_icon_click') {
      //console.log('MainAppUI: Attachment icon click received:', clickDetails.attachment);
    }
  }, [setSelectedNode, setPanelVisible]);

  // 打开 VIP 编辑器
  const handleEditNode = useCallback(() => {
    if (selectedNode?.fullNodeData) {
      setEditingNode(selectedNode.fullNodeData);
      setVipEditorVisible(true);
    }
  }, [selectedNode]);

  // VIP 编辑器保存成功后的处理
  const handleVipEditorSave = useCallback((savedData) => {
    // 不刷新整个页面，只重新加载数据
    setMindData(null); // 清空当前数据
    setLoading(true);
    
    // 重新获取数据
    setTimeout(async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id;
        const nodesData = await getMergedMindMapData(userId);
        setMindData(buildMindMapStructure(nodesData));
        console.log('数据已更新');
      } catch (error) {
        console.error('重新加载数据失败:', error);
      } finally {
        setLoading(false);
      }
    }, 100);
  }, []);

  // 用于防止重复请求的标志
  const loadingRef = useRef(false);
  
  // Effect for fetching data based on viewType
  useEffect(() => {
    const fetchDataForView = async () => {
      const effectStartTime = performance.now();
      console.log(`\n[MainAppUI] ====== useEffect 触发，viewType: ${viewType} ======`);
      
      // 防止重复加载
      if (loadingRef.current) {
        console.log('[MainAppUI] 正在加载中，跳过本次触发');
        return;
      }
      
      if (viewType === 'document') {
        console.log('[MainAppUI] 文档视图，跳过数据加载');
        setLoading(false);
        return;
      }
      
      // 只在没有数据时才加载，避免重复加载
      if (mindData) {
        console.log('[MainAppUI] 数据已存在，跳过加载');
        setLoading(false);
        return;
      }
      
      console.log('[MainAppUI] 开始加载思维导图数据...');
      loadingRef.current = true;
      setLoading(true);
      mindMapInstanceRef.current = null;
      
      try {
        if (viewType === 'simplemindmap') {
          try {
            // 获取当前用户 ID
            const authStart = performance.now();
            console.log('[MainAppUI] 开始获取用户认证信息...');
            
            const { data: userData } = await supabase.auth.getUser();
            const authTime = performance.now() - authStart;
            console.log(`[MainAppUI] ✓ 用户认证信息获取完成，耗时：${authTime.toFixed(2)}ms`);
            
            const userId = userData?.user?.id;
            console.log(`[MainAppUI] 用户 ID: ${userId ? userId.substring(0, 8) + '...' : '未登录'}`);
            
            // 从 Supabase 获取合并后的数据（基础数据 + 用户自定义数据）
            const dataLoadStart = performance.now();
            const nodesData = await getMergedMindMapData(userId);
            const dataLoadTime = performance.now() - dataLoadStart;
            console.log(`[MainAppUI] ✓ 数据获取完成，耗时：${dataLoadTime.toFixed(2)}ms`);
            
            // 构建思维导图结构
            const buildStart = performance.now();
            console.log('[MainAppUI] 开始构建思维导图结构...');
            
            setMindData(buildMindMapStructure(nodesData));
            
            const buildTime = performance.now() - buildStart;
            console.log(`[MainAppUI] ✓ 思维导图结构构建完成，耗时：${buildTime.toFixed(2)}ms`);
            
            const totalTime = performance.now() - effectStartTime;
            console.log(`[MainAppUI] ====== 数据加载完成，总耗时：${totalTime.toFixed(2)}ms ======\n`);
          } catch (error) {
            console.error('从 Supabase 加载数据失败，使用示例数据:', error);
            // 如果 Supabase 加载失败，回退到 CSV 方式
            const csvStart = performance.now();
            console.log('[MainAppUI] 回退到 CSV 方式加载...');
            
            const nodesData = await parseCSV();
            setMindData(buildMindMapStructure(nodesData));
            
            const csvTime = performance.now() - csvStart;
            console.log(`[MainAppUI] CSV 方式加载完成，耗时：${csvTime.toFixed(2)}ms`);
          }
        } else {
          console.log('[MainAppUI] 使用示例数据');
          setMindData(sampleData);
        }
      } catch (error) {
        console.error('数据加载失败:', error);
        setMindData(sampleData);
      } finally {
        const totalTime = performance.now() - effectStartTime;
        console.log(`[MainAppUI] 设置 loading 为 false，总耗时：${totalTime.toFixed(2)}ms`);
        loadingRef.current = false; // 重置标志
        setLoading(false);
      }
    };

    if (viewType !== 'docs_page') {
      fetchDataForView();
    } else {
      setLoading(false);
    }
  }, [viewType]); // 移除 userIsAuthenticated，避免重复触发

  // Determine what to render based on the current route (implicitly) or viewType state
  // For this example, we assume MainAppUI is rendered for '/' and handles mindmap views
  // DocsViewer, CommunityPage will be handled by their own <Route> elements.

  let currentViewComponent = null;
  if (loading && viewType !== 'docs_page') {
    currentViewComponent = (
      <div className="loading-overlay">
        <div className="loading-spinner"></div>
        <p>正在加载思维导图数据...</p>
        <p className="loading-subtext">这可能需要几秒钟时间，请耐心等待</p>
      </div>
    );
  } else if (viewType === 'simplemindmap' && mindData) {
    currentViewComponent = (
      <MindMap_SimpleMindMap
        data={mindData}
        onNodeClick={memoizedHandleNodeClick}
        onMindMapLoad={memoizedOnMindMapLoad}
      />
    );
  } else if (!loading && !mindData) {
    currentViewComponent = (
      <div className="empty-state">
        <p>暂无数据</p>
        <p className="empty-subtext">请稍后再试</p>
      </div>
    );
  }
  // Note: DocsViewer will be rendered via its own Route in the main App component

  return (
    <div className="app-layout">
      {/* 全屏图片查看器 */}
      {fullscreenImageVisible && selectedNode && selectedNode.img_url && (
        <div className="fullscreen-image-viewer" onClick={() => setFullscreenImageVisible(false)}>
          <div className="fullscreen-image-container">
            {/* 关闭按钮 */}
            <button className="fullscreen-close-btn" onClick={(e) => {
              e.stopPropagation();
              setFullscreenImageVisible(false);
            }} aria-label="关闭全屏图片" tabIndex={0} onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setFullscreenImageVisible(false);
              }
            }}>×</button>
            
            {/* 左右切换按钮 */}
            {currentImageIndex > 0 && (
              <button className="fullscreen-nav-btn prev-btn" 
              onClick={(e) => {
                e.stopPropagation();
                setCurrentImageIndex(prev => prev - 1);
              }} 
              aria-label="上一张图片" 
              tabIndex={0} 
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowLeft') {
                  e.preventDefault();
                  setCurrentImageIndex(prev => prev - 1);
                }
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
            )}
            
            {currentImageIndex < selectedNode.img_url.length - 1 && (
              <button className="fullscreen-nav-btn next-btn" 
                onClick={(e) => {
                e.stopPropagation();
                setCurrentImageIndex(prev => prev + 1);
                }} 
                aria-label="下一张图片" 
                tabIndex={0} 
                onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
                  e.preventDefault();
                  setCurrentImageIndex(prev => prev + 1);
                }
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            )}
            
            {/* 图片 */}
            <img
              src={supabaseImageUrl + (selectedNode.img_url[currentImageIndex] || '/error0.png')}
              className="fullscreen-image"
              alt={`全屏查看图片${currentImageIndex + 1}`}
              loading="lazy"
            />
            
            {/* 图片计数 */}
            <div className="image-counter">
              {currentImageIndex + 1} / {selectedNode.img_url.length}
            </div>
          </div>
        </div>
      )}
      
      {/* VIP 节点编辑器 */}
      <VipNodeEditor
        nodeData={editingNode}
        visible={vipEditorVisible}
        onClose={() => {
          setVipEditorVisible(false);
          setEditingNode(null);
        }}
        onSave={handleVipEditorSave}
      />

      {/* 支付二维码弹窗 */}
      <Modal
        title={paymentType === 'vip' ? "扫码支付（支付宝） - VIP 升级" : "扫码支付（支付宝） - 单篇文章"}
        open={paymentModalVisible}
        onCancel={closePaymentModal}
        footer={[
          <Button key="cancel" onClick={closePaymentModal}>
            取消
          </Button>,
          <Button key="confirm" type="primary" onClick={async () => {
            let success = false;
            if (paymentType === 'vip') {
              // 调用完成VIP升级的函数
              success = await completeUpgradeToPremium();
            } else if (paymentType === 'article') {
              // 调用完成单篇文章购买的函数
              success = await completePurchaseArticle();
            }
            
            if (success) {
              closePaymentModal();
              // 关闭节点详情面板，以便重新加载内容
              closeDetailPanel();
            }
          }}>
            支付已完成
          </Button>
        ]}
        width={360}
        centered
        zIndex={2000}
      >
        <div className="payment-modal-content">
          <p className="payment-description">请使用支付宝扫描下方二维码支付</p>
          <div className="qr-code-container">
            {paymentLoading ? (
              <div className="loading-spinner">加载中...</div>
            ) : paymentQRCode ? (
              <img
                src={paymentQRCode}
                alt={paymentType === 'vip' ? "VIP支付二维码" : "文章支付二维码"}
                className="qr-code"
              />
            ) : (
              <div className="error-message">生成二维码失败</div>
            )}
          </div>
          <p className="payment-amount">支付金额：{paymentType === 'vip' ? "¥15.00" : "¥3.00"}</p>
          <p className="payment-note">
            {paymentType === 'vip' ? "支付成功后，点击'支付完成'按钮完成VIP升级" : "支付成功后，点击'支付完成'按钮查看完整文章"}
          </p>
          <p className="payment-note">
            {paymentType === 'vip' ? "VIP有效期限时延长至“120天”（原90天）（暂不支持退款）" : ""}
          </p>
        </div>
      </Modal>

      <div className={`mainMap`}>
        <header className="view-header">
          <h2>装修流程思维导图</h2>
          {/* {viewType === 'simplemindmap' && mindData && !loading && (
            <MindMapSaver mindMapInstance={mindMapInstanceRef.current} />
          )} 暂时屏蔽保存思维导图的功能*/}
        </header>
        <main className={`mindmap-wrapper mindWrapper-size`}>
          {currentViewComponent}
        </main>
        {panelVisible && (
          <div className="panel-mask" onClick={closeDetailPanel}>
            <div className="detail-panel" onClick={(e) => e.stopPropagation()} aria-modal="true" role="dialog" aria-labelledby="node-detail-title">
              <button className="close-btn" onClick={closeDetailPanel} aria-label="关闭详情面板" tabIndex={0} onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
                  e.preventDefault();
                  closeDetailPanel();
                }
              }}>×</button>
              {selectedNode ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', marginRight: '7%' }}>
                    <h3 id="node-detail-title" style={{ margin: 0 }}>{selectedNode.name}</h3>
                    {userIsPremium && (
                      <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={handleEditNode}
                        size="small"
                      >
                        编辑节点
                      </Button>
                    )}
                  </div>
                  {selectedNode.details && (
                    <div className="content-scroll">
                      <div className="split-layout">
                        {/* 只有当存在有效图片地址时才显示图片轮播区域 */}
                        {selectedNode.img_url && Array.isArray(selectedNode.img_url) && selectedNode.img_url.some(img => img && typeof img === 'string') && (
                          <div className="image-carousel">
                            <Swiper
                              loop={selectedNode.img_url?.filter(img => img && typeof img === 'string').length >= 2}
                              pagination={{ clickable: true }}
                              navigation={{
                                nextEl: '.swiper-button-next',
                                prevEl: '.swiper-button-prev',
                              }}
                              slidesPerView={1}
                              className="my-swiper"
                              onSwiper={(swiper) => {
                                // 保存Swiper实例
                                swiperInstanceRef.current = swiper;
                                // 初始化时设置当前索引
                                setCurrentSlideIndex(swiper.realIndex);
                                
                                // 获取图片轮播区域元素
                                const carouselElement = document.querySelector('.image-carousel');
                                if (carouselElement) {
                                  // 添加鼠标滚轮事件监听
                                  const handleWheel = (e) => {
                                    e.preventDefault();
                                    // 根据滚轮方向切换图片
                                    if (e.deltaY > 0) {
                                      swiper.slideNext();
                                    } else {
                                      swiper.slidePrev();
                                    }
                                  };
                                  
                                  // 添加事件监听器
                                  carouselElement.addEventListener('wheel', handleWheel);
                                  
                                  // 组件卸载时移除事件监听器
                                  return () => {
                                    carouselElement.removeEventListener('wheel', handleWheel);
                                  };
                                }
                              }}
                              onSlideChange={(swiper) => {
                                // 更新当前幻灯片索引
                                setCurrentSlideIndex(swiper.realIndex);
                              }}
                            >
                              {selectedNode.img_url?.map((item, i) => (
                                item && typeof item === 'string' && (
                                  <SwiperSlide key={i}>
                                    <div className="image-container">
                                      <img
                                            src={supabaseImageUrl + (item || '/error0.png')}
                                            className="carousel-image"
                                            alt={`知识点配图${i + 1}`}
                                            loading="lazy"
                                            onClick={() => {
                                              setCurrentImageIndex(i);
                                              setFullscreenImageVisible(true);
                                            }}
                                            onError={(e) => {
                                              e.target.onerror = null; // 防止循环错误
                                              e.target.style.display = 'none';
                                              // 可以在这里添加一个占位符图片或文本
                                              const placeholderText = document.createElement('p');
                                              placeholderText.textContent = '图片加载失败';
                                              if (e.target.parentNode) e.target.parentNode.appendChild(placeholderText);
                                            }}
                                          />
                                      {selectedNode.is_premium && !userIsPremium && (
                                        <div className="vip-overlay">
                                          该内容为VIP专属，仅对VIP用户开放全部内容
                                          <button 
                                            className="upgrade-btn-detail"
                                            onClick={upgradeToPremium}
                                          >
                                            立即升级为VIP
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </SwiperSlide>
                                )
                              ))}
                            </Swiper>
                            {/* 左右切换按钮 */}
                            <div 
                              className="swiper-button-prev"
                              onClick={() => {
                                if (swiperInstanceRef.current) {
                                  swiperInstanceRef.current.slidePrev();
                                }
                              }}
                              aria-label="上一张图片"
                            >
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6"></polyline>
                              </svg>
                            </div>
                            <div 
                              className="swiper-button-next"
                              onClick={() => {
                                if (swiperInstanceRef.current) {
                                  swiperInstanceRef.current.slideNext();
                                }
                              }}
                              aria-label="下一张图片"
                            >
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6"></polyline>
                              </svg>
                            </div>
                            {/* 图片序号显示 */}
                            <div className="image-counter-pre">
                              {currentSlideIndex + 1}/{selectedNode.img_url?.filter(img => img && typeof img === 'string').length}
                            </div>
                          </div>
                        )}
                        <div className="text-content">
                          <div className="knowledge-points">
                            {selectedNode.details?.map((item, idx) => (
                              item && typeof item === 'object' && item.text && (
                                <div
                                  key={idx}
                                  className="point"
                                >
                                  {selectedNode.is_premium && !userIsPremium && !hasPurchasedArticle(selectedNode.id) ? (
                                    // 付费节点且非VIP用户，只显示部分内容
                                    <>
                                      <div dangerouslySetInnerHTML={{ __html: marked.parse(truncateText(item.text)) }} />
                                      <div className="premium-locked">
                                        <p>该内容为VIP专属，仅对VIP用户开放全部内容</p>
                                        {userIsAuthenticated ? (
                                          // 已登录用户，显示升级按钮和支付按钮
                                          <div className="premium-actions">
                                            <button className="upgrade-btn-detail" onClick={() => upgradeToPremium()} tabIndex={0} onKeyDown={(e) => {
                                              if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                upgradeToPremium();
                                              }
                                            }} aria-label="立即升级为VIP">
                                              立即升级为VIP
                                            </button>
                                            {/* <button className="pay-btn-detail" onClick={() => purchaseArticle(selectedNode.id)} tabIndex={0} onKeyDown={(e) => {
                                              if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                purchaseArticle(selectedNode.id);
                                              }
                                            }} aria-label="立即付费阅读">
                                              立即付费阅读
                                            </button> */}
                                          </div>
                                        ) : (
                                          // 未登录用户，提示登录
                                          <p>请先登录后查看更多内容</p>
                                        )}
                                      </div>
                                    </>
                                  ) : (
                                    // 免费节点或VIP用户，显示全部内容
                                    <div dangerouslySetInnerHTML={{ __html: marked.parse(item.text) }} />
                                  )}
                                </div>
                              )
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p>请点击节点查看详细知识点</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



export default MainAppUI;