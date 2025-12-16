import React, { useState, useEffect } from 'react';
import { FaBars, FaTimes, FaUser, FaCrown } from 'react-icons/fa';
import { Button, Avatar, Tooltip, Popconfirm, Tag } from 'antd';
import { LogoutOutlined, LoginOutlined, CrownOutlined, DollarOutlined } from '@ant-design/icons';
import { useUser } from '../context/UserContext';
import { FaUserTie, FaUsers, FaBoxTissue, FaCommentDots } from 'react-icons/fa';

/**
 * 可折叠侧边栏组件
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
  
  //const [isCollapsed, setIsCollapsed] = useState(false);
  const username = localStorage.getItem('username') || '用户';
  const { upgradeToPremium, logout } = useUser(); // 使用UserContext中的方法
  
  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // 添加事件监听器
    window.addEventListener('resize', handleResize);
    
    // 清理事件监听器
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 处理退出登录
  const handleLogout = async () => {
    await logout(); // 调用UserContext的登出方法，触发完整登出流程
    onLogin(false); // 通知父组件更新登录状态
  };

  return (
    <div className={`sidebar ${isCollapsed && !isMobile ? 'collapsed' : ''}`}>
      {/* 只在非移动设备上显示折叠按钮 */}
      {!isMobile && (
        <div className="sidebar-header">
          <Button 
            className="toggle-btn"
            onClick={() => onToggleCollapse(!isCollapsed)}
            icon={isCollapsed ? <FaBars /> : <FaTimes />}
            type="text"
          />
        </div>
      )}
      
      {/* 只在非移动设备上显示用户信息区域 */}
      {isAuthenticated && !isMobile && (
        <div className="user-profile">
          <Avatar
            style={{ backgroundColor: isPremium ? '#ffd700' : '#1890ff' }}
            icon={isPremium ? <FaCrown /> : <FaUser />}
            size={isCollapsed || isMobile ? 'small' : 'default'}
          />
          {!isCollapsed && !isMobile && (
            <div className="user-info">
              <span className="username">{username}</span>
              {isPremium && <Tag color="gold" className="premium-tag">VIP用户</Tag>}
            </div>
          )}
        </div>
      )}
      
      <div className="nav-buttons">
        {items.map((item) => (
          <Tooltip
            key={item.id}
            title={isCollapsed ? item.label : ''}
            placement="right"
          >
            <Button
              className="nav-btn_col"
              onClick={item.onClick}
              type="text"
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
              onClick={upgradeToPremium}
            >
              <FaUserTie className="upgrade-icon" />
              <span>升级为VIP用户</span>
            </Button>
          </Tooltip>
        )}
        
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
              className="nav-btn_col" 
              onClick={() => onLogin(true)}
              type="text"
            >
              <LoginOutlined />
              <span>登录</span>
            </Button>
          </Tooltip>
        )}
      </div>
    </div>
  );
}