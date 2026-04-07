import React, { useState, lazy, Suspense, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Modal, Spin, Breadcrumb } from 'antd';
import Sidebar from './Sidebar';
import DocsViewer from './DocsViewer';
import { FaFileAlt, FaProjectDiagram, FaCommentDots } from 'react-icons/fa';
import FeedbackModal from './FeedbackModal';
import { useUser } from '../context/UserContext';
import { ArticleSchema, BreadcrumbSchema } from './Schema';
import { Helmet } from 'react-helmet-async';

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

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const docName = rawDocNameFromParams || 'README';
  const finalDocPath = `/docs/${docName}`;
  const baseUrl = 'https://www.qingzao.site';
  const currentUrl = `${baseUrl}/docs/${docName}`;

  const docTitles = {
    'README': '文档中心',
    'budget-planning': '装修预算规划指南',
    'company-selection': '装修公司挑选指南',
    'construction-guide': '装修施工标准指南',
    'design-overview': '装修设计概述',
    'design-detail': '装修设计详解',
    'material-selection': '装修材料选购指南'
  };

  const docDescriptions = {
    'README': '装修知识思维导图文档中心，提供全面的装修知识库。',
    'budget-planning': '详细介绍如何制定装修预算，控制装修开支，避免装修超支。',
    'company-selection': '全面指导如何选择靠谱的装修公司，避免装修陷阱，包含选择装修公司的标准和建议。',
    'construction-guide': '装修施工标准指南，包含水电、泥瓦、木工、油工等各工序标准。',
    'design-overview': '装修设计概述，帮助您了解装修设计的基本流程和要点。',
    'design-detail': '装修设计详解，深入探讨室内设计细节与空间规划。',
    'material-selection': '装修材料选购指南，教您如何挑选瓷砖、地板、门窗等材料。'
  };

  const docKeywords = {
    'README': '装修知识,装修导图,装修文档,家装,家居',
    'budget-planning': '装修预算,预算规划,装修费用,装修报价,预算控制',
    'company-selection': '装修公司,公司选择,装修挑选,装修招标,装修合同',
    'construction-guide': '装修施工,施工标准,水电改造,泥瓦工程,木工,油工',
    'design-overview': '装修设计,设计方案,室内设计,空间规划',
    'design-detail': '装修设计,设计细节,空间规划,室内布局',
    'material-selection': '装修材料,材料选购,瓷砖,地板,门窗,橱柜'
  };

  const currentTitle = docTitles[docName] || `${docName} - 装修知识导图`;
  const currentDescription = docDescriptions[docName] || `${docName}相关装修知识，帮助您轻松完成装修。`;
  const currentKeywords = docKeywords[docName] || `装修,${docName},装修知识,装修导图`;

  const breadcrumbItems = [
    { name: '首页', url: `${baseUrl}/` },
    { name: '文档中心', url: `${baseUrl}/docs/README` },
    { name: docTitles[docName] || docName, url: currentUrl }
  ];

  const breadcrumbSchemaItems = [
    { name: '首页', url: `${baseUrl}/` },
    { name: '文档中心', url: `${baseUrl}/docs/README` },
    { name: docTitles[docName] || docName, url: currentUrl }
  ];

  const today = new Date().toISOString().split('T')[0];

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
    navigate('/');// 暂时先导航到首页，等处理好了未登录状态的文档页面加载问题后再改回来
    // 退出登录后刷新页面
    //window.location.reload();
  };


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
    <>
      <Helmet>
        <title>{currentTitle}</title>
        <meta name="description" content={currentDescription} />
        <meta name="keywords" content={currentKeywords} />
        <link rel="canonical" href={currentUrl} />
        <meta property="og:title" content={currentTitle} />
        <meta property="og:description" content={currentDescription} />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={currentTitle} />
        <meta name="twitter:description" content={currentDescription} />
      </Helmet>

      <ArticleSchema
        title={currentTitle}
        description={currentDescription}
        url={currentUrl}
        datePublished="2025-01-01"
        dateModified={today}
      />

      <BreadcrumbSchema items={breadcrumbSchemaItems} />

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
            <Breadcrumb
              className="docs-breadcrumb"
              items={breadcrumbItems.map((item, index) => ({
                key: index,
                title: index < breadcrumbItems.length - 1 ? (
                  <a onClick={() => navigate(item.url.replace(baseUrl, ''))}>{item.name}</a>
                ) : item.name
              }))}
            />
            <header className="view-header">
              <h2>{docTitles[docName] || '文档中心'}</h2>
            </header>

            <DocsViewer docPath={finalDocPath} onNavigate={handleDocNavigate} />
          </main>
        </div>

        <FeedbackModal visible={feedbackModalVisible} onClose={handleCloseFeedbackModal} />

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
    </>
  );
}

export default DocsLayout;