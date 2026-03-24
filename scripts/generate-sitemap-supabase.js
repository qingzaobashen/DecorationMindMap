/**
 * 动态生成 Sitemap 脚本 - Supabase 版本
 * 
 * 此脚本从 Supabase 数据库动态生成 sitemap.xml
 * 支持动态路由，如 /docs/:docName 和 /forum/post/:postId
 * 
 * 使用方法：
 * 1. 确保 .env 文件中有 Supabase 配置
 * 2. 运行脚本：node scripts/generate-sitemap-supabase.js
 * 3. 将生成的 sitemap.xml 复制到 public/ 目录
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

/**
 * 配置区域
 */
const CONFIG = {
  // 网站基础 URL
  baseUrl: process.env.SITE_URL || 'https://qingzao.com',
  
  // sitemap 文件输出路径
  outputPath: path.join(__dirname, '../public/sitemap.xml'),
  
  // 当前日期
  currentDate: new Date().toISOString().split('T')[0],
  
  // Supabase 配置
  supabaseUrl: process.env.VITE_SUPABASE_URL,
  supabaseKey: process.env.VITE_SUPABASE_ANON_KEY
};

/**
 * 初始化 Supabase 客户端
 */
const supabase = createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey);

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
 * 从 Supabase 获取所有文档
 */
async function getDocumentsFromSupabase() {
  try {
    console.log('📚 从 Supabase 获取文档...');
    
    // 根据您的实际表结构调整查询
    // 假设您有一个 documents 表
    const { data: documents, error } = await supabase
      .from('documents')
      .select('name, updated_at')
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('❌ 获取文档失败：', error);
      return [];
    }
    
    console.log(`✅ 获取到 ${documents.length} 个文档`);
    
    return documents.map(doc => ({
      loc: `${CONFIG.baseUrl}/docs/${doc.name}`,
      lastmod: doc.updated_at ? doc.updated_at.split('T')[0] : CONFIG.currentDate,
      changefreq: 'monthly',
      priority: 0.7
    }));
    
  } catch (error) {
    console.error('❌ 获取文档时出错：', error);
    return [];
  }
}

/**
 * 从 Supabase 获取所有帖子
 */
async function getPostsFromSupabase() {
  try {
    console.log('💬 从 Supabase 获取帖子...');
    
    // 根据您的实际表结构调整查询
    // 假设您有一个 posts 表
    const { data: posts, error } = await supabase
      .from('posts')
      .select('id, updated_at')
      .eq('published', true) // 只获取已发布的帖子
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('❌ 获取帖子失败：', error);
      return [];
    }
    
    console.log(`✅ 获取到 ${posts.length} 个帖子`);
    
    return posts.map(post => ({
      loc: `${CONFIG.baseUrl}/forum/post/${post.id}`,
      lastmod: post.updated_at ? post.updated_at.split('T')[0] : CONFIG.currentDate,
      changefreq: 'weekly',
      priority: 0.6
    }));
    
  } catch (error) {
    console.error('❌ 获取帖子时出错：', error);
    return [];
  }
}

/**
 * 获取静态页面
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
  console.log(`🌐 网站 URL：${CONFIG.baseUrl}`);
  
  try {
    // 获取所有页面数据
    const staticPages = getStaticPages();
    const documents = await getDocumentsFromSupabase();
    const posts = await getPostsFromSupabase();
    
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
    console.log(`\n💡 提示：请将生成的 sitemap.xml 复制到 public/ 目录`);
    
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