import React from 'react';
import { Button, Card, Row, Col, Typography, Divider, Space, message } from 'antd';
import { UserOutlined, FileTextOutlined, TeamOutlined, GlobalOutlined, CrownOutlined, InfoCircleOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
const { Title, Paragraph, Text } = Typography;

/**
 * 欢迎页组件 - 应用的入口页面
 * 提供系统介绍、核心功能展示、登录入口和演示模式
 */
const WelcomePage = ({ showLogin }) => {
  const { login } = useUser();
  const navigate = useNavigate();

  // 处理登录按钮点击
  const handleLoginClick = () => {
    if (showLogin) {
      showLogin();
    }
  };

  // 处理演示模式登录
  const handleDemoLogin = (path) => {
    // 使用演示账号登录
    login({
      token: 'demo_token',
      username: 'demo',
      isPremium: false
    });
    message.success('演示模式登录成功！');
    navigate(path || '/');
  };

  // 处理VIP演示模式登录
  const handlePremiumDemoLogin = () => {
    // 使用VIP演示账号登录
    login({
      token: 'premium_demo_token',
      username: 'premium_demo',
      isPremium: true
    });
    message.success('VIP演示模式登录成功！');
    navigate('/');
  };

  return (
    <div className="welcome-page-container">
      {/* 顶部英雄区域 */}
      <div className="hero-section">
        <Title className="welcome-title">装修思维导图系统</Title>
        <Paragraph className="welcome-subtitle">
          思维导图式装修知识树，一站式掌握家装要领
        </Paragraph>
        <Space className="welcome-actions">
          <Button 
            type="primary" 
            size="large" 
            onClick={handleLoginClick}
            icon={<UserOutlined />}
          >
            登录 / 注册
          </Button>
        </Space>
        <div className="demo-info">
          <InfoCircleOutlined /> 
          <Text>演示账号: demo/demo | VIP演示账号: premium/premium</Text>
        </div>
      </div>

      {/* 核心功能展示区域 */}
      <div className="features-section">
        <Title level={2}>核心功能</Title>
        <Row gutter={[16, 16]} className="features-grid">
          <Col xs={24} md={8}>
            <Card 
              hoverable 
              className="feature-card"
              cover={<div className="feature-icon"><GlobalOutlined /></div>}
            >
              <Card.Meta 
                title="思维导图可视化" 
                description="直观地展示装修全流程的知识，从设计到施工的每个环节你都是专家"
              />
              <Button 
                type="link" 
                className="feature-action" 
                onClick={() => handleDemoLogin()}
                icon={<ArrowRightOutlined />}
              >
                体验装修思维导图
              </Button>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card 
              hoverable 
              className="feature-card"
              cover={<div className="feature-icon"><FileTextOutlined /></div>}
            >
              <Card.Meta 
                title="文档中心" 
                description="查阅详细的装修知识、材料选购指南和施工标准"
              />
              <Button 
                type="link" 
                className="feature-action" 
                onClick={() => handleDemoLogin('/docs/README')}
                icon={<ArrowRightOutlined />}
              >
                浏览文档
              </Button>
            </Card>
          </Col>
          {/* <Col xs={24} md={8}>
            <Card 
              hoverable 
              className="feature-card"
              cover={<div className="feature-icon"><TeamOutlined /></div>}
            >
              <Card.Meta 
                title="社区交流" 
                description="与其他业主交流经验，分享装修心得和避坑指南"
              />
              <Button 
                type="link" 
                className="feature-action" 
                onClick={() => navigate('/forum')}
                icon={<ArrowRightOutlined />}
              >
                加入社区
              </Button>
            </Card>
          </Col> */}
        </Row>
      </div>

      {/* 会员特权展示 */}
      <div className="premium-section">
        <Title level={2}>VIP会员特权</Title>
        <Card className="premium-card">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={16}>
              <Space direction="vertical">
                <div className="premium-feature">
                  <CrownOutlined className="premium-icon" /> 
                  <span>思维导图自定义编辑与储存</span>
                </div>
                <div className="premium-feature">
                  <CrownOutlined className="premium-icon" /> 
                  <span>更多装修知识文档访问权限</span>
                </div>
                <div className="premium-feature">
                  <CrownOutlined className="premium-icon" /> 
                  <span>装修相关文档与表格任意下载</span>
                </div>
              </Space>
            </Col>
            <Col xs={24} md={8}>
              <Button 
                type="primary" 
                size="large" 
                className="premium-demo-btn"
                onClick={handlePremiumDemoLogin}
                block
              >
                体验VIP功能
              </Button>
            </Col>
          </Row>
        </Card>
      </div>

      {/* 页脚 */}
      <footer className="welcome-footer">
        <Divider />
        <Paragraph className="footer-text">
          © 2025 装修思维导图系统 - 让装修更简单
        </Paragraph>
      </footer>
    </div>
  );
};

export default WelcomePage;