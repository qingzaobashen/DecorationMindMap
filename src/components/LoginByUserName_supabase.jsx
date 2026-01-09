/**
 * Supabase用户名/密码认证组件
 * 实现用户注册、登录、登出等功能
 */
import "../index.css";
import { useState, useEffect } from "react";
import { useUser } from '../context/UserContext';
import { message } from 'antd'; // 添加消息提示组件

// 导入共享的Supabase客户端实例
import supabase from '../utils/supabase';

// 组件样式
const loginContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '50vh',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  padding: '35px',
};

const loginCardStyle = {
  background: 'white', // 取消白边
  borderRadius: '16px',
  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
  padding: '20px', // 减小内边距
  width: '100%',
  maxWidth: '320px', // 减小最大宽度
  transition: 'all 0.3s ease',
};

const loginHeaderStyle = {
  textAlign: 'center',
  marginBottom: '20px', // 减小头部底部边距
};

const loginTitleStyle = {
  fontSize: '24px', // 减小字体大小
  fontWeight: '700',
  color: 'black', 
  marginBottom: '8px',
};

const loginSubtitleStyle = {
  fontSize: '13px', // 减小字体大小
  color: 'rgba(0, 0, 0, 0.8)', // 改为半透明白色
};

const formGroupStyle = {
  marginBottom: '15px', // 减小表单组底部边距
};

const labelStyle = {
  display: 'block',
  fontSize: '13px', // 减小字体大小
  fontWeight: '500',
  color: 'black', 
  marginBottom: '8px',
};

const inputStyle = {
  width: '100%',
  padding: '10px 14px', // 减小内边距
  fontSize: '14px', // 减小字体大小
  border: '2px solid rgba(255, 255, 255, 0.3)', // 半透明白色边框
  borderRadius: '8px',
  transition: 'all 0.3s ease',
  outline: 'none',
  boxSizing: 'border-box',
  backgroundColor: 'rgba(255, 255, 255, 0.1)', // 半透明背景
  color: 'black', // 白色文字
};

const inputFocusStyle = {
  borderColor: '#ffffff',
  boxShadow: '0 0 0 3px rgba(255, 255, 255, 0.2)',
};

const buttonStyle = {
  width: '100%',
  padding: '12px', // 减小内边距
  fontSize: '14px', // 减小字体大小
  fontWeight: '600',
  color: '#667eea', // 改为与背景对比的颜色
  backgroundColor: '#e7f6f6ff', // 白色背景
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  marginBottom: '12px', // 减小底部外边距
};

const buttonHoverStyle = {
  backgroundColor: '#f0f0f0',
  transform: 'translateY(-2px)',
  boxShadow: '0 6px 20px rgba(255, 255, 255, 0.3)',
};

const buttonDisabledStyle = {
  backgroundColor: '#cccccc',
  cursor: 'not-allowed',
  transform: 'none',
  boxShadow: 'none',
};

const errorStyle = {
  backgroundColor: 'rgba(220, 53, 69, 0.9)', // 半透明红色背景
  color: 'black', // 白色文字
  padding: '10px 14px', // 减小内边距
  borderRadius: '8px',
  marginBottom: '15px', // 减小底部外边距
  fontSize: '13px', // 减小字体大小
  borderLeft: '4px solid white', // 白色边框
};

const switchModeStyle = {
  textAlign: 'center',
  marginTop: '15px',
  fontSize: '12px',
  color: 'rgba(0, 0, 0, 0.8)',
};

const switchButtonStyle = {
  background: 'none',
  border: 'none',
  color: 'black', 
  cursor: 'pointer',
  fontWeight: '600',
  padding: '0 4px',
  transition: 'color 0.3s ease',
};

const switchButtonHoverStyle = {
  color: 'rgba(255, 255, 255, 0.8)',
  textDecoration: 'underline',
};

const loggedInContainerStyle = {
  ...loginCardStyle,
  textAlign: 'center',
};

const welcomeMessageStyle = {
  fontSize: '20px', // 减小字体大小
  fontWeight: '700',
  color: 'black', 
  marginBottom: '8px',
};

const userInfoStyle = {
  fontSize: '14px', // 减小字体大小
  color: 'rgba(255, 255, 255, 0.8)', // 半透明白色
  marginBottom: '15px', // 减小底部外边距
};

const logoutButtonStyle = {
  ...buttonStyle,
  backgroundColor: '#ef5350',
};

const logoutButtonHoverStyle = {
  backgroundColor: '#e53935',
  transform: 'translateY(-2px)',
  boxShadow: '0 6px 20px rgba(239, 83, 80, 0.3)',
};

export default function LoginBySupabaseUsername({ onSuccess }) {
  // 认证状态管理
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // 表单状态管理
  const [isRegister, setIsRegister] = useState(false); // 切换注册/登录模式
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const { login, logout } = useUser(); // 从UserContext获取login和logout方法

  /**
   * 初始化时检查用户会话状态
   * 监听认证状态变化
   */
  useEffect(() => {
    // 查询supabase中是否存在现有会话
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      // 如果有会话，更新UserContext
      if (session) {
        const usernameFromMetadata = session.user.user_metadata?.username || session.user.email.split('@')[0];
        console.log("用户元数据获取:", session.user);
        login({
          token: session.access_token,
          username: usernameFromMetadata,
          isPremium: session.user?.user_metadata?.is_premium || false
        });
      }
    });

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      // 如果会话变化，更新UserContext
      if (session) {
        const usernameFromMetadata = session.user.user_metadata?.username || session.user.email.split('@')[0];
        login({
          token: session.access_token,
          username: usernameFromMetadata,
          isPremium: session.user?.user_metadata?.is_premium || false
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [login, logout]);

  /**
   * 处理用户注册
   * @param {Event} event - 表单提交事件
   */
  const handleRegister = async (event) => {
    event.preventDefault();
    setLoading(true);
    setAuthError(null);

    try {
      console.log("注册尝试:", { email, username });
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username, // 存储用户名到用户元数据
            isPremium: false // 默认非VIP用户
          },
        },
      });

      if (error) {
        throw error;
      }

      // 注册成功，调用成功回调
      if (data.user) {
        onSuccess?.(data.user);
        console.log("注册成功:", data.user);
        message.success('注册成功，请登录');
        setIsRegister(false); // 切换回登录模式
        // 清空表单
        setEmail('');
        setPassword('');
        setUsername('');
      }
    } catch (error) {
      setAuthError(error.message);
      message.error(`注册失败: ${error.message}`);
      console.error("注册失败:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 处理用户登录
   * @param {Event} event - 表单提交事件
   */
  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setAuthError(null);

    try {
      console.log("登录尝试:", { email });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // 登录成功，调用成功回调
      if (data.session) {
        console.log("login success data: ", data);
        // 从用户元数据中获取用户名
        const usernameFromMetadata = data.session.user.user_metadata?.username || data.session.user.email.split('@')[0];
        login({
          token: data.session.access_token,
          username: usernameFromMetadata,
          isPremium: data.session.user?.user_metadata?.is_premium || false // 从用户元数据获取VIP状态
        });
        onSuccess?.(data.user);
        message.success('登录成功');
      }
    } catch (error) {
      setAuthError(error.message);
      message.error(`登录失败: ${error.message}`);
      console.error("登录失败:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 处理用户登出
   */
  const handleLogout = async () => {
    try {
      await logout(); // 调用UserContext的登出方法，触发完整登出流程
      setSession(null);
    } catch (error) {
      message.error(`登出失败: ${error.message}`);
      console.error("登出失败:", error);
    }
  };

  /**
   * 渲染错误信息
   */
  const renderError = () => {
    if (!authError) return null;
    return (
      <div style={errorStyle}>
        {authError}
      </div>
    );
  };

  /**
   * 渲染已登录状态  // 2025-12-16 暂无需渲染登录状态
   */
  //if (session) {
  //  return (
  //    <div style={loginContainerStyle}>
  //      <div style={loggedInContainerStyle}>
  //        <h1 style={welcomeMessageStyle}>欢迎回来！</h1>
  //        <p style={userInfoStyle}>您已登录为: {session.user.email}</p>
  //        {session.user.user_metadata?.username && (
  //          <p style={userInfoStyle}>用户名: {session.user.user_metadata.username}</p>
  //        )}
  //        <button
  //          onClick={handleLogout}
  //          style={logoutButtonStyle}
  //          onMouseEnter={(e) => e.target.style = { ...logoutButtonStyle, ...logoutButtonHoverStyle }}
  //          onMouseLeave={(e) => e.target.style = logoutButtonStyle}
  //        >
  //          登出
  //        </button>
  //      </div>
  //    </div>
  //  );
  //}

  /**
   * 渲染登录/注册表单
   */
  return (
    <div style={loginContainerStyle}>
      <div style={loginCardStyle}>
        <div style={loginHeaderStyle}>
          <h1 style={loginTitleStyle}>{isRegister ? "创建账号" : "欢迎回来"}</h1>
          <p style={loginSubtitleStyle}>
            {isRegister ? "注册一个新账号开始使用我们的服务" : "登录您的账号继续使用"}
          </p>
        </div>

        {renderError()}

        {isRegister ? (
          // 注册表单
          <form onSubmit={handleRegister}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>用户名</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={inputStyle}
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => Object.assign(e.target.style, inputStyle)}
                placeholder="请输入用户名"
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>电子邮箱</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={inputStyle}
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => Object.assign(e.target.style, inputStyle)}
                placeholder="请输入电子邮箱"
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                style={inputStyle}
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => Object.assign(e.target.style, inputStyle)}
                placeholder="请输入密码（至少6位）"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={loading ? { ...buttonStyle, ...buttonDisabledStyle } : buttonStyle}
              onMouseEnter={(e) => !loading && Object.assign(e.target.style, buttonHoverStyle)}
              onMouseLeave={(e) => !loading && Object.assign(e.target.style, buttonStyle)}
            >
              {loading ? "注册中..." : "创建账号"}
            </button>
          </form>
        ) : (
          // 登录表单
          <form onSubmit={handleLogin}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>电子邮箱</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={inputStyle}
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => Object.assign(e.target.style, inputStyle)}
                placeholder="请输入电子邮箱"
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={inputStyle}
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => Object.assign(e.target.style, inputStyle)}
                placeholder="请输入密码"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={loading ? { ...buttonStyle, ...buttonDisabledStyle } : buttonStyle}
              onMouseEnter={(e) => !loading && Object.assign(e.target.style, buttonHoverStyle)}
              onMouseLeave={(e) => !loading && Object.assign(e.target.style, buttonStyle)}
            >
              {loading ? "登录中..." : "登录"}
            </button>
          </form>
        )}

        {/* 切换登录/注册模式 */}
        <div style={switchModeStyle}>
          {isRegister ? (
            <>
              已有账号？
              <button
                onClick={() => setIsRegister(false)}
                style={switchButtonStyle}
                onMouseEnter={(e) => e.target.style = { ...switchButtonStyle, ...switchButtonHoverStyle }}
                onMouseLeave={(e) => e.target.style = switchButtonStyle}
              >
                立即登录
              </button>
            </>
          ) : (
            <>
              还没有账号？
              <button
                onClick={() => setIsRegister(true)}
                style={switchButtonStyle}
                onMouseEnter={(e) => e.target.style = { ...switchButtonStyle, ...switchButtonHoverStyle }}
                onMouseLeave={(e) => e.target.style = switchButtonStyle}
              >
                立即注册
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}