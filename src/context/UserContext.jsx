import React, { createContext, useState, useEffect, useContext } from 'react';
import { message } from 'antd';
// 导入共享的Supabase客户端实例
import supabase from '../utils/supabase';

// 创建上下文
export const UserContext = createContext();

// 用户上下文提供者组件
export const UserProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);

  // 初始化 - 检查用户登录状态和VIP状态
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 尝试从Supabase获取当前用户信息
        const { data, error } = await supabase.auth.getUser();
        
        if (data?.user) {
          // 用户已登录，从Supabase获取VIP状态
          const isPremiumUser = data.user.user_metadata?.is_premium || false;
          const username = data.session.user.user_metadata?.username || data.user.email?.split('@')[0] || data.user.id;
          
          // 更新本地存储和状态
          localStorage.setItem('token', data.user.token || localStorage.getItem('token'));
          localStorage.setItem('username', username);
          localStorage.setItem('isPremium', isPremiumUser ? 'true' : 'false');
          
          setIsAuthenticated(true);
          setUsername(username);
          setIsPremium(isPremiumUser);
        } else {
          // 检查本地存储
          //const token = localStorage.getItem('token');
          //const savedUsername = localStorage.getItem('username');
          //const userPremiumStatus = localStorage.getItem('isPremium');
          //
          //if (token) {
          //  setIsAuthenticated(true);
          //  setUsername(savedUsername || '');
          //  setIsPremium(userPremiumStatus === 'true');
          //} else {
            setIsAuthenticated(false);
            setIsPremium(false);
            setUsername('');
          //}
        }
      } catch (error) {
        console.error('检查用户状态失败:', error);
        // 出错时回退到本地存储
        const token = localStorage.getItem('token');
        const savedUsername = localStorage.getItem('username');
        const userPremiumStatus = localStorage.getItem('isPremium');
        
        if (token) {
          setIsAuthenticated(true);
          setUsername(savedUsername || '');
          setIsPremium(userPremiumStatus === 'true');
        } else {
          setIsAuthenticated(false);
          setIsPremium(false);
          setUsername('');
        }
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
    
    // 监听存储变化
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'username' || e.key === 'isPremium') {
        checkAuth();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // 登录处理
  const login = (userData) => {
    localStorage.setItem('token', userData.token);
    localStorage.setItem('username', userData.username);
    // 从用户数据中获取VIP状态，如果没有则默认为false
    const isPremiumUser = userData.user?.user_metadata?.is_premium || userData.isPremium || false;
    localStorage.setItem('isPremium', isPremiumUser ? 'true' : 'false');
    
    setIsAuthenticated(true);
    setUsername(userData.username);
    setIsPremium(isPremiumUser);
  };

  // 注销处理
  const logout = async () => {
    try {
      // 调用Supabase的登出接口
      await supabase.auth.signOut();
      console.log("logouting... ");
      // 清理本地存储
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('isPremium');
      
      // 更新状态
      setIsAuthenticated(false);
      setUsername('');
      setIsPremium(false);
      
      message.info('您已退出登录');
    } catch (error) {
      message.error(`登出失败: ${error.message}`);
      console.error('登出失败:', error);
    }
  };

  // 升级为VIP用户 - 开始支付流程
  const upgradeToPremium = () => {
    // 不直接执行升级，而是触发支付流程
    // 支付流程将在UI层处理，完成后调用completeUpgradeToPremium
    return new Promise((resolve) => {
      // 这里可以添加触发支付二维码弹窗的逻辑
      // 但由于弹窗是UI组件，我们将在App.jsx中处理
      resolve();
    });
  };

  // 完成VIP升级 - 支付成功后调用
  const completeUpgradeToPremium = async () => {
    try {
      // 0. TODO验证用户是否支付成功
      
      // 1. 更新Supabase用户的元数据，标记为VIP用户
      const { data, error } = await supabase.auth.updateUser({
        data: { 
          is_premium: true,
          premium_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 默认为1年有效期
        }
      });
      
      if (error) {
        throw error;
      }
      
      console.log('Supabase用户更新响应:', data);
      
      // 2. 更新本地存储和状态
      localStorage.setItem('isPremium', 'true');
      setIsPremium(true);
      
      message.success('恭喜！您已成功升级为VIP用户');
      return true;
    } catch (error) {
      message.error(`升级VIP用户失败: ${error.message}`);
      console.error('升级VIP用户失败:', error);
      return false;
    }
  };

  // 保存用户数据
  const saveUserData = async (data, type = 'mindmap') => {
    if (!isAuthenticated) {
      message.error('请先登录');
      return false;
    }
    
    if (!isPremium) {
      message.error('此功能仅对VIP用户开放');
      return false;
    }
    
    try {
      // 实际项目中应该调用API保存数据
      // 模拟API调用
      console.log(`保存用户${type}数据:`, data);
      
      // 保存到localStorage模拟数据持久化
      localStorage.setItem(`user_${type}_data`, JSON.stringify(data));
      message.success('数据保存成功');
      return true;
    } catch (error) {
      console.error('保存数据失败:', error);
      message.error('保存失败，请稍后再试');
      return false;
    }
  };

  // 获取用户数据
  const getUserData = (type = 'mindmap') => {
    try {
      const storedData = localStorage.getItem(`user_${type}_data`);
      return storedData ? JSON.parse(storedData) : null;
    } catch (error) {
      console.error('获取数据失败:', error);
      return null;
    }
  };

  // 暴露的上下文值
  const value = {
    isAuthenticated,
    isPremium,
    username,
    loading,
    login,
    logout,
    upgradeToPremium,
    completeUpgradeToPremium,
    saveUserData,
    getUserData
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

// 自定义Hook，方便使用上下文
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser必须在UserProvider内部使用');
  }
  return context;
}; 