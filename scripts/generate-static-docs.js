/**
 * 生成静态文档 HTML 文件（SEO 优化版）
 * 
 * 为每个 Markdown 文档生成对应的静态 HTML 文件
 * 支持搜索引擎直接抓取，同时保持 SPA 体验
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 项目根目录
const rootDir = path.resolve(__dirname, '..');
const docsDir = path.join(rootDir, 'public', 'docs');
const distDir = path.join(rootDir, 'dist');

// SEO优化配置 - 更长的标题和更详细的描述
const SEO_CONFIG = {
  'README': {
    title: '装修知识思维导图文档中心 - 全面的装修知识库',
    description: '装修知识思维导图文档中心，提供全面的装修知识库，包括装修流程、预算规划、公司选择、材料选购等专业知识。通过思维导图可视化展示，助您轻松完成装修。',
    keywords: '装修知识,装修导图,装修文档,家装,家居,装修流程,装修指南'
  },
  'budget-planning': {
    title: '装修预算规划指南 - 如何制定合理预算控制装修费用',
    description: '详细介绍如何制定装修预算，控制装修开支，避免装修超支。从装修档次确定、项目清单到市场询价，教您科学规划每一分钱，合理分配装修预算。',
    keywords: '装修预算,预算规划,装修费用,装修报价,预算控制,装修省钱'
  },
  'company-selection': {
    title: '装修公司挑选指南 - 选择靠谱装修公司的标准与建议',
    description: '全面指导如何选择靠谱的装修公司，包含装修公司资质验证、口碑调查、工地参观、合同审核等选择装修公司的完整指南。避免装修陷阱。',
    keywords: '装修公司,公司选择,装修挑选,装修招标,装修合同,装修公司选择'
  },
  'construction-guide': {
    title: '装修施工标准指南 - 水电泥木油施工规范',
    description: '装修施工标准指南，详细介绍水电改造、泥瓦工程、木工制作、油工涂刷等各工序的施工标准、验收规范和注意事项。专业装修施工知识。',
    keywords: '装修施工,施工标准,水电改造,泥瓦工程,木工,油工,装修验收'
  },
  'design-overview': {
    title: '装修设计概述 - 室内设计流程与空间规划要点',
    description: '装修设计概述，帮助您了解装修设计的基本流程、空间规划要点、与设计师沟通技巧，以及如何确定合适的装修风格。打造理想家居。',
    keywords: '装修设计,设计方案,室内设计,空间规划,装修风格,设计师'
  },
  'design-detail': {
    title: '装修设计详解 - 6大空间，100+设计细节',
    description: '装修设计详解，深入探讨户型改造、收纳设计、灯光规划、色彩搭配等室内设计细节。助您打造功能完善、美观舒适的理想居住空间。',
    keywords: '装修设计,户型改造,收纳设计,灯光设计,色彩搭配,室内设计'
  },
  'material-selection': {
    title: '装修材料选购指南 - 瓷砖地板门窗橱柜材料选择攻略',
    description: '装修材料选购指南，教您如何挑选瓷砖、地板、门窗、橱柜、卫浴等主材，包含材料品牌推荐、选购技巧和验收要点。装修材料选购不踩坑。',
    keywords: '装修材料,材料选购,瓷砖,地板,门窗,橱柜,卫浴,装修主材'
  }
};

// 读取 Markdown 文件
function readMarkdownFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error(`读取文件失败: ${filePath}`, error);
    return null;
  }
}

// 改进的 Markdown 转 HTML
function markdownToHtml(markdown) {
  let html = markdown;
  
  // 转义 HTML 特殊字符（但保留我们即将添加的标签）
  const escapeHtml = (text) => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  };
  
  // 先处理代码块，避免其中的内容被转义
  const codeBlocks = [];
  html = html.replace(/```([\s\S]*?)```/g, (match, code) => {
    const id = codeBlocks.length;
    codeBlocks.push(`<pre><code>${escapeHtml(code)}</code></pre>`);
    return `<!--CODE_BLOCK_${id}-->`;
  });
  
  // 处理行内代码
  const inlineCodes = [];
  html = html.replace(/`([^`]+)`/g, (match, code) => {
    const id = inlineCodes.length;
    inlineCodes.push(`<code>${escapeHtml(code)}</code>`);
    return `<!--INLINE_CODE_${id}-->`;
  });
  
  // 转义剩余内容
  html = escapeHtml(html);
  
  // 处理标题
  html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  
  // 处理粗体和斜体
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  
  // 处理删除线
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');
  
  // 处理链接 [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  
  // 处理图片 ![alt](url)
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;">');
  
  // 处理无序列表
  html = html.replace(/^(\s*)[-*+] (.+$)/gim, (match, indent, content) => {
    const level = Math.floor(indent.length / 2);
    return `<li class="list-level-${level}">${content}</li>`;
  });
  
  // 处理有序列表
  let orderListCounter = 0;
  html = html.replace(/^(\s*)\d+\. (.+$)/gim, (match, indent, content) => {
    orderListCounter++;
    return `<li class="ordered-item">${content}</li>`;
  });
  
  // 处理引用
  html = html.replace(/^&gt; (.+$)/gim, '<blockquote>$1</blockquote>');
  
  // 处理水平线
  html = html.replace(/^---$/gim, '<hr>');
  html = html.replace(/^\*\*\*$/gim, '<hr>');
  html = html.replace(/^___$/gim, '<hr>');
  
  // 处理段落（将连续的文本行包裹在 <p> 中）
  const paragraphs = html.split('\n\n');
  html = paragraphs.map(p => {
    p = p.trim();
    if (!p) return '';
    // 如果已经是块级元素，不包裹
    if (p.match(/^<(h[1-6]|pre|blockquote|hr|li|img)/)) {
      return p;
    }
    // 将 <br> 转换回换行
    p = p.replace(/<br>/g, '\n');
    return `<p>${p}</p>`;
  }).join('\n\n');
  
  // 恢复代码块
  codeBlocks.forEach((block, id) => {
    html = html.replace(`&lt;!--CODE_BLOCK_${id}--&gt;`, block);
  });
  
  // 恢复行内代码
  inlineCodes.forEach((code, id) => {
    html = html.replace(`&lt;!--INLINE_CODE_${id}--&gt;`, code);
  });
  
  return html;
}

// 生成 HTML 模板
function generateHtmlTemplate(title, content, docPath, keywords) {
  const canonicalUrl = `https://qingzao.site/docs/${docPath}`;
  const defaultKeywords = '装修知识,装修流程,装修指南,装修思维导图,装修预算,装修验收';
  const keywordsStr = keywords || defaultKeywords;
  const siteName = '装修知识思维导图';

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="baidu-site-verification" content="codeva-eSozi0Q6x9" />
  <title>${title}</title>
  <meta name="description" content="${content.substring(0, 200).replace(/<[^>]*>/g, '')}..." />
  <meta name="keywords" content="${keywordsStr}" />
  <meta name="author" content="${siteName}" />
  <meta name="robots" content="index, follow" />

  <!-- Canonical URL -->
  <link rel="canonical" href="${canonicalUrl}" />

  <!-- Open Graph -->
  <meta property="og:type" content="article" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${content.substring(0, 200).replace(/<[^>]*>/g, '')}..." />
  <meta property="og:locale" content="zh_CN" />
  <meta property="og:site_name" content="${siteName}" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${content.substring(0, 200).replace(/<[^>]*>/g, '')}..." />
  
  <style>
    * {
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.8;
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
      background: #fafafa;
    }
    
    h1 { 
      color: #1890ff; 
      border-bottom: 3px solid #1890ff; 
      padding-bottom: 15px;
      margin-top: 0;
      font-size: 2em;
    }
    
    h2 { 
      color: #262626; 
      margin-top: 40px;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 1px solid #e8e8e8;
      font-size: 1.5em;
    }
    
    h3 { 
      color: #434343; 
      margin-top: 30px;
      font-size: 1.25em;
    }
    
    h4 {
      color: #595959;
      margin-top: 25px;
      font-size: 1.1em;
    }
    
    a { 
      color: #1890ff; 
      text-decoration: none;
      border-bottom: 1px solid transparent;
      transition: border-color 0.3s;
    }
    
    a:hover { 
      border-bottom-color: #1890ff;
    }
    
    p {
      margin: 16px 0;
      text-align: justify;
    }
    
    code {
      background: #f6ffed;
      color: #389e0d;
      padding: 2px 8px;
      border-radius: 4px;
      font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
      font-size: 0.9em;
      border: 1px solid #b7eb8f;
    }
    
    pre {
      background: #f6ffed;
      border: 1px solid #b7eb8f;
      border-radius: 8px;
      padding: 20px;
      overflow-x: auto;
      margin: 20px 0;
    }
    
    pre code { 
      padding: 0; 
      background: none;
      border: none;
      color: #262626;
    }
    
    blockquote {
      background: #e6f7ff;
      border-left: 4px solid #1890ff;
      margin: 20px 0;
      padding: 15px 20px;
      color: #262626;
      border-radius: 0 8px 8px 0;
    }
    
    blockquote p {
      margin: 0;
    }
    
    ul, ol {
      padding-left: 30px;
      margin: 16px 0;
    }
    
    li {
      margin: 8px 0;
    }
    
    li.ordered-item {
      list-style-type: decimal;
    }
    
    img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      margin: 20px 0;
    }
    
    hr {
      border: none;
      border-top: 2px solid #e8e8e8;
      margin: 40px 0;
    }
    
    .back-link {
      display: inline-flex;
      align-items: center;
      margin-bottom: 30px;
      padding: 12px 24px;
      background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
      color: white;
      border-radius: 8px;
      font-weight: 500;
      box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
      transition: all 0.3s;
    }
    
    .back-link:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(24, 144, 255, 0.4);
      text-decoration: none;
      border-bottom-color: transparent;
    }
    
    .back-link::before {
      content: "←";
      margin-right: 8px;
    }
    
    header {
      background: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      margin-bottom: 30px;
    }
    
    article {
      background: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    
    footer {
      margin-top: 50px;
      padding: 30px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      color: #8c8c8c;
      font-size: 14px;
      text-align: center;
    }
    
    footer a {
      color: #1890ff;
      font-weight: 500;
    }
    
    .cta-button {
      display: inline-block;
      margin-top: 15px;
      padding: 12px 30px;
      background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
      color: white;
      border-radius: 8px;
      font-weight: 500;
      box-shadow: 0 2px 8px rgba(82, 196, 26, 0.3);
      transition: all 0.3s;
    }
    
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(82, 196, 26, 0.4);
      text-decoration: none;
      border-bottom-color: transparent;
    }
    
    /* 响应式设计 */
    @media (max-width: 768px) {
      body {
        padding: 10px;
      }
      
      header, article, footer {
        padding: 20px;
      }
      
      h1 {
        font-size: 1.5em;
      }
      
      h2 {
        font-size: 1.25em;
      }
    }
    
    /* 打印样式 */
    @media print {
      body {
        background: white;
      }
      
      header, article {
        box-shadow: none;
      }
      
      .back-link, .cta-button {
        display: none;
      }
    }
  </style>
  
  <!-- SPA 重定向脚本：如果是真实用户访问，跳转到 React 应用 -->
  <script>
    // 检测是否是搜索引擎爬虫
    const userAgent = navigator.userAgent.toLowerCase();
    const isBot = /bot|crawler|spider|crawling|baidu|google|bing|yahoo|sogou/i.test(userAgent);
    
    // 如果不是爬虫，保存路径并重定向到 SPA
    if (!isBot) {
      const path = window.location.pathname;
      const search = window.location.search;
      const hash = window.location.hash;
      sessionStorage.setItem('spa-redirect-path', path + search + hash);
      window.location.replace('/');
    }
  </script>
</head>
<body>
  <header>
    <a href="/docs/README" class="back-link">返回文档目录</a>
    <h1>${title}</h1>
  </header>
  
  <article>
    ${content}
  </article>
  
  <footer>
    <p>© 2026 装修知识思维导图 - 专业的装修知识库与思维导图工具</p>
    <p>通过思维导图可视化展示装修全流程，助您轻松完成装修之旅</p>
    <a href="/" class="cta-button">访问完整应用，体验交互式思维导图 →</a>
  </footer>
</body>
</html>`;
}

// 主函数
async function generateStaticDocs() {
  console.log('🚀 开始生成静态文档页面（SEO 优化版）...\n');
  
  // 确保 dist/docs 目录存在
  const distDocsDir = path.join(distDir, 'docs');
  if (!fs.existsSync(distDocsDir)) {
    fs.mkdirSync(distDocsDir, { recursive: true });
  }
  
  // 获取所有 Markdown 文件
  const files = fs.readdirSync(docsDir);
  const mdFiles = files.filter(file => file.endsWith('.md'));
  
  console.log(`📄 找到 ${mdFiles.length} 个文档文件\n`);
  
  const generatedFiles = [];
  
  for (const file of mdFiles) {
    const filePath = path.join(docsDir, file);
    const docName = file.replace('.md', '');
    
    console.log(`📝 处理: ${file}`);
    
    // 读取 Markdown 文件
    const markdown = readMarkdownFile(filePath);
    if (!markdown) continue;

    // 提取标题（第一行 # 开头的）
    const titleMatch = markdown.match(/^# (.+)$/m);
    const title = titleMatch ? titleMatch[1] : docName;

    // 转换为 HTML
    const htmlContent = markdownToHtml(markdown);

    // 使用SEO配置中的优化标题和描述（如果没有配置则使用提取的标题）
    const seoConfig = SEO_CONFIG[docName] || {};
    const optimizedTitle = seoConfig.title || `${title} - 装修知识思维导图`;
    const optimizedDescription = seoConfig.description || `${title} - 装修知识思维导图提供全面的装修知识库，包括装修流程、材料选购、施工标准等专业内容。`;

    // 生成完整 HTML
    const fullHtml = generateHtmlTemplate(optimizedTitle, htmlContent, docName, seoConfig.keywords);

    // 写入文件（使用 .html 扩展名）
    const outputPath = path.join(distDocsDir, `${docName}.html`);
    fs.writeFileSync(outputPath, fullHtml, 'utf-8');

    generatedFiles.push({ name: docName, title: optimizedTitle, path: outputPath });
    console.log(`✅ 生成: ${outputPath}\n`);
  }

  // 为 README 生成 index.html（文档首页）
  const readmePath = path.join(docsDir, 'README.md');
  if (fs.existsSync(readmePath)) {
    console.log('📝 处理: README.md (作为首页)');
    const markdown = readMarkdownFile(readmePath);
    const titleMatch = markdown.match(/^# (.+)$/m);
    const title = titleMatch ? titleMatch[1] : '文档中心';
    const htmlContent = markdownToHtml(markdown);

    // 使用SEO配置
    const seoConfig = SEO_CONFIG['README'] || {};
    const optimizedTitle = seoConfig.title || `${title} - 装修知识思维导图`;
    const optimizedDescription = seoConfig.description || `${title} - 装修知识思维导图提供全面的装修知识库。`;

    const fullHtml = generateHtmlTemplate(optimizedTitle, htmlContent, 'README', seoConfig.keywords);
    
    // 写入 index.html
    const indexPath = path.join(distDocsDir, 'index.html');
    fs.writeFileSync(indexPath, fullHtml, 'utf-8');
    console.log(`✅ 生成: ${indexPath}\n`);
  }
  
  // 生成文档索引页面
  console.log('📝 生成文档索引页面...');
  const indexHtml = generateDocsIndexPage(generatedFiles);
  const indexPath = path.join(distDocsDir, 'index.html');
  fs.writeFileSync(indexPath, indexHtml, 'utf-8');
  console.log(`✅ 生成: ${indexPath}\n`);
  
  console.log('🎉 静态文档生成完成！');
  console.log(`\n📊 统计信息:`);
  console.log(`   - 生成了 ${mdFiles.length} 个文档页面`);
  console.log(`   - 文档目录: ${distDocsDir}`);
  console.log(`\n🤖 SEO 优化:`);
  console.log(`   - 搜索引擎可以直接抓取静态 HTML 内容`);
  console.log(`   - 真实用户会自动跳转到 React SPA`);
  console.log(`   - 每个页面都有完整的 SEO meta 标签`);
}

// 生成文档索引页面
function generateDocsIndexPage(files) {
  const fileList = files.map(file => {
    return `
    <li>
      <a href="/docs/${file.name}.html">${file.title}</a>
      <span class="doc-path">/docs/${file.name}</span>
    </li>`;
  }).join('');
  
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="baidu-site-verification" content="codeva-eSozi0Q6x9" />
  <title>文档中心 - 装修知识思维导图</title>
  <meta name="description" content="装修知识思维导图文档中心，提供全面的装修知识库，包括装修流程、材料选购、施工标准等专业内容。" />
  <meta name="keywords" content="装修知识,装修流程,装修文档,装修指南,装修思维导图,材料选购,施工标准" />
  <meta name="author" content="装修知识思维导图" />
  <meta name="robots" content="index, follow" />
  
  <link rel="canonical" href="https://qingzao.site/docs/" />
  
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      line-height: 1.8;
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
      background: #fafafa;
    }
    header {
      background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
      color: white;
      padding: 40px;
      border-radius: 12px;
      margin-bottom: 30px;
      text-align: center;
    }
    h1 {
      margin: 0 0 15px 0;
      font-size: 2.5em;
    }
    .subtitle {
      font-size: 1.2em;
      opacity: 0.9;
      margin: 0;
    }
    .doc-list {
      background: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    .doc-list h2 {
      color: #262626;
      margin-top: 0;
      padding-bottom: 15px;
      border-bottom: 2px solid #1890ff;
    }
    .doc-list ul {
      list-style: none;
      padding: 0;
    }
    .doc-list li {
      padding: 20px;
      margin: 15px 0;
      background: #f6ffed;
      border-radius: 8px;
      border-left: 4px solid #52c41a;
      transition: all 0.3s;
    }
    .doc-list li:hover {
      transform: translateX(5px);
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .doc-list a {
      color: #1890ff;
      text-decoration: none;
      font-size: 1.2em;
      font-weight: 500;
      display: block;
      margin-bottom: 5px;
    }
    .doc-list a:hover {
      color: #096dd9;
    }
    .doc-path {
      color: #8c8c8c;
      font-size: 0.9em;
      font-family: monospace;
    }
    footer {
      margin-top: 50px;
      padding: 30px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      color: #8c8c8c;
      font-size: 14px;
      text-align: center;
    }
    .cta-button {
      display: inline-block;
      margin-top: 15px;
      padding: 15px 40px;
      background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
      color: white;
      border-radius: 8px;
      font-weight: 500;
      font-size: 1.1em;
      text-decoration: none;
      box-shadow: 0 4px 12px rgba(82, 196, 26, 0.3);
      transition: all 0.3s;
    }
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(82, 196, 26, 0.4);
    }
    
    @media (max-width: 768px) {
      body { padding: 10px; }
      header { padding: 30px 20px; }
      h1 { font-size: 1.8em; }
      .doc-list { padding: 25px; }
    }
  </style>
  
  <script>
    const userAgent = navigator.userAgent.toLowerCase();
    const isBot = /bot|crawler|spider|crawling|baidu|google|bing|yahoo|sogou/i.test(userAgent);
    if (!isBot) {
      window.location.replace('/#/docs/README');
    }
  </script>
</head>
<body>
  <header>
    <h1>📚 文档中心</h1>
    <p class="subtitle">装修知识思维导图 - 全面的装修知识库</p>
  </header>
  
  <div class="doc-list">
    <h2>📖 文档列表</h2>
    <ul>
      ${fileList}
    </ul>
  </div>
  
  <footer>
    <p>© 2026 装修知识思维导图 - 专业的装修知识库与思维导图工具</p>
    <p>通过思维导图可视化展示装修全流程，助您轻松完成装修之旅</p>
    <a href="/" class="cta-button">访问完整应用 →</a>
  </footer>
</body>
</html>`;
}

// 运行
generateStaticDocs().catch(console.error);
