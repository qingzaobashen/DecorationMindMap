import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar';
import UserWelcome from '../UserWelcome';
import ThemeToggle from '../ThemeToggle';

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
  const navigate = useNavigate();
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

      {/* 主题切换按钮 - 移动端友好 */}
      <div className="theme-toggle-container" style={{
        position: 'fixed',
        top: isMobile ? '2px' : '10px',
        right: isMobile ? '5px' : '20px',
        zIndex: 1001,
      }}>
        <ThemeToggle size="medium" />
      </div>

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
        {/* 底部页脚 - 法律与合规链接 */}
        <footer style={{
          padding: '24px 20px',
          textAlign: 'center',
          borderTop: '1px solid var(--color-border, #e8e8e8)',
          marginTop: 'auto',
          backgroundColor: 'var(--color-bg-primary, #fafafa)'
        }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '16px',
            marginBottom: '8px'
          }}>
            <a onClick={() => navigate('/privacy')} style={{
              color: 'var(--color-text-secondary, #666)',
              fontSize: '0.85rem',
              cursor: 'pointer',
              textDecoration: 'none',
              transition: 'color 0.2s'
            }} onMouseEnter={(e) => e.target.style.color = 'var(--color-primary, #1890ff)'}
               onMouseLeave={(e) => e.target.style.color = 'var(--color-text-secondary, #666)'}>
              隐私政策
            </a>
            <a onClick={() => navigate('/terms')} style={{
              color: 'var(--color-text-secondary, #666)',
              fontSize: '0.85rem',
              cursor: 'pointer',
              textDecoration: 'none',
              transition: 'color 0.2s'
            }} onMouseEnter={(e) => e.target.style.color = 'var(--color-primary, #1890ff)'}
               onMouseLeave={(e) => e.target.style.color = 'var(--color-text-secondary, #666)'}>
              使用条款
            </a>
            <a onClick={() => navigate('/about')} style={{
              color: 'var(--color-text-secondary, #666)',
              fontSize: '0.85rem',
              cursor: 'pointer',
              textDecoration: 'none',
              transition: 'color 0.2s'
            }} onMouseEnter={(e) => e.target.style.color = 'var(--color-primary, #1890ff)'}
               onMouseLeave={(e) => e.target.style.color = 'var(--color-text-secondary, #666)'}>
              关于我们
            </a>
            <a onClick={() => navigate('/contact')} style={{
              color: 'var(--color-text-secondary, #666)',
              fontSize: '0.85rem',
              cursor: 'pointer',
              textDecoration: 'none',
              transition: 'color 0.2s'
            }} onMouseEnter={(e) => e.target.style.color = 'var(--color-primary, #1890ff)'}
               onMouseLeave={(e) => e.target.style.color = 'var(--color-text-secondary, #666)'}>
              联系我们
            </a>
          </div>
          <p style={{
            margin: 0,
            fontSize: '0.8rem',
            color: 'var(--color-text-tertiary, #999)'
          }}>
            &copy; {new Date().getFullYear()} decoration.qingzao.site 装修知识思维导图 版权所有
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Layout;