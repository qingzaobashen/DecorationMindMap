// 从react库中导入useState钩子
import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';

import './App.css';
import { Modal, Button, Spin } from 'antd';

import { useUser } from './context/UserContext';

import WelcomePage from './components/WelcomePage';
import SEO from './components/SEO';
import { WebSiteSchema, OrganizationSchema, ArticleSchema } from './components/Schema';
import { FaFileAlt, FaProjectDiagram, FaCommentDots } from 'react-icons/fa';
import Layout from './components/layout/Layout';
import DocsLayout from './components/DocsLayout';
import ErrorBoundary from './components/ErrorBoundary';

// 懒加载组件
const LoginBySupabaseUsername = lazy(() => import('./components/LoginByUserName_supabase'));
const FeedbackModal = lazy(() => import('./components/FeedbackModal'));
const CommunityPage = lazy(() => import('./components/Community/CommunityPage'));
const PostDetailPage = lazy(() => import('./components/Community/PostDetailPage'));
const NotFoundPage = lazy(() => import('./components/NotFoundPage'));
const MainAppUI = lazy(() => import('./components/MainAppUI'));

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [loginVisible, setLoginVisible] = useState(false);
  const { isAuthenticated, isPremium, logout, loading, isEmailVerified, sendEmailVerification } = useUser();

  const [showWelcome, setShowWelcome] = useState(false);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [showEmailVerificationPrompt, setShowEmailVerificationPrompt] = useState(false);

  const handleOpenFeedbackModal = () => setFeedbackModalVisible(true);
  const handleCloseFeedbackModal = () => setFeedbackModalVisible(false);

  // 根据路由动态生成 SEO 元数据
  const getSEOProps = () => {
    const baseUrl = 'https://qingzao.com';
    const currentUrl = `${baseUrl}${location.pathname}`;

    switch (location.pathname) {
      case '/':
        return {
          title: '装修知识导图 - 专业的装修知识库与思维导图工具',
          description: '装修知识导图提供全面的装修知识库，包括装修流程、材料选购、施工标准等专业内容。通过思维导图可视化展示装修全流程，助您轻松完成装修之旅。',
          keywords: '装修知识,装修流程,材料选购,施工标准,装修指南,装修思维导图,装修预算,装修验收',
          url: currentUrl,
          type: 'website'
        };
      case '/forum':
        return {
          title: '装修社区 - 分享装修经验与心得',
          description: '加入装修知识导图社区，与其他装修爱好者分享装修经验、交流心得、获取专业建议。',
          keywords: '装修社区,装修经验,装修心得,装修交流,装修论坛',
          url: currentUrl,
          type: 'website'
        };
      case '/docs/README':
        return {
          title: '装修文档 - 装修知识导图',
          description: '查看详细的装修文档，包括装修流程、材料选购指南、施工标准等专业知识。',
          keywords: '装修文档,装修指南,装修流程,材料选购,施工标准',
          url: currentUrl,
          type: 'article'
        };
      default:
        if (location.pathname.startsWith('/forum/post/')) {
          return {
            title: '装修帖子详情 - 装修知识导图',
            description: '查看装修社区中的详细帖子内容，获取更多装修经验和建议。',
            keywords: '装修帖子,装修经验,装修建议',
            url: currentUrl,
            type: 'article'
          };
        }
        if (location.pathname.startsWith('/docs/')) {
          return {
            title: '装修知识文档 - 装修知识导图',
            description: '查看装修相关的专业知识文档，提升您的装修技能。',
            keywords: '装修知识,装修文档,装修指南',
            url: currentUrl,
            type: 'article'
          };
        }
        return {
          title: '装修知识导图 - 专业的装修知识库与思维导图工具',
          description: '装修知识导图提供全面的装修知识库，包括装修流程、材料选购、施工标准等专业内容。',
          keywords: '装修知识,装修流程,材料选购,施工标准,装修指南',
          url: currentUrl,
          type: 'website'
        };
    }
  };

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
      <SEO {...getSEOProps()} />
      <WebSiteSchema />
      <OrganizationSchema />
      <ErrorBoundary>
        <Suspense fallback={
          <div className="loading-overlay">
            <Spin size="large" tip="加载中..." />
            <p className="loading-subtext">正在为您准备最佳体验</p>
          </div>
        }>
          <Routes>
            {/* 文档页面 - 使用 DocsLayout，显示侧边栏 */}
            <Route path="/docs/:docName" element={
              <DocsLayout />
            } />
            
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
            </Route>
            <Route path="*" element={<NotFoundPage />} /> {/* 捕获所有未匹配的路由并显示404页面 */}
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