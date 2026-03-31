/**
 * 动态生成 Sitemap 脚本
 * 
 * 此脚本用于从您的数据源动态生成 sitemap.xml
 * 支持动态路由，如 /docs/:docName 和 /forum/post/:postId
 * 
 * 使用方法：
 * 1. 根据您的数据源修改脚本
 * 2. 运行脚本：node scripts/generate-sitemap.js
 * 3. 将生成的 sitemap.xml 复制到 public/ 目录
 */

const fs = require('fs');
const path = require('path');

/**
 * 配置区域
 */
const CONFIG = {
  // 网站基础 URL
  baseUrl: 'https://www.qingzao.site',
  
  // sitemap 文件输出路径
  outputPath: path.join(__dirname, '../public/sitemap.xml'),
  
  // 当前日期
  currentDate: new Date().toISOString().split('T')[0]
};

/**
 * 生成 URL 元素
 * @param {string} loc - 页面 URL
 * @param {string} lastmod - 最后修改日期
 * @param {string} changefreq - 更新频率
 * @param {number} priority - 优先级（0.0-1.0）
 * @returns {string} XML 字符串
 */
function generateUrlElement(loc, lastmod, changefreq = 'weekly', priority = 0.5) {
  return `
    <url>
      <loc>${loc}</loc>
      <lastmod>${lastmod}</lastmod>
      <changefreq>${changefreq}</changefreq>
      <priority>${priority}</priority>
    </url>`;
}

/**
 * 获取所有文档（需要根据您的实际数据源修改）
 * 
 * 这里需要从您的实际数据源获取文档列表
 * 可能的数据源：
 * 1. Markdown 文件系统
 * 2. 数据库
 * 3. API 接口
 * 4. JSON 文件
 */
function getDocuments() {
  // 示例：从文件系统读取文档
  // 您需要根据实际情况修改此函数
  
  const docs = [
    // 示例文档列表
    { name: 'README', title: '装修知识导图' },
    { name: '水电施工', title: '水电施工指南' },
    { name: '材料选购', title: '材料选购指南' },
    { name: '施工标准', title: '施工标准规范' },
    { name: '装修流程', title: '装修流程详解' },
    { name: '预算控制', title: '预算控制技巧' },
    { name: '验收标准', title: '验收标准指南' },
  ];
  
  return docs.map(doc => ({
    loc: `${CONFIG.baseUrl}/docs/${doc.name}`,
    lastmod: CONFIG.currentDate,
    changefreq: 'monthly',
    priority: 0.7
  }));
}

/**
 * 获取所有帖子（需要根据您的实际数据源修改）
 * 
 * 这里需要从您的实际数据源获取帖子列表
 * 可能的数据源：
 * 1. Supabase 数据库
 * 2. MySQL 数据库
 * 3. API 接口
 * 4. JSON 文件
 */
async function getPosts() {
  // 示例：从数据库或 API 获取帖子
  // 您需要根据实际情况修改此函数
  
  const posts = [
    // 示例帖子列表
    { id: '1', title: '装修经验分享', date: '2026-03-20' },
    { id: '2', title: '材料选购心得', date: '2026-03-22' },
    { id: '3', title: '施工技巧总结', date: '2026-03-23' },
    { id: '4', title: '装修避坑指南', date: '2026-03-24' },
  ];
  
  return posts.map(post => ({
    loc: `${CONFIG.baseUrl}/forum/post/${post.id}`,
    lastmod: post.date,
    changefreq: 'weekly',
    priority: 0.6
  }));
}

/**
 * 生成静态页面 URL
 */
function getStaticPages() {
  return [
    {
      loc: `${CONFIG.baseUrl}/`,
      lastmod: CONFIG.currentDate,
      changefreq: 'daily',
      priority: 1.0
    },
    {
      loc: `${CONFIG.baseUrl}/forum`,
      lastmod: CONFIG.currentDate,
      changefreq: 'daily',
      priority: 0.8
    }
  ];
}

/**
 * 生成完整的 sitemap.xml
 */
async function generateSitemap() {
  console.log('🚀 开始生成 sitemap.xml...');
  
  try {
    // 获取所有页面数据
    const staticPages = getStaticPages();
    const documents = await getDocuments();
    const posts = await getPosts();
    
    // 合并所有 URL
    const allUrls = [
      ...staticPages,
      ...documents,
      ...posts
    ];
    
    // 生成 XML 内容
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- 静态页面 -->
${staticPages.map(page => generateUrlElement(
  page.loc,
  page.lastmod,
  page.changefreq,
  page.priority
)).join('')}
  
  <!-- 文档页面（动态路由 /docs/:docName） -->
${documents.map(doc => generateUrlElement(
  doc.loc,
  doc.lastmod,
  doc.changefreq,
  doc.priority
)).join('')}
  
  <!-- 社区帖子页面（动态路由 /forum/post/:postId） -->
${posts.map(post => generateUrlElement(
  post.loc,
  post.lastmod,
  post.changefreq,
  post.priority
)).join('')}
</urlset>`;
    
    // 写入文件
    fs.writeFileSync(CONFIG.outputPath, xmlContent, 'utf8');
    
    console.log(`✅ sitemap.xml 生成成功！`);
    console.log(`📊 统计信息：`);
    console.log(`   - 静态页面：${staticPages.length} 个`);
    console.log(`   - 文档页面：${documents.length} 个`);
    console.log(`   - 帖子页面：${posts.length} 个`);
    console.log(`   - 总计：${allUrls.length} 个 URL`);
    console.log(`📁 输出路径：${CONFIG.outputPath}`);
    
  } catch (error) {
    console.error('❌ 生成 sitemap.xml 失败：', error);
    process.exit(1);
  }
}

/**
 * 主函数
 */
async function main() {
  await generateSitemap();
}

// 运行脚本
main();