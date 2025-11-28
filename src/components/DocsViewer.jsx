import React, { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './DocsViewer.css'; // 确保创建并引入CSS文件

const DocsViewer = ({ docPath, onNavigate }) => {
  const [markdown, setMarkdown] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  
  useEffect(() => {
    console.log('DocsViewer: docPath:', docPath);
    if (!docPath) {
      setError('未提供文档路径。');
      setLoading(false);
      return;
    }
    const docPathSuffix = docPath.endsWith('.md') ? docPath : docPath + '.md'

    const fetchMarkdown = async () => {
      console.log("fetchMarkdown: ", docPathSuffix);
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(docPathSuffix);
        if (!response.ok) {
          throw new Error(`获取文档失败: ${response.status} ${response.statusText}`);
        }
        const text = await response.text();
        setMarkdown(text);
      } catch (err) {
        console.error('加载Markdown文档出错:', err);
        setError(err.message);
      }
      setLoading(false);
    };

    fetchMarkdown();
  }, [docPath]);

  // 处理Markdown内部链接的点击事件
  const handleLinkClick = useCallback((event) => {
    const link = event.target.closest('a');
    if (link && link.href) {
      const url = new URL(link.href);
      // 检查是否是同源链接，并且不是外部链接（比如不包含协议或者协议是当前页面的协议）
      // 简单的判断：如果链接以 / 开头，我们认为是内部文档链接
      if (url.pathname.startsWith('/') && onNavigate) {
        event.preventDefault(); // 阻止默认的浏览器跳转
        console.log("doc path changed: ", url.pathname);
        const docPathNoSuffix = url.pathname.endsWith('.md') ? url.pathname.replace('.md','') : url.pathname;
        onNavigate(docPathNoSuffix); // 调用回调，传递新的文档路径, 不带.md后缀, 因为如果带了后缀，F5刷新时，浏览器会直接定位到该后缀的文档，就会走这个组件的渲染
      }
    }
  }, [onNavigate]);

  if (loading) {
    return <div className="docs-viewer-loading">正在加载文档...</div>;
  }

  if (error) {
    return <div className="docs-viewer-error">错误: {error}</div>;
  }

  return (
    <div className="docs-viewer-container" onClick={handleLinkClick}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
};

export default DocsViewer; 