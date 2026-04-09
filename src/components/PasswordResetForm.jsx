/**
 * 密码重置表单组件
 * 用户通过邮箱点击密码重置链接后，在此组件中输入新密码
 */
import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { message } from 'antd';

const PasswordResetForm = ({ onSuccess }) => {
  const { updatePassword, logout } = useUser();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * 验证密码强度
   * @param {string} password - 密码
   * @returns {boolean} 是否符合要求
   */
  const validatePassword = (password) => {
    if (password.length < 6) {
      return '密码长度至少为6个字符';
    }
    return null;
  };

  /**
   * 处理密码提交
   * @param {Event} event - 表单提交事件
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    // 验证密码
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    // 验证两次密码输入一致
    if (newPassword !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    setLoading(true);

    try {
      const result = await updatePassword(newPassword);
      
      if (result.success) {
        window.confirm('密码重置成功！');
        // 如果用户已登录，就让他登录着吧
        //await logout();
        // 调用成功回调
        if (onSuccess) {
          onSuccess();
        }
      } else {
        window.confirm(result.error || '密码重置失败，请重试');
        setError(result.error || '密码重置失败，请重试');
      }
    } catch (err) {
      console.error('密码重置失败:', err);
      setError(err.message || '密码重置失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>新密码</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={styles.input}
            placeholder="请输入新密码（至少6位）"
            required
            disabled={loading}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>确认密码</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={styles.input}
            placeholder="请再次输入新密码"
            required
            disabled={loading}
          />
        </div>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        <button
          type="submit"
          style={loading ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
          disabled={loading}
        >
          {loading ? '提交中...' : '确认重置'}
        </button>

        <p style={styles.hint}>
          密码重置后，请使用新密码重新登录
        </p>
      </form>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
  },
  input: {
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #d9d9d9',
    borderRadius: '6px',
    outline: 'none',
    transition: 'border-color 0.3s',
  },
  error: {
    padding: '10px',
    backgroundColor: '#fff2f0',
    border: '1px solid #ffccc7',
    borderRadius: '6px',
    color: '#ff4d4f',
    fontSize: '14px',
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    fontWeight: '500',
    color: '#fff',
    backgroundColor: '#1890ff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed',
  },
  hint: {
    fontSize: '12px',
    color: '#999',
    textAlign: 'center',
    marginTop: '8px',
  },
};

export default PasswordResetForm;
