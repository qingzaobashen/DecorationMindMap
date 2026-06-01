/**
 * 会话管理模块
 * 跟踪用户多设备会话，限制最多 MAX_DEVICES 台设备同时在线
 * 通过 user_sessions 表记录每个设备的活跃状态
 */
import supabase from './supabase';

const MAX_DEVICES = 5;
const DEVICE_ID_KEY = 'device_id';
const SESSION_EXPIRY_MINUTES = 120;

/**
 * 获取或生成设备唯一标识
 * 基于 localStorage 持久化，同一浏览器共享同一 device_id
 * @returns {string} 设备唯一标识
 */
export const getDeviceId = () => {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = `dev_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
};

/**
 * 获取设备描述信息（浏览器、平台等）
 * @returns {string} 设备描述
 */
export const getDeviceInfo = () => {
  const ua = navigator.userAgent;
  let browser = '未知浏览器';
  let os = '未知系统';

  if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Edg')) browser = 'Edge';

  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  return `${browser}/${os}`;
};

/**
 * 注册当前设备会话
 * 如果该用户已有 MAX_DEVICES 台设备在线，则踢出最早活跃的设备
 * @param {string} userId - 用户ID
 * @returns {Promise<{success: boolean, message?: string}>} 注册结果
 */
export const registerSession = async (userId) => {
  const deviceId = getDeviceId();
  const deviceInfo = getDeviceInfo();

  try {
    const { data: existing, error: selectError } = await supabase
      .from('user_sessions')
      .select('id')
      .eq('user_id', userId)
      .eq('device_id', deviceId);

    if (selectError) {
      console.error('查询会话失败:', selectError);
      return { success: false, message: '会话查询失败' };
    }

    if (existing && existing.length > 0) {
      const { error: updateError } = await supabase
        .from('user_sessions')
        .update({ last_active_at: new Date().toISOString(), device_info: deviceInfo })
        .eq('user_id', userId)
        .eq('device_id', deviceId);

      if (updateError) {
        console.error('更新会话失败:', updateError);
        return { success: false, message: '会话更新失败' };
      }
      return { success: true };
    }

    const { data: sessions, error: countError } = await supabase
      .from('user_sessions')
      .select('id, device_id, last_active_at')
      .eq('user_id', userId)
      .order('last_active_at', { ascending: true });

    if (countError) {
      console.error('查询会话数量失败:', countError);
      return { success: false, message: '会话查询失败' };
    }

    if (sessions.length >= MAX_DEVICES) {
      const evictCount = sessions.length - MAX_DEVICES + 1;
      const evictIds = sessions.slice(0, evictCount).map(s => s.id);

      const { error: evictError } = await supabase
        .from('user_sessions')
        .delete()
        .in('id', evictIds);

      if (evictError) {
        console.error('踢出旧设备失败:', evictError);
      }
    }

    const { error: insertError } = await supabase
      .from('user_sessions')
      .insert({
        user_id: userId,
        device_id: deviceId,
        device_info: deviceInfo,
        last_active_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('注册会话失败:', insertError);
      return { success: false, message: '会话注册失败' };
    }

    return { success: true };
  } catch (error) {
    console.error('注册会话异常:', error);
    return { success: false, message: '会话注册异常' };
  }
};

/**
 * 移除当前设备会话（登出时调用）
 * @param {string} userId - 用户ID
 * @returns {Promise<boolean>} 是否成功移除
 */
export const removeSession = async (userId) => {
  const deviceId = getDeviceId();

  try {
    const { error } = await supabase
      .from('user_sessions')
      .delete()
      .eq('user_id', userId)
      .eq('device_id', deviceId);

    if (error) {
      console.error('移除会话失败:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('移除会话异常:', error);
    return false;
  }
};

/**
 * 更新当前设备的最后活跃时间（心跳）
 * @param {string} userId - 用户ID
 * @returns {Promise<boolean>} 是否成功更新
 */
export const heartbeat = async (userId) => {
  const deviceId = getDeviceId();

  try {
    const { error } = await supabase
      .from('user_sessions')
      .update({ last_active_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('device_id', deviceId);

    return !error;
  } catch (error) {
    console.error('心跳更新异常:', error);
    return false;
  }
};

/**
 * 清理过期会话（超过 SESSION_EXPIRY_MINUTES 分钟未活跃）
 * @param {string} userId - 用户ID
 * @returns {Promise<number>} 清理的会话数量
 */
export const cleanExpiredSessions = async (userId) => {
  const expiryTime = new Date(Date.now() - SESSION_EXPIRY_MINUTES * 60 * 1000).toISOString();

  try {
    const { data, error } = await supabase
      .from('user_sessions')
      .delete()
      .eq('user_id', userId)
      .lt('last_active_at', expiryTime)
      .select('id');

    if (error) {
      console.error('清理过期会话失败:', error);
      return 0;
    }
    return data?.length || 0;
  } catch (error) {
    console.error('清理过期会话异常:', error);
    return 0;
  }
};

/**
 * 获取当前用户的所有活跃会话列表
 * @param {string} userId - 用户ID
 * @returns {Promise<Array>} 会话列表
 */
export const getActiveSessions = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('id, device_id, device_info, created_at, last_active_at')
      .eq('user_id', userId)
      .order('last_active_at', { ascending: false });

    if (error) {
      console.error('获取会话列表失败:', error);
      return [];
    }
    return data || [];
  } catch (error) {
    console.error('获取会话列表异常:', error);
    return [];
  }
};

export { MAX_DEVICES, SESSION_EXPIRY_MINUTES };
