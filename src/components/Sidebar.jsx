/**
 * 可折叠侧边栏组件
 * 提供导航功能、用户信息展示和VIP升级入口
 * 采用现代简约专业风格，注重流畅的交互体验
 */

import React, { useState, useEffect } from 'react';
import { FaBars, FaTimes, FaUser, FaCrown } from 'react-icons/fa';
import { Button, Avatar, Tooltip, Popconfirm, Tag, Badge } from 'antd';
import { LogoutOutlined, LoginOutlined, CrownOutlined, DollarOutlined } from '@ant-design/icons';
import { useUser } from '../context/UserContext';
import { FaUserTie, FaUsers, FaBoxTissue, FaCommentDots, FaFileAlt, FaProjectDiagram } from 'react-icons/fa';

/**
 * 侧边栏组件
 * @param {Object} props - 组件属性
 * @param {Array} props.items - 导航项数组
 * @param {function} props.onLogin - 登录回调函数
 * @param {boolean} props.isAuthenticated - 登录状态
 * @param {boolean} props.isPremium - VIP用户状态
 * @param {boolean} props.isCollapsed - 侧边栏折叠状态
 * @param {function} props.onToggleCollapse - 切换折叠状态的回调函数
 */
export default function Sidebar({ items, onLogin, isAuthenticated, isPremium, isCollapsed, onToggleCollapse }) {
  // 监听屏幕宽度，用于响应式设计
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [activeItem, setActiveItem] = useState(null);
  
  const username = localStorage.getItem('username') || '用户';
  const { upgradeToPremium, logout } = useUser();
  
  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /**
   * 处理退出登录
   */
  const handleLogout = async () => {
    await logout();
    onLogin(false);
  };

  /**
   * 处理导航项点击
   * @param {Object} item - 导航项
   */
  const handleItemClick = (item) => {
    setActiveItem(item.id);
    if (item.onClick) {
      item.onClick();
    }
  };

  /**
   * 处理VIP升级
   */
  const handleUpgrade = () => {
    upgradeToPremium();
    window.dispatchEvent(new CustomEvent('showPaymentModal'));
  };

  return (
    <div className={`sidebar ${isCollapsed && !isMobile ? 'collapsed' : ''}`}>
      {/* 只在非移动设备上显示折叠按钮 */}
      {!isMobile && (
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <FaProjectDiagram />
            {!isCollapsed && <span className="logo-text">装修导图</span>}
          </div>
          <Button 
            className="toggle-btn"
            onClick={() => onToggleCollapse(!isCollapsed)}
            icon={isCollapsed ? <FaBars /> : <FaTimes />}
            type="text"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onToggleCollapse(!isCollapsed);
              }
            }}
            aria-label={isCollapsed ? "展开侧边栏" : "折叠侧边栏"}
          />
        </div>
      )}
      
      {/* 只在非移动设备上显示用户信息区域 */}
      {isAuthenticated && !isMobile && (
        <div className="user-profile">
          <Badge offset={[-5, 5]} count={isPremium ? <CrownOutlined style={{ color: '#ffd700' }} /> : 0}>
            <Avatar
              style={{ 
                backgroundColor: isPremium ? 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)' : 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                color: 'white'
              }}
              icon={isPremium ? <FaCrown /> : <FaUser />}
              size={isCollapsed ? 'default' : 'large'}
            />
          </Badge>
          {!isCollapsed && (
            <div className="user-info">
              <span className="username">{username}</span>
              {isPremium ? (
                <Tag color="gold" className="premium-tag">
                  <CrownOutlined /> VIP用户
                </Tag>
              ) : (
                <Tag color="default" className="free-tag">普通用户</Tag>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* 导航按钮区域 */}
      <div className="nav-buttons">
        {items.map((item) => (
          <Tooltip
            key={item.id}
            title={isCollapsed ? item.label : ''}
            placement="right"
          >
            <Button
              className={`nav-btn_col ${activeItem === item.id ? 'active' : ''}`}
              onClick={() => handleItemClick(item)}
              type="text"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleItemClick(item);
                }
              }}
              aria-label={item.label}
            >
              {item.icon}
              <span>{item.label}</span>
            </Button>
          </Tooltip>
        ))}
        
        {/* 添加VIP升级按钮 */}
        {isAuthenticated && !isPremium && (
          <Tooltip
            title={isCollapsed ? "升级为VIP用户" : ""}
            placement="right"
          >
            <Button 
              className="nav-btn_col upgrade-btn"
              type="text"
              onClick={handleUpgrade}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleUpgrade();
                }
              }}
              aria-label="升级为VIP用户"
            >
              <FaUserTie className="upgrade-icon" />
              <span>升级为VIP用户</span>
              {!isCollapsed && <Badge count="NEW" size="small" className="upgrade-badge" />}
            </Button>
          </Tooltip>
        )}
        
        {/* 登录/退出按钮 */}
        {isAuthenticated ? (
          <Tooltip
            title={isCollapsed ? "退出登录" : ""}
            placement="right"
          >
            <Popconfirm
              title="确定要退出登录吗？"
              okText="确定"
              cancelText="取消"
              onConfirm={handleLogout}
              placement="right"
            >
              <Button
                className="nav-btn_col logout-btn"
                type="text"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.currentTarget.click();
                  }
                }}
                aria-label="退出登录"
              >
                <FaBoxTissue />
                <span>退出登录</span>
              </Button>
            </Popconfirm>
          </Tooltip>
        ) : (
          <Tooltip
            title={isCollapsed ? "登录" : ""}
            placement="right"
          >
            <Button 
              className="nav-btn_col login-btn" 
              onClick={() => onLogin(true)}
              type="text"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onLogin(true);
                }
              }}
              aria-label="登录"
            >
              <LoginOutlined />
              <span>登录</span>
            </Button>
          </Tooltip>
        )}
      </div>

      {/* 侧边栏底部信息 */}
      {!isMobile && !isCollapsed && (
        <div className="sidebar-footer">
          <div className="footer-info">
            <p className="footer-text">© 2025 装修思维导图</p>
          </div>
        </div>
      )}
    </div>
  );
}
