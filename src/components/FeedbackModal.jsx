import React, { useState } from 'react';
import { Modal, Form, Input, Select, Button, message } from 'antd';
import axios from 'axios';
import supabase from '../utils/supabase';

const { TextArea } = Input;
const { Option } = Select;

/**
 * 反馈配置
 */
const FEEDBACK_CONFIG = {
  edgeFunctionUrl: 'https://uwgvflkueracnwgwdwpe.supabase.co/functions/v1/feedback'
};

/**
 * 用户反馈模态框组件
 * @param {object} props - 组件属性
 * @param {boolean} props.visible - 模态框是否可见
 * @param {function} props.onClose - 关闭模态框的回调函数
 */
const FeedbackModal = ({ visible, onClose }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    console.log('收集到的反馈信息:', values);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        throw new Error('无法获取 session: ' + sessionError.message);
      }
      const accessToken = session?.access_token;
      if (!accessToken) {
        throw new Error('用户未登录，请先登录后再提交反馈');
      }

      const response = await axios.post(
        FEEDBACK_CONFIG.edgeFunctionUrl,
        {
          feedbackType: values.feedbackType,
          content: values.content,
          contact: values.contact
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      console.log('反馈提交响应:', response.data);

      if (response.data.success) {
        window.confirm('反馈已成功提交，感谢您的宝贵意见！');
        form.resetFields();
        onClose();
      } else {
        window.confirm(response.data.message || '提交失败，请稍后再试。');
      }
    } catch (error) {
      console.error('提交反馈失败:', error);
      if (error.response?.status === 401) {
        console.error('用户未登录或登录已过期，请重新登录');
      } else {
        console.error('提交反馈失败，请检查网络或稍后再试。');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="用户反馈"
      open={visible}
      onCancel={onClose}
      footer={null} // 自定义页脚
      destroyOnHidden={true}
      maskClosable={false}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ feedbackType: '功能建议' }}
      >
        <Form.Item
          name="feedbackType"
          label="反馈类型"
          rules={[{ required: true, message: '请选择反馈类型！' }]}
        >
          <Select placeholder="请选择反馈类型">
            <Option value="功能建议">功能建议</Option>
            <Option value="BUG报告">BUG报告</Option>
            <Option value="界面优化">界面优化</Option>
            <Option value="内容相关">内容相关</Option>
            <Option value="其他">其他</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="content"
          label="反馈内容"
          rules={[
            { required: true, message: '请输入反馈内容！' },
            { min: 10, message: '反馈内容至少10个字符！' },
          ]}
        >
          <TextArea rows={4} placeholder="请详细描述您的意见、建议或遇到的问题..." />
        </Form.Item>

        <Form.Item
          name="contact"
          label="联系方式 (可选)"
          tooltip="如果您希望我们与您联系，请留下您的邮箱或电话。"
        >
          <Input placeholder="邮箱或电话号码" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            提交反馈
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FeedbackModal;
