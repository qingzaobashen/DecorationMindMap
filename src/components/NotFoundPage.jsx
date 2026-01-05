import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { FaHome } from 'react-icons/fa';

/**
 * 404页面组件
 * 用于处理所有未匹配的路由，提供友好的错误提示和导航功能
 */
const NotFoundPage = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
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
      </div>
    </div>
  );
};

export default NotFoundPage;