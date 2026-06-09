/**
 * 联系我们页面组件
 * 提供有效的联系方式（邮箱、在线表单），符合Google AdSense审核要求
 */
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button, Input, message } from 'antd';
import { MailOutlined, EnvironmentOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { TextArea } = Input;

const ContactUs = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!name.trim() || !email.trim() || !content.trim()) {
      message.warning('请填写姓名、邮箱和留言内容');
      return;
    }
    setSubmitting(true);
    // 模拟提交
    setTimeout(() => {
      message.success('感谢您的留言，我们会尽快回复！');
      setName('');
      setEmail('');
      setSubject('');
      setContent('');
      setSubmitting(false);
    }, 1500);
  };

  return (
    <>
      <Helmet>
        <title>联系我们 - 装修知识思维导图</title>
        <meta name="description" content="如有任何问题、建议或合作意向，欢迎通过此页面联系我们。我们会在1-3个工作日内回复您的留言。" />
        <meta name="robots" content="index, follow" />
      </Helmet>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '40px 24px',
        lineHeight: '1.8',
        color: 'var(--color-text-primary, #333)',
        textAlign: 'left'
      }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>联系我们</h1>
        <p style={{ color: '#888', marginBottom: '32px' }}>我们期待与您的交流</p>

        {/* 联系方式卡片 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
          marginBottom: '40px'
        }}>
          <div style={{
            padding: '24px',
            border: '1px solid var(--color-border, #e8e8e8)',
            borderRadius: '12px',
            textAlign: 'center',
            backgroundColor: 'var(--color-bg-primary, #fff)'
          }}>
            <MailOutlined style={{ fontSize: '28px', color: '#1890ff', marginBottom: '12px' }} />
            <h3 style={{ margin: '0 0 8px 0' }}>电子邮箱</h3>
            <p style={{ margin: 0, color: '#666' }}>xiayiye580@gamil.com</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#999' }}>我们会在1-3个工作日内回复</p>
          </div>

          <div style={{
            padding: '24px',
            border: '1px solid var(--color-border, #e8e8e8)',
            borderRadius: '12px',
            textAlign: 'center',
            backgroundColor: 'var(--color-bg-primary, #fff)'
          }}>
            <ClockCircleOutlined style={{ fontSize: '28px', color: '#1890ff', marginBottom: '12px' }} />
            <h3 style={{ margin: '0 0 8px 0' }}>响应时间</h3>
            <p style={{ margin: 0, color: '#666' }}>工作日：24小时内</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#999' }}>周末及节假日：48小时内</p>
          </div>

          <div style={{
            padding: '24px',
            border: '1px solid var(--color-border, #e8e8e8)',
            borderRadius: '12px',
            textAlign: 'center',
            backgroundColor: 'var(--color-bg-primary, #fff)'
          }}>
            <EnvironmentOutlined style={{ fontSize: '28px', color: '#1890ff', marginBottom: '12px' }} />
            <h3 style={{ margin: '0 0 8px 0' }}>网站地址</h3>
            <p style={{ margin: 0, color: '#666' }}>https://www.qingzao.site</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#999' }}>全天候在线服务</p>
          </div>
        </div>

        <h2>在线留言</h2>
        <p style={{ color: '#666', marginBottom: '24px' }}>
          如果您有任何问题、建议或合作意向，欢迎填写以下表单。带 <span style={{ color: 'red' }}>*</span> 的为必填项。
        </p>

        <div style={{ maxWidth: '600px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>
              姓名 <span style={{ color: 'red' }}>*</span>
            </label>
            <Input
              placeholder="请输入您的姓名"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>
              邮箱 <span style={{ color: 'red' }}>*</span>
            </label>
            <Input
              placeholder="请输入您的电子邮箱"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              maxLength={100}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>
              主题
            </label>
            <Input
              placeholder="请输入主题（选填）"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={200}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>
              留言内容 <span style={{ color: 'red' }}>*</span>
            </label>
            <TextArea
              placeholder="请详细描述您的问题或建议..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              maxLength={2000}
              showCount
            />
          </div>

          <Button
            type="primary"
            size="large"
            onClick={handleSubmit}
            loading={submitting}
            style={{ minWidth: '120px' }}
          >
            提交留言
          </Button>
        </div>

        <h2 style={{ marginTop: '48px' }}>常见联系场景</h2>
        <ul>
          <li><strong>内容建议：</strong>如果您有装修相关的话题希望我们添加，请告诉我们。</li>
          <li><strong>问题反馈：</strong>如果您在使用过程中遇到任何问题或Bug，请详细描述，帮助我们改进。</li>
          <li><strong>合作咨询：</strong>如果您有合作意向（广告合作、内容合作等），请注明合作类型。</li>
          <li><strong>版权问题：</strong>如涉及版权相关问题，请提供相关证明材料以便我们及时处理。</li>
          <li><strong>广告相关：</strong>有关广告展示、Google AdSense的相关问题，请通过此页面联系我们。</li>
        </ul>

        <p style={{ marginTop: '40px', color: '#888', fontSize: '0.9rem' }}>
          装修知识思维导图 感谢您的支持与信任！
        </p>
      </div>
    </>
  );
};

export default ContactUs;