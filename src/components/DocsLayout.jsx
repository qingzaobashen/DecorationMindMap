import React, { useState, lazy, Suspense } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { Modal, Spin } from 'antd';
import Sidebar from './Sidebar';
import DocsViewer from './DocsViewer';
import { FaFileAlt, FaProjectDiagram, FaCommentDots } from 'react-icons/fa';
import FeedbackModal from './FeedbackModal';
import { useUser } from '../context/UserContext';

// 懒加载登录组件
const LoginBySupabaseUsername = lazy(() => import('./LoginByUserName_supabase'));

/**
 * 文档页面布局组件
 * 为文档页面提供侧边栏和文档查看器
 * @param {Object} props - 组件属性
 */
function DocsLayout() {
  const { docName: rawDocNameFromParams } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, logout, isPremium } = useUser();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [loginVisible, setLoginVisible] = useState(false);
  
  // 监听窗口大小变化
  useState(() => {
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

  // 处理反馈模态框
  const handleOpenFeedbackModal = () => setFeedbackModalVisible(true);
  const handleCloseFeedbackModal = () => setFeedbackModalVisible(false);

  // 处理登录模态框
  const handleOpenLoginModal = () => setLoginVisible(true);
  const handleCloseLoginModal = () => setLoginVisible(false);

  // 处理登录成功
  const handleLoginSuccess = () => {
    setLoginVisible(false);
    // 登录成功后刷新页面以获取新的认证状态
    window.location.reload();
  };

  // 处理退出登录
  const handleLogout = async () => {
    await logout();
    // 退出登录后刷新页面
    window.location.reload();
  };

  // Ensure docName always has .md, and handle cases where it might be undefined
  const docName = rawDocNameFromParams || 'README';

  // Construct path for fetching - 使用相对路径
  const finalDocPath = `/docs/${docName}`;

  // 处理文档导航
  const handleDocNavigate = (newPath) => {
    if (newPath.startsWith('/docs/')) {
      navigate(newPath);
    } else if (newPath.startsWith('/')) {
      navigate(`/docs${newPath}`);
    } else {
      navigate(`/docs/${newPath}`);
    }
  };

  // 处理侧边栏导航项点击
  const handleNavItemClick = (item) => {
    switch (item.id) {
      case 'document':
        // 文档按钮 - 已经在文档页面，不操作
        break;
      case 'simplemindmap':
        // 思维视图按钮 - 导航到首页
        navigate('/');
        break;
      case 'feedback':
        // 意见反馈按钮 - 显示反馈模态框
        handleOpenFeedbackModal();
        break;
      default:
        break;
    }
  };

  // 文档页面的导航项
  const navigationItems = [
    {
      id: 'document',
      icon: <FaFileAlt />,
      label: '文档',
      onClick: () => {
         navigate('/docs/README');
      }
    },
    {
      id: 'simplemindmap',
      icon: <FaProjectDiagram />,
      label: '思维视图',
      onClick: () => {
        navigate('/');
      }
    },
    {
      id: 'feedback',
      icon: <FaCommentDots />,
      label: '意见反馈',
      onClick: () => {
        if (isAuthenticated) {
          handleOpenFeedbackModal();
        }else{
          setLoginVisible(true);
        }
      }
    }
  ];

  return (
    <div className="app-layout">
      {/* 侧边栏 */}
      <aside className="sidebar-container">
        <Sidebar
          items={navigationItems}
          onLogin={isAuthenticated ? handleLogout : handleOpenLoginModal}
          isAuthenticated={isAuthenticated}
          isPremium={isPremium}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />
      </aside>

      {/* 文档内容 */}
      <div className={`main-content ${isSidebarCollapsed && !isMobile ? 'expanded' : ''}`}>
        <main className="mindmap-wrapper mindWrapper-size docs-view-active">
          {/* 显示文档标题 */}
          <header className="view-header">
            <h2>文档中心: {docName.replace('.md', '')}</h2>
          </header>
          
          {/* 文档查看器 */}
          <DocsViewer docPath={finalDocPath} onNavigate={handleDocNavigate} />
        </main>
      </div>
      
      {/* 反馈模态框 */}
      <FeedbackModal visible={feedbackModalVisible} onClose={handleCloseFeedbackModal} />

      {/* 登录模态框 */}
      <Modal
        title=""
        open={loginVisible}
        footer={null}
        onCancel={handleCloseLoginModal}
        maskClosable={false}
        destroyOnHidden={true}
        width={360}
        style={{ borderRadius: '16px' }}
        wrapClassName="login-modal"
      >
        <Suspense fallback={
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <Spin size="small" tip="加载登录组件..." />
          </div>
        }>
          <LoginBySupabaseUsername onSuccess={handleLoginSuccess} />
        </Suspense>
      </Modal>
    </div>
  );
}

export default DocsLayout;