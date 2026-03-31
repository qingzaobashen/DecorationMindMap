import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * Schema 结构化数据组件 - 为搜索引擎提供结构化数据
 * @param {Object} props - 组件属性
 * @param {string} props.type - Schema 类型（WebSite, Article, Organization等）
 * @param {Object} props.data - Schema 数据对象
 */
const Schema = ({ type, data }) => {
  const generateSchema = () => {
    const baseSchema = {
      '@context': 'https://schema.org',
      '@type': type,
      ...data
    };

    return JSON.stringify(baseSchema);
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {generateSchema()}
      </script>
    </Helmet>
  );
};

/**
 * 网站结构化数据
 */
export const WebSiteSchema = () => {
  const data = {
    name: '装修知识导图',
    url: 'https://www.qingzao.site',
    description: '装修知识导图提供全面的装修知识库，包括装修流程、材料选购、施工标准等专业内容。通过思维导图可视化展示装修全流程，助您轻松完成装修之旅。',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://www.qingzao.site/search?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    },
    publisher: {
      '@type': 'Organization',
      name: '装修知识导图',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.qingzao.site/logo.png'
      }
    }
  };

  return <Schema type="WebSite" data={data} />;
};

/**
 * 文章结构化数据
 * @param {Object} props - 组件属性
 * @param {string} props.title - 文章标题
 * @param {string} props.description - 文章描述
 * @param {string} props.url - 文章URL
 * @param {string} props.image - 文章图片
 * @param {string} props.datePublished - 发布日期
 * @param {string} props.dateModified - 修改日期
 * @param {string} props.author - 作者
 */
export const ArticleSchema = ({
  title,
  description,
  url,
  image,
  datePublished,
  dateModified,
  author = '装修知识导图'
}) => {
  const data = {
    headline: title,
    description: description,
    image: image,
    author: {
      '@type': 'Person',
      name: author
    },
    publisher: {
      '@type': 'Organization',
      name: '装修知识导图',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.qingzao.site/logo.png'
      }
    },
    datePublished: datePublished,
    dateModified: dateModified,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url
    }
  };

  return <Schema type="Article" data={data} />;
};

/**
 * 面包屑结构化数据
 * @param {Object} props - 组件属性
 * @param {Array} props.items - 面包屑项目数组
 */
export const BreadcrumbSchema = ({ items }) => {
  const data = {
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };

  return <Schema type="BreadcrumbList" data={data} />;
};

/**
 * 组织结构化数据
 */
export const OrganizationSchema = () => {
  const data = {
    name: '装修知识导图',
    url: 'https://www.qingzao.site',
    logo: 'https://www.qingzao.site/logo.png',
    description: '专业的装修知识库与思维导图工具，提供全面的装修知识、材料选购指南、施工标准等专业内容。',
    sameAs: [
      'https://github.com/yourusername/DecorationMindMap',
      'https://twitter.com/yourusername'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'contact@www.qingzao.site'
    }
  };

  return <Schema type="Organization" data={data} />;
};

export default Schema;