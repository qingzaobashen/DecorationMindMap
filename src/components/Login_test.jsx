/**
 * 原型试验用的登录组件
 * 向后端发送用户名与密码进行验证和注册
 */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Input, Button, Form, Checkbox, message, Spin } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useUser } from '../context/UserContext';

const PORT = 5000;


export default function Login({ onSuccess }) {
  const [form] = Form.useForm();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useUser(); // 使用UserContext

  // 页面加载时从本地存储中读取记住的用户名和密码
  useEffect(() => {
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
      const userData = JSON.parse(rememberedUser);
      form.setFieldsValue({
        username: userData.username,
        password: userData.password
      });
      setRememberMe(true);
    }
  }, [form]);

  const handleSubmit = async (values) => {
    const { username, password, email } = values;

    setLoading(true);
    const endpoint = isLogin ? '/login' : '/register';

    try {
      // 处理记住密码
      if (isLogin && rememberMe) {
        localStorage.setItem('rememberedUser', JSON.stringify({ username, password }));
      } else if (!rememberMe) {
        localStorage.removeItem('rememberedUser');
      }

      // 添加本地模式，如果API不可用，使用演示账号
      if (username === 'demo' && password === 'demo') {
        // 模拟API延迟
        await new Promise(resolve => setTimeout(resolve, 800));

        // 本地演示登录模式 - 默认非VIP用户
        const userData = {
          token: 'demo_token',
          username: 'demo',
          isPremium: false
        };

        // 使用Context的login方法
        login(userData);
        message.success('演示模式登录成功!');
        onSuccess();
        return;
      }

      // 特殊的"VIP"演示账号
      if (username === 'premium' && password === 'premium') {
        // 模拟API延迟
        await new Promise(resolve => setTimeout(resolve, 800));

        // 本地演示登录模式 - VIP用户
        const userData = {
          token: 'premium_token',
          username: 'premium',
          isPremium: true
        };

        // 使用Context的login方法
        login(userData);
        message.success('VIP用户登录成功!');
        onSuccess();
        return;
      }

      // 实际API调用
      const apiUrl = `http://localhost:${PORT}/api/auth${endpoint}`;
      console.log("请求地址: ", apiUrl);
      try {
        var { data } = await axios.post(apiUrl, {
          username,
          password,
          ...(isLogin ? {} : { email }) // 注册时需要email
        });
      } catch (error) {
        console.error('登录错误:', error.response?.data || error.message);
        // 确保表单字段在错误后获得焦点
        if (isLogin) {
          form.setFields([
            {
              name: 'password',
              errors: ['用户名或密码错误，请重新输入']
            }
          ]);
        }
        throw error;
      }
      if (isLogin) {
        if (data.token) {
          // 使用Context的login方法，添加isPremium字段
          login({
            token: data.token,
            username,
            isPremium: data.isPremium || false // 从API响应获取VIP状态
          });
          message.success('登录成功!');
          onSuccess();
        } else {
          message.error('登录失败，服务器返回空token');
        }
      } else {
        message.success('注册成功，请登录!');
        setIsLogin(true);
        form.resetFields();
      }
    } catch (err) {
      console.error('请求失败:', err);

      if (err.response?.status === 401) {
        console.error('用户名或密码错误');
      } else if (err.response?.status === 409) {
        console.error('用户名已存在');
      } else if (!navigator.onLine) {
        console.error('网络连接已断开，请检查网络');
      } else if (err.code === 'ECONNABORTED') {
        console.error('服务器响应超时，请稍后再试');
      } else {
        console.error(err.response?.data?.error || '请求失败，请稍后再试');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    form.resetFields();
  };

  return (
    <Spin spinning={loading} tip={isLogin ? "登录中..." : "注册中..."}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ remember: rememberMe }}
      >
        <Form.Item
          label="用户名"
          name="username"
          rules={[
            { required: true, message: '请输入用户名!' },
            { min: 3, message: '用户名至少3个字符' }
          ]}
        >
          <Input prefix={<UserOutlined />} placeholder="用户名" />
        </Form.Item>

        {!isLogin && (
          <Form.Item
            label="邮箱"
            name="email"
            rules={[
              { required: true, message: '请输入邮箱!' },
              { type: 'email', message: '请输入有效的邮箱地址!' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="邮箱" />
          </Form.Item>
        )}

        <Form.Item
          label="密码"
          name="password"
          rules={[
            { required: true, message: '请输入密码!' },
            { min: 4, message: '密码至少4个字符' }
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="密码" />
        </Form.Item>

        {isLogin && (
          <Form.Item name="remember">
            <Checkbox
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            >
              记住我
            </Checkbox>
          </Form.Item>
        )}

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '10px'
        }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
          >
            {isLogin ? '登 录' : '注 册'}
          </Button>

          <Button
            type="link"
            onClick={toggleMode}
            disabled={loading}
          >
            {isLogin ? '没有账号？立即注册' : '已有账号？立即登录'}
          </Button>
        </div>

        {isLogin && (
          <div style={{ marginTop: '10px', textAlign: 'center' }}>
            <small style={{ color: '#888' }}>
              提示: 使用 demo/demo 可以免费登录，使用 premium/premium 可以VIP用户登录
            </small>
          </div>
        )}
      </Form>
    </Spin>
  );
}