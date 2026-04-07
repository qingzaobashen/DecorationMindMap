import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { FaHome, FaFileAlt, FaProjectDiagram } from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';

/**
 * 404页面组件
 * 用于处理所有未匹配的路由，提供友好的错误提示和导航功能
 */
const NotFoundPage = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoToDocs = () => {
    navigate('/docs/README');
  };

  const handleGoToMindMap = () => {
    navigate('/');
  };

  return (
    <>
      <Helmet>
        <title>页面未找到 - 404 | 装修知识思维导图</title>
        <meta name="description" content="抱歉，您访问的页面不存在或已被移除。请返回首页或浏览文档中心。" />
        <meta name="robots" content="noindex, nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href="https://www.qingzao.site/404" />
      </Helmet>
      <div className="not-found-container">
        <div className="not-found-content">
          <div className="not-found-number">404</div>
          <h1 className="not-found-title">页面未找到</h1>
          <p className="not-found-description">
            抱歉，您访问的页面不存在或已被移除。
          </p>
          <div className="not-found-actions">
            <Button
              type="primary"
              size="large"
              onClick={handleGoHome}
              icon={<FaHome />}
            >
              返回首页
            </Button>
          </div>
          <div className="not-found-suggestions">
            <p className="suggestions-title">您可以：</p>
            <div className="suggestion-links">
              <Button
                onClick={handleGoToDocs}
                icon={<FaFileAlt />}
                className="suggestion-btn"
              >
                浏览文档中心
              </Button>
              <Button
                onClick={handleGoToMindMap}
                icon={<FaProjectDiagram />}
                className="suggestion-btn"
              >
                查看装修思维导图
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFoundPage;