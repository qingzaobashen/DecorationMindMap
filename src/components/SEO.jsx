import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * SEO 组件 - 用于管理每个页面的动态 SEO 元数据
 * @param {Object} props - 组件属性
 * @param {string} props.title - 页面标题
 * @param {string} props.description - 页面描述
 * @param {string} props.keywords - 页面关键词
 * @param {string} props.image - 页面分享图片 URL
 * @param {string} props.url - 页面 URL
 * @param {string} props.type - 页面类型（website/article等）
 * @param {boolean} props.noIndex - 是否禁止索引
 */
const SEO = ({
  title = '装修知识导图 - 专业的装修知识库与思维导图工具',
  description = '装修知识导图提供全面的装修知识库，包括装修流程、材料选购、施工标准等专业内容。通过思维导图可视化展示装修全流程，助您轻松完成装修之旅。',
  keywords = '装修知识,装修流程,材料选购,施工标准,装修指南,装修思维导图,装修预算,装修验收',
  image = 'https://qingzao.com/og-image.jpg',
  url = 'https://qingzao.com/',
  type = 'website',
  noIndex = false
}) => {
  return (
    <Helmet>
      {/* 基础 Meta 标签 */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content="zh_CN" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* 额外的 SEO 标签 */}
      <meta name="theme-color" content="#1890ff" />
    </Helmet>
  );
};

export default SEO;