/**
 * ThemeToggle - 主题切换组件
 * 提供可视化的主题切换按钮，支持亮色/深色模式切换
 * 针对移动端优化的触摸友好的设计
 */

import React from 'react';
import { Button, Tooltip } from 'antd';
import { useTheme } from '../context/ThemeContext';
import { FaMoon, FaSun } from 'react-icons/fa';

/**
 * 主题切换按钮组件
 * @param {Object} props - 组件属性
 * @param {string} props.className - 自定义类名
 * @param {string} props.size - 按钮大小: 'small' | 'medium' | 'large'
 * @param {boolean} props.showLabel - 是否显示文字标签
 */
export default function ThemeToggle({ className = '', size = 'medium', showLabel = false }) {
  const { isDarkMode, toggleTheme } = useTheme();

  // 根据尺寸设置按钮样式
  const sizeStyles = {
    small: { padding: '6px 8px', fontSize: '14px' },
    medium: { padding: '8px 12px', fontSize: '16px' },
    large: { padding: '10px 16px', fontSize: '18px' },
  };

  const iconSize = {
    small: 14,
    medium: 16,
    large: 20,
  };

  return (
    <Tooltip title={isDarkMode ? '切换到亮色模式' : '切换到深色模式'} placement="bottom">
      <Button
        className={`theme-toggle-btn ${className}`}
        onClick={toggleTheme}
        icon={
          isDarkMode ? (
            <FaSun style={{ fontSize: iconSize[size], color: '#fbbf24' }} />
          ) : (
            <FaMoon style={{ fontSize: iconSize[size], color: '#6366f1' }} />
          )
        }
        style={{
          ...sizeStyles[size],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: showLabel ? '8px' : 0,
          borderRadius: '8px',
          border: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-bg-primary)',
          color: 'var(--color-text-primary)',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        aria-label={isDarkMode ? '切换到亮色模式' : '切换到深色模式'}
      >
        {showLabel && (
          <span style={{ 
            fontSize: size === 'small' ? '12px' : size === 'medium' ? '14px' : '16px',
            marginLeft: '4px'
          }}>
            {isDarkMode ? '亮色模式' : '深色模式'}
          </span>
        )}
      </Button>
    </Tooltip>
  );
}