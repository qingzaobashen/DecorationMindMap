/**
 * ThemeContext - 主题上下文
 * 提供夜间模式状态管理和切换功能
 * 支持亮色模式和深色模式的平滑切换
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(undefined);

export function ThemeProvider({ children }) {
  // 从localStorage获取保存的主题偏好，默认为false(亮色模式)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // 如果没有保存的偏好，检测系统主题
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return true;
    }
    return false;
  });

  // 当主题变化时，更新DOM和localStorage
  useEffect(() => {
    const root = document.documentElement;
    
    if (isDarkMode) {
      root.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      root.setAttribute('data-theme', 'light');
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
    
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // 监听系统主题变化
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      // 只有当用户没有手动设置过主题偏好时才跟随系统
      const savedTheme = localStorage.getItem('theme');
      if (!savedTheme) {
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // 切换主题的回调函数
  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  // 设置特定主题的回调函数
  const setTheme = useCallback((theme) => {
    setIsDarkMode(theme === 'dark');
  }, []);

  const value = {
    isDarkMode,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// 自定义Hook，方便组件使用主题上下文
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme必须在ThemeProvider内部使用');
  }
  return context;
}

export default ThemeContext;