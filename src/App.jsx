// 从react库中导入useState钩子
import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

import './App.css';
import { Modal, Button, Spin } from 'antd';

// 从UserContext导入useUser
import { useUser } from './context/UserContext';

// 导入组件
import WelcomePage from './components/WelcomePage';
import { FaFileAlt, FaProjectDiagram, FaCommentDots } from 'react-icons/fa';
import Layout from './components/layout/Layout';
import ErrorBoundary from './components/ErrorBoundary';

// 懒加载组件
const LoginBySupabaseUsername = lazy(() => import('./components/LoginByUserName_supabase'));
const FeedbackModal = lazy(() => import('./components/FeedbackModal'));
const CommunityPage = lazy(() => import('./components/Community/CommunityPage'));
const PostDetailPage = lazy(() => import('./components/Community/PostDetailPage'));
const NotFoundPage = lazy(() => import('./components/NotFoundPage'));
const MainAppUI = lazy(() => import('./components/MainAppUI'));
const MainAppUIWrapperForDocs = lazy(() => import('./components/MainAppUIWrapperForDocs'));

export default function App() {
  const navigate = useNavigate(); // React Router's navigate hook

  const [loginVisible, setLoginVisible] = useState(false);
  const { isAuthenticated, isPremium, logout, loading, isEmailVerified, sendEmailVerification } = useUser();

  const [showWelcome, setShowWelcome] = useState(false);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [showEmailVerificationPrompt, setShowEmailVerificationPrompt] = useState(false);

  const handleOpenFeedbackModal = () => setFeedbackModalVisible(true);
  const handleCloseFeedbackModal = () => setFeedbackModalVisible(false);

  const navigationItems = [
    {
      id: 'document',
      icon: <FaFileAlt />,
      label: '文档',
      onClick: () => {
        navigate('/docs/README'); // Navigate to a docs route
      }
    },
    {
      id: 'simplemindmap',
      icon: <FaProjectDiagram />,
      label: '思维视图',
      onClick: () => navigate('/')
    },
    {
      id: 'feedback',
      icon: <FaCommentDots />,
      label: '意见反馈',
      onClick: handleOpenFeedbackModal
    }
  ];

  // Effect for welcome message and email verification
  useEffect(() => {
    if (isAuthenticated) {
      setShowWelcome(true);
      // 检查邮箱验证状态
      if (!isEmailVerified) {
        setShowEmailVerificationPrompt(true);
      }
    }
  }, [isAuthenticated, isEmailVerified]);

  const showLoginModal = () => setLoginVisible(true);
  const handleLoginSuccess = () => {
    setLoginVisible(false);
    // UserContext's login function should have already updated isAuthenticated
  };

  // 当加载中时，显示加载界面
  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner"></div>
        <p>正在加载用户信息...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <ErrorBoundary>
        <Suspense fallback={
          <div className="loading-overlay">
            <Spin size="large" tip="加载中..." />
            <p className="loading-subtext">正在为您准备最佳体验</p>
          </div>
        }>
          <Routes>
            {/* 根Route，未登录前是欢迎页，登录后是侧边栏组件 */}
            <Route path="/" element={
              isAuthenticated ? (
                <Layout navItems={navigationItems}
                  isAuthenticated={isAuthenticated}
                  isPremium={isPremium}
                  showLogin={showLoginModal}
                  logout={logout}
                  showWelcomeNotification={showWelcome}
                  onCloseWelcomeNotification={() => setShowWelcome(false)}
                />) : (
                <WelcomePage showLogin={showLoginModal} />
              )} >
              {/* Layout的子Route，登录后显示的主要应用UI */}
              <Route path="/" element={<MainAppUI isAuthenticated={isAuthenticated} isPremium={isPremium}
                logout={logout} showLogin={showLoginModal} />} />
              <Route path="/forum" element={<CommunityPage />} />
              <Route path="/forum/post/:postId" element={<PostDetailPage />} />
              {/* Example route for DocsViewer if you want to navigate to specific docs */}
              <Route path="/docs/:docName" element={
                <MainAppUIWrapperForDocs />
              } />
              <Route path="*" element={<NotFoundPage />} /> {/* 捕获所有未匹配的路由并显示404页面 */}
            </Route>
          </Routes>

          <Modal
            title=""
            open={loginVisible}
            footer={null}
            onCancel={() => setLoginVisible(false)}
            maskClosable={false}
            destroyOnHidden={true}
            width={360} // 设置Modal宽度
            style={{ borderRadius: '16px' }} // 添加圆角
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
          <Modal
            title="邮箱验证"
            open={showEmailVerificationPrompt}
            onCancel={() => setShowEmailVerificationPrompt(false)}
            footer={[
              <Button key="cancel" onClick={() => setShowEmailVerificationPrompt(false)}>
                稍后验证
              </Button>,
              <Button key="confirm" type="primary" onClick={async () => {
                try {
                  await sendEmailVerification();
                  setShowEmailVerificationPrompt(false);
                } catch (error) {
                  console.error('发送验证邮件失败:', error);
                  // 可以添加错误提示
                }
              }}>
                发送验证邮件
              </Button>
            ]}
            width={360}
            style={{ borderRadius: '16px' }}
          >
            <div style={{ padding: '20px 0' }}>
              <p style={{ marginBottom: '16px' }}>您的邮箱尚未验证，请点击下方按钮发送验证邮件。</p>
              <p style={{ fontSize: '14px', color: '#666' }}>验证邮箱后，您将可以使用完整的账号功能。</p>
            </div>
          </Modal>
          <Suspense fallback={
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <Spin size="small" tip="加载反馈组件..." />
            </div>
          }>
            <FeedbackModal visible={feedbackModalVisible} onClose={handleCloseFeedbackModal} />
          </Suspense>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}