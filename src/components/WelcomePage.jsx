/**
 * 欢迎页组件 - 应用的入口页面
 * 提供系统介绍、核心功能展示、登录入口和演示模式
 * 采用现代简约专业风格，注重视觉冲击力和流畅的交互体验
 */

import React, { useEffect, useState } from 'react';
import { Button, Card, Row, Col, Typography, Divider, Space, message } from 'antd';
import { UserOutlined, FileTextOutlined, GlobalOutlined, CrownOutlined, InfoCircleOutlined, ArrowRightOutlined, ThunderboltOutlined, SafetyOutlined, RocketOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const { Title, Paragraph, Text } = Typography;

/**
 * 欢迎页组件
 * @param {Object} props - 组件属性
 * @param {function} props.showLogin - 显示登录模态框的函数
 */
const WelcomePage = ({ showLogin }) => {
  const { login } = useUser();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  // 组件挂载后触发动画
  useEffect(() => {
    setMounted(true);
  }, []);

  /**
   * 处理登录按钮点击
   */
  const handleLoginClick = () => {
    if (showLogin) {
      showLogin();
    }
  };

  /**
   * 处理演示模式登录
   * @param {string} path - 导航路径
   */
  const handleDemoLogin = (path) => {
    login({
      token: 'demo_token',
      username: 'demo',
      isPremium: false
    });
    message.success('演示模式登录成功！');
    navigate(path || '/');
  };

  /**
   * 处理VIP演示模式登录
   */
  const handlePremiumDemoLogin = () => {
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
      {/* 动态背景装饰 */}
      <div className="background-decoration">
        <div className="decoration-circle circle-1"></div>
        <div className="decoration-circle circle-2"></div>
        <div className="decoration-circle circle-3"></div>
      </div>

      {/* 顶部英雄区域 */}
      <div className={`hero-section ${mounted ? 'mounted' : ''}`}>
        {/* 思维导图背景装饰 */}
        <div className="mindmap-bg-decoration">
          <svg viewBox="0 0 800 600" className="mindmap-bg-svg">
            {/* 中心节点 */}
            <circle cx="400" cy="300" r="50" fill="#1890ff" opacity="0.8"/>
            <text x="400" y="305" textAnchor="middle" fill="white" fontSize="12">装修</text>
            {/* 一级分支 */}
            <circle cx="250" cy="150" r="35" fill="#52c41a" opacity="0.7"/>
            <text x="250" y="155" textAnchor="middle" fill="white" fontSize="10">设计</text>
            <line x1="365" y1="265" x2="285" y2="175" stroke="#1890ff" strokeWidth="2" opacity="0.5"/>

            <circle cx="550" cy="150" r="35" fill="#fa8c16" opacity="0.7"/>
            <text x="550" y="155" textAnchor="middle" fill="white" fontSize="10">预算</text>
            <line x1="435" y1="265" x2="515" y2="175" stroke="#1890ff" strokeWidth="2" opacity="0.5"/>

            <circle cx="250" cy="450" r="35" fill="#f5222d" opacity="0.7"/>
            <text x="250" y="455" textAnchor="middle" fill="white" fontSize="10">施工</text>
            <line x1="365" y1="335" x2="285" y2="425" stroke="#1890ff" strokeWidth="2" opacity="0.5"/>

            <circle cx="550" cy="450" r="35" fill="#722ed1" opacity="0.7"/>
            <text x="550" y="455" textAnchor="middle" fill="white" fontSize="10">验收</text>
            <line x1="435" y1="335" x2="515" y2="425" stroke="#1890ff" strokeWidth="2" opacity="0.5"/>

            {/* 二级分支 */}
            <circle cx="120" cy="100" r="25" fill="#13c2c2" opacity="0.6"/>
            <text x="120" y="105" textAnchor="middle" fill="white" fontSize="8">方案</text>
            <line x1="225" y1="135" x2="145" y2="115" stroke="#52c41a" strokeWidth="1.5" opacity="0.4"/>

            <circle cx="380" cy="80" r="25" fill="#13c2c2" opacity="0.6"/>
            <text x="380" y="85" textAnchor="middle" fill="white" fontSize="8">风格</text>
            <line x1="270" y1="130" x2="355" y2="95" stroke="#52c41a" strokeWidth="1.5" opacity="0.4"/>

            <circle cx="680" cy="100" r="25" fill="#13c2c2" opacity="0.6"/>
            <text x="680" y="105" textAnchor="middle" fill="white" fontSize="8">主材</text>
            <line x1="535" y1="135" x2="655" y2="115" stroke="#fa8c16" strokeWidth="1.5" opacity="0.4"/>

            <circle cx="680" cy="200" r="25" fill="#13c2c2" opacity="0.6"/>
            <text x="680" y="205" textAnchor="middle" fill="white" fontSize="8">人工</text>
            <line x1="555" y1="165" x2="655" y2="185" stroke="#fa8c16" strokeWidth="1.5" opacity="0.4"/>

            <circle cx="120" cy="500" r="25" fill="#13c2c2" opacity="0.6"/>
            <text x="120" y="505" textAnchor="middle" fill="white" fontSize="8">水电</text>
            <line x1="225" y1="465" x2="145" y2="485" stroke="#f5222d" strokeWidth="1.5" opacity="0.4"/>

            <circle cx="380" cy="520" r="25" fill="#13c2c2" opacity="0.6"/>
            <text x="380" y="525" textAnchor="middle" fill="white" fontSize="8">泥木</text>
            <line x1="270" y1="470" x2="355" y2="505" stroke="#f5222d" strokeWidth="1.5" opacity="0.4"/>

            <circle cx="680" cy="500" r="25" fill="#13c2c2" opacity="0.6"/>
            <text x="680" y="505" textAnchor="middle" fill="white" fontSize="8">软装</text>
            <line x1="555" y1="465" x2="655" y2="485" stroke="#722ed1" strokeWidth="1.5" opacity="0.4"/>

            <circle cx="680" cy="400" r="25" fill="#13c2c2" opacity="0.6"/>
            <text x="680" y="405" textAnchor="middle" fill="white" fontSize="8">保洁</text>
            <line x1="555" y1="435" x2="655" y2="415" stroke="#722ed1" strokeWidth="1.5" opacity="0.4"/>
          </svg>
        </div>
        <div className="hero-badge">
          <ThunderboltOutlined />
          <span>全新升级 v2.0</span>
        </div>
        <Title className="welcome-title">
          装修思维导图系统
        </Title>
        <Paragraph className="welcome-subtitle">
          思维导图式装修知识树，一图搞定装修全流程！
        </Paragraph>
        <div className="hero-features">
          <div className="hero-feature">
            <SafetyOutlined />
            <span>专业可靠</span>
          </div>
          <div className="hero-feature">
            <RocketOutlined />
            <span>高效便捷</span>
          </div>
          <div className="hero-feature">
            <GlobalOutlined />
            <span>全面覆盖</span>
          </div>
        </div>
        <Space className="welcome-actions" size="large">
          <Button 
            type="primary" 
            size="large" 
            onClick={handleLoginClick}
            icon={<UserOutlined />}
            className="hero-button primary-button"
          >
            登录 / 注册
          </Button>
        </Space>
        <div className="hero-intro">
          <Paragraph className="intro-text">
            登录后解锁完整体验
          </Paragraph>
          <div className="intro-stats">
            <div className="stat-item">
              <span className="stat-number">100+</span>
              <span className="stat-label">装修知识点</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">20+</span>
              <span className="stat-label">实用工具</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">1000+</span>
              <span className="stat-label">用户信赖</span>
            </div>
          </div>
        </div>
      </div>

      {/* 核心功能展示区域 */}
      <div className={`features-section ${mounted ? 'mounted' : ''}`}>
        <Title level={2} className="section-title">
          核心功能
        </Title>
        <Paragraph className="section-subtitle">
          强大的功能集合，助您轻松完成装修之旅
        </Paragraph>
        <Row gutter={[24, 24]} className="features-grid">
          <Col xs={24} md={12}>
            <Card 
              hoverable 
              className="feature-card"
              bordered={false}
            >
              <div className="feature-icon-wrapper">
                <div className="feature-icon">
                  <GlobalOutlined />
                </div>
              </div>
              <Card.Meta 
                title={<span className="feature-title">思维导图可视化</span>}
                description={
                  <div className="feature-description">
                    直观地展示装修全流程的知识，从设计到施工的每个环节你都是专家
                  </div>
                }
              />
              <div className="feature-preview">
                <div className="preview-placeholder mindmap-preview">
                  <div className="preview-icon">
                    <GlobalOutlined />
                  </div>
                  <div className="preview-content">
                    <div className="preview-title">装修思维导图预览</div>
                    <div className="preview-items">
                      <span className="preview-item">前期准备</span>
                      <span className="preview-item">设计阶段</span>
                      <span className="preview-item">施工阶段</span>
                      <span className="preview-item">验收阶段</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card 
              hoverable 
              className="feature-card"
              bordered={false}
            >
              <div className="feature-icon-wrapper">
                <div className="feature-icon">
                  <FileTextOutlined />
                </div>
              </div>
              <Card.Meta 
                title={<span className="feature-title">文档中心</span>}
                description={
                  <div className="feature-description">
                    查阅详细的装修知识、材料选购指南和施工标准
                  </div>
                }
              />
              <div className="feature-preview">
                <div className="preview-placeholder docs-preview">
                  <div className="preview-icon">
                    <FileTextOutlined />
                  </div>
                  <div className="preview-content">
                    <div className="preview-title">精选文档预览</div>
                    <div className="preview-items">
                      <span className="preview-item">材料选购指南</span>
                      <span className="preview-item">施工工艺标准</span>
                      <span className="preview-item">预算控制技巧</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* 会员特权展示 */}
      <div className={`premium-section ${mounted ? 'mounted' : ''}`}>
        <div className="premium-container">
          <div className="premium-header">
            <CrownOutlined className="premium-crown" />
            <Title level={2} className="premium-title">
              VIP会员特权
            </Title>
            <Paragraph className="premium-subtitle">
              解锁更多高级功能，享受专属服务
            </Paragraph>
          </div>
          <Card className="premium-card" bordered={false}>
            <Row gutter={[24, 16]}>
              {/* <Col xs={24} md={8}>
                <div className="premium-feature-card">
                  <div className="premium-feature-icon">
                    <CrownOutlined />
                  </div>
                  <h4>思维导图更多装修VIP内容</h4>
                  <p>创建个性化的装修思维导图，随时保存和编辑，打造专属知识库</p>
                  <ul className="feature-list">
                    <li>支持多层级节点编辑</li>
                    <li>云端自动保存</li>
                    <li>导出多种格式</li>
                  </ul>
                </div>
              </Col> */}
              <Col xs={24} md={12}>
                <div className="premium-feature-card">
                  <div className="premium-feature-icon">
                    <CrownOutlined />
                  </div>
                  <h4>思维导图更多装修VIP内容</h4>
                  <p>访问完整的装修知识库，获取专业教程，成为装修专家</p>
                  <ul className="feature-list">
                    <li>专业知识文档</li>
                    <li>随身装修知识库</li>
                  </ul>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div className="premium-feature-card">
                  <div className="premium-feature-icon">
                    <CrownOutlined />
                  </div>
                  <h4>装修相关文档与表格下载</h4>
                  <p>下载20+装修表格、清单和模板，提高装修效率</p>
                  <ul className="feature-list">
                    <li>预算表格模板</li>
                    <li>施工流程表</li>
                    <li>商家调研表</li>
                  </ul>
                </div>
              </Col>
            </Row>
            <div className="premium-price-section">
              <div className="premium-price">
                <span className="price-label">VIP会员</span>
                <span className="price-value">¥15.00</span>
                <span className="price-unit">/120天(限时)</span>
              </div>
              <div className="premium-features-summary">
                <span className="summary-item">✓ 全面</span>
                <span className="summary-item">✓ 实用</span>
                <span className="summary-item">✓ 专业</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* 页脚 */}
      <footer className="welcome-footer">
        <Divider />
        <Paragraph className="footer-text">
          © 2026 装修思维导图系统 - 让装修更简单！
        </Paragraph>
        <Paragraph className="footer-text-low">
          版权所有：@青枣
        </Paragraph>
      </footer>
    </div>
  );
};

export default WelcomePage;
