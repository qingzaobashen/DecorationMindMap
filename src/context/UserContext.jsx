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
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [paymentType, setPaymentType] = useState(null); // null, 'vip' or 'article'
  const [currentArticleId, setCurrentArticleId] = useState(null); // 当前正在付费的文章ID
  const [purchasedArticles, setPurchasedArticles] = useState([]); // 用户已购买的文章列表
  const [isEmailVerified, setIsEmailVerified] = useState(false); // 邮箱验证状态

  // 从Supabase更新用户状态
  const updateUserState = (user) => {
    if (user) {
      const isPremiumUser = user.user_metadata?.is_premium || false;
      const userUsername = user.user_metadata?.username || user.email?.split('@')[0] || user.id;
      const userPurchasedArticles = user.user_metadata?.purchased_articles || [];
      const isEmailVerified = user.email_confirmed_at ? true : false;
      
      setIsAuthenticated(true);
      setUsername(userUsername);
      setIsPremium(isPremiumUser);
      setPurchasedArticles(userPurchasedArticles);
      setIsEmailVerified(isEmailVerified);
      
      // 保存用户状态到本地存储，用于快速恢复
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('isPremium', isPremiumUser ? 'true' : 'false');
      localStorage.setItem('username', userUsername);
      localStorage.setItem('purchasedArticles', JSON.stringify(userPurchasedArticles));
      localStorage.setItem('isEmailVerified', isEmailVerified ? 'true' : 'false');
    } else {
      setIsAuthenticated(false);
      setUsername('');
      setIsPremium(false);
      setPurchasedArticles([]);
      setIsEmailVerified(false);
      
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('isPremium');
      localStorage.removeItem('username');
      localStorage.removeItem('purchasedArticles');
      localStorage.removeItem('isEmailVerified');
    }
  };

  // 初始化 - 检查用户登录状态和VIP状态
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 首先从本地存储快速恢复状态，提升用户体验
        const isPremiumUser = localStorage.getItem('isPremium') === 'true';
        const userUsername = localStorage.getItem('username') || '';
        const userPurchasedArticles = JSON.parse(localStorage.getItem('purchasedArticles')) || [];
        const isEmailVerifiedUser = localStorage.getItem('isEmailVerified') === 'true';
        const isAuthenticatedUser = localStorage.getItem('isAuthenticated') === 'true';
        
        // 快速设置本地状态，让用户立即看到界面
        if (isAuthenticatedUser) {
          setIsAuthenticated(true);
          setUsername(userUsername);
          setIsPremium(isPremiumUser);
          setPurchasedArticles(userPurchasedArticles);
          setIsEmailVerified(isEmailVerifiedUser);
        }
        
        // 然后尝试从Supabase获取最新的用户信息，确保状态同步
        const { data, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('获取用户信息失败:', error);
          // 如果从Supabase获取失败，保持本地存储的状态
          // 但如果本地存储显示已登录，实际可能已过期，需要进一步处理
          if (isAuthenticatedUser) {
            // 尝试刷新会话
            const { error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError) {
              // 刷新会话也失败，说明登录已过期
              updateUserState(null);
            }
          }
        } else {
          // 从Supabase获取成功，更新状态
          updateUserState(data?.user);
        }
      } catch (error) {
        console.error('检查用户状态失败:', error);
        // 出错时保持本地存储的状态
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
    
    // 监听Supabase认证状态变化
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('认证状态变化:', event, session);
      updateUserState(session?.user);
    });
    
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // 登录处理 - 由于Supabase的onAuthStateChange会自动更新状态，此函数已简化
  const login = () => {
    // 登录状态由Supabase的onAuthStateChange自动处理
    // 此函数保留以便向后兼容
    console.log('Login function called - state handled by onAuthStateChange');
  };

  // 注销处理
  const logout = async () => {
    try {
      // 调用Supabase的登出接口
      await supabase.auth.signOut();
      // 状态更新由onAuthStateChange自动处理
      message.info('您已退出登录');
    } catch (error) {
      message.error(`登出失败: ${error.message}`);
      console.error('登出失败:', error);
    }
  };

  // 验证支付状态
  const validatePayment = async () => {
    try {
      // 这里应该调用实际的支付验证API
      // 现在模拟支付验证过程，实际项目中应替换为真实的支付验证逻辑
      // 例如：调用后端API验证支付状态
      // const response = await fetch('/api/verify-payment', { ... });
      // const result = await response.json();
      // return result.success;
      
      // 模拟支付验证成功
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(true);
        }, 1000);
      });
    } catch (error) {
      console.error('支付验证失败:', error);
      message.error('支付验证失败，请稍后重试');
      return false;
    }
  };

  // 升级为VIP用户 - 开始支付流程
  const upgradeToPremium = () => {
    // 设置支付类型为VIP
    setPaymentType('vip');
    // 显示支付模态框
    setPaymentModalVisible(true);
    return new Promise((resolve) => {
      resolve();
    });
  };
  
  // 购买单篇文章 - 开始支付流程
  const purchaseArticle = (articleId) => {
    // 设置支付类型为单篇文章
    setPaymentType('article');
    // 设置当前正在购买的文章ID
    setCurrentArticleId(articleId);
    // 显示支付模态框
    setPaymentModalVisible(true);
    return new Promise((resolve) => {
      resolve();
    });
  };
  
  // 检查用户是否已经购买了某篇文章
  const hasPurchasedArticle = (articleId) => {
    // VIP用户可以查看所有文章
    if (isPremium) {
      return true;
    }
    // 检查是否在已购买列表中
    return purchasedArticles.includes(articleId);
  };
  
  // 关闭支付模态框
  const closePaymentModal = () => {
    setPaymentModalVisible(false);
    // 重置支付类型和当前文章ID
    setPaymentType(null);
    setCurrentArticleId(null);
  };
  
  // 完成单篇文章购买 - 支付成功后调用
  const completePurchaseArticle = async () => {
    try {
      // 1. 验证用户是否支付成功
      const isPaymentSuccessful = await validatePayment();
      
      if (!isPaymentSuccessful) {
        message.error('支付验证失败，请检查支付状态');
        return false;
      }
      
      if (!currentArticleId) {
        message.error('文章ID不能为空');
        return false;
      }
      
      // 2. 获取当前用户信息
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData?.user) {
        message.error('获取用户信息失败，请重新登录后重试');
        return false;
      }
      
      // 3. 更新用户的已购买文章列表
      const currentPurchasedArticles = userData.user.user_metadata?.purchased_articles || [];
      
      // 避免重复购买
      if (currentPurchasedArticles.includes(currentArticleId)) {
        message.success('您已经购买过这篇文章');
        return true;
      }
      
      // 添加新购买的文章ID
      const updatedPurchasedArticles = [...currentPurchasedArticles, currentArticleId];
      
      // 4. 更新Supabase用户的元数据
      const { data, error } = await supabase.auth.updateUser({
        data: {
          purchased_articles: updatedPurchasedArticles
        }
      });
      
      if (error) {
        throw error;
      }
      
      console.log('文章购买成功响应:', data);
      
      // 5. 更新本地状态
      updateUserState(data?.user);
      
      message.success('文章购买成功，您现在可以查看完整内容了');
      return true;
    } catch (error) {
      console.error('文章购买失败:', error);
      // 提供更友好的错误提示
      if (error.code === 'unauthorized') {
        message.error('登录已过期，请重新登录后重试');
      } else if (error.code === 'network') {
        message.error('网络连接失败，请检查网络后重试');
      } else {
        message.error('文章购买失败，请稍后重试');
      }
      return false;
    }
  };

  // 完成VIP升级 - 支付成功后调用
  const completeUpgradeToPremium = async () => {
    try {
      // 1. 验证用户是否支付成功
      const isPaymentSuccessful = await validatePayment();
      
      if (!isPaymentSuccessful) {
        message.error('支付验证失败，请检查支付状态');
        return false;
      }
      
      // 2. 更新Supabase用户的元数据，标记为VIP用户
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
      
      // 3. 使用updateUserState统一更新状态，确保用户名等信息一致性
      updateUserState(data?.user);
      
      message.success('恭喜！您已成功升级为VIP用户');
      return true;
    } catch (error) {
      console.error('升级VIP用户失败:', error);
      // 提供更友好的错误提示
      if (error.code === 'unauthorized') {
        message.error('登录已过期，请重新登录后重试');
      } else if (error.code === 'network') {
        message.error('网络连接失败，请检查网络后重试');
      } else {
        message.error('升级VIP用户失败，请稍后重试');
      }
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

  // 发送邮箱验证链接
  const sendEmailVerification = async () => {
    try {
      const { error } = await supabase.auth.resend({ 
        type: 'signup',
      });
      
      if (error) {
        throw error;
      }
      
      message.success('验证邮件已发送，请检查您的邮箱');
      return true;
    } catch (error) {
      console.error('发送邮箱验证失败:', error);
      message.error(`发送验证邮件失败: ${error.message}`);
      return false;
    }
  };

  // 发送密码重置邮件
  const sendPasswordResetEmail = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin
      });
      
      if (error) {
        throw error;
      }
      
      message.success('密码重置邮件已发送，请检查您的邮箱');
      return true;
    } catch (error) {
      console.error('发送密码重置邮件失败:', error);
      message.error(`发送密码重置邮件失败: ${error.message}`);
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
    isEmailVerified,
    paymentModalVisible,
    paymentType,
    currentArticleId,
    purchasedArticles,
    setPaymentModalVisible,
    login,
    logout,
    upgradeToPremium,
    completeUpgradeToPremium,
    purchaseArticle,
    completePurchaseArticle,
    hasPurchasedArticle,
    closePaymentModal,
    saveUserData,
    getUserData,
    sendEmailVerification,
    sendPasswordResetEmail
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