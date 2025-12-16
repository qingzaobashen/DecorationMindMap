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
    const checkAuth = () => {
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
      setLoading(false);
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
    localStorage.setItem('isPremium', userData.isPremium ? 'true' : 'false');
    
    setIsAuthenticated(true);
    setUsername(userData.username);
    setIsPremium(userData.isPremium);
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

  // 升级为VIP用户
  const upgradeToPremium = () => {
    // 这里应该有一个实际的支付流程，现在我们简化处理
    localStorage.setItem('isPremium', 'true');
    setIsPremium(true);
    message.success('恭喜！您已成功升级为VIP用户');
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