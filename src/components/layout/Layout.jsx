import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar';
import UserWelcome from '../UserWelcome';

/**
 * 带侧边栏的布局组件
 * 用于包裹需要显示侧边栏的页面组件
 * @param {Object} props - 组件属性
 * @param {Array} props.navItems - 导航项数组
 * @param {boolean} props.isAuthenticated - 登录状态
 * @param {boolean} props.isPremium - VIP用户状态
 * @param {function} props.showLogin - 显示登录模态框的函数
 * @param {function} props.logout - 退出登录函数
 * @param {boolean} props.showWelcomeNotification - 是否显示欢迎通知
 * @param {function} props.onCloseWelcomeNotification - 关闭欢迎通知的回调函数
 */
const Layout = ({
  navItems,
  isAuthenticated,
  isPremium,
  showLogin,
  logout,
  showWelcomeNotification = false,
  onCloseWelcomeNotification
}) => {
  // 侧边栏折叠状态
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  // 屏幕宽度状态
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 处理侧边栏折叠状态切换
  const handleToggleCollapse = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  return (
    <div className="app-layout">
      {/* 欢迎通知 */}
      {showWelcomeNotification && (
        <UserWelcome
          isVisible={showWelcomeNotification}
          onClose={onCloseWelcomeNotification}
        />
      )}

      {/* 侧边栏 */}
      <aside className="sidebar-container">
        <Sidebar
          items={navItems}
          onLogin={(status) => status ? showLogin() : logout()}
          isAuthenticated={isAuthenticated}
          isPremium={isPremium}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />
      </aside>

      {/* 子路由内容 */}
      <div className={`main-content ${isSidebarCollapsed && !isMobile ? 'expanded' : ''}`}>
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;