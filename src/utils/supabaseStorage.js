import supabase from './supabase';

/**
 * Supabase 存储工具
 * 提供文件上传、下载和管理功能
 */

// 存储桶名称
const BUCKET_NAME = 'mindmap_resources';

/**
 * 初始化存储桶
 * 如果存储桶不存在则创建
 */
export const initStorage = async () => {
  try {
    // 检查存储桶是否存在
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('获取存储桶列表失败:', listError);
      return false;
    }
    
    // 检查是否已存在目标存储桶
    const bucketExists = buckets.some(b => b.name === BUCKET_NAME);
    
    if (!bucketExists) {
      // 创建存储桶
      const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true // 设置为公开访问
      });
      
      if (createError) {
        console.error('创建存储桶失败:', createError);
        return false;
      }
      
      console.log('存储桶创建成功:', BUCKET_NAME);
    }
    
    return true;
  } catch (error) {
    console.error('初始化存储桶失败:', error);
    return false;
  }
};

/**
 * 上传文件到 Supabase 存储
 * @param {File} file - 要上传的文件
 * @param {string} filePath - 文件在存储桶中的路径
 * @returns {Promise<Object>} - 包含上传结果的对象
 */
export const uploadFile = async (file, filePath) => {
  try {
    // 确保存储桶存在
    const initialized = await initStorage();
    if (!initialized) {
      throw new Error('存储桶初始化失败');
    }
    
    // 上传文件
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      throw error;
    }
    
    // 获取文件的公开 URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);
    
    return {
      success: true,
      data: data,
      url: urlData.publicUrl
    };
  } catch (error) {
    console.error('上传文件失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 从 Supabase 下载文件
 * @param {string} filePath - 文件在存储桶中的路径
 * @returns {Promise<Blob>} - 文件的 Blob 对象
 */
export const downloadFile = async (filePath) => {
  try {
    // 获取文件
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .download(filePath);
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('下载文件失败:', error);
    throw error;
  }
};

/**
 * 获取文件的公开 URL
 * @param {string} filePath - 文件在存储桶中的路径
 * @returns {string} - 文件的公开 URL
 */
export const getFileUrl = (filePath) => {
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);
  
  return data.publicUrl;
};

/**
 * 删除文件
 * @param {string} filePath - 文件在存储桶中的路径
 * @returns {Promise<Object>} - 包含删除结果的对象
 */
export const deleteFile = async (filePath) => {
  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);
    
    if (error) {
      throw error;
    }
    
    return { success: true };
  } catch (error) {
    console.error('删除文件失败:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

/**
 * 列出存储桶中的文件
 * @param {string} path - 要列出的目录路径
 * @returns {Promise<Array>} - 文件列表
 */
export const listFiles = async (path = '') => {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(path, {
        limit: 100,
        offset: 0,
        search: ''
      });
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('列出文件失败:', error);
    throw error;
  }
};
