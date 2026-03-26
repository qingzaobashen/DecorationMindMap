/**
 * 自动生成文档 Sitemap 脚本
 * 
 * 此脚本从 public/docs 目录读取所有 Markdown 文件
 * 自动生成包含所有文档的 sitemap.xml
 * 
 * 使用方法：
 * node scripts/generate-docs-sitemap.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 配置
 */
const CONFIG = {
  // 网站基础 URL
  baseUrl: 'https://qingzao.com',
  
  // 文档目录
  docsDir: path.join(__dirname, '../public/docs'),
  
  // sitemap 输出路径
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
 * 读取文档目录中的所有 Markdown 文件
 */
function getDocsFiles() {
  try {
    const files = fs.readdirSync(CONFIG.docsDir);
    
    // 过滤出 .md 文件，排除隐藏文件
    const mdFiles = files.filter(file => 
      file.endsWith('.md') && 
      !file.startsWith('.') &&
      file !== 'MIT_Software_License_Agreement.md' // 排除许可证文件
    );
    
    return mdFiles;
  } catch (error) {
    console.error('❌ 读取文档目录失败:', error);
    return [];
  }
}

/**
 * 获取文件的修改时间
 */
function getFileModTime(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.mtime.toISOString().split('T')[0];
  } catch (error) {
    return CONFIG.currentDate;
  }
}

/**
 * 从文件名生成文档标题
 */
function getDocTitle(fileName) {
  // 移除 .md 扩展名
  const title = fileName.replace('.md', '');
  
  // 将连字符和下划线转换为空格
  return title
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

/**
 * 生成完整的 sitemap.xml
 */
function generateSitemap() {
  console.log('🚀 开始生成文档 sitemap.xml...\n');
  
  try {
    // 获取所有文档文件
    const docFiles = getDocsFiles();
    
    console.log(`📚 找到 ${docFiles.length} 个文档文件`);
    
    // 生成静态页面 URL
    const staticPages = [
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
    
    // 生成文档页面 URL
    const docPages = docFiles.map(fileName => {
      const docName = fileName.replace('.md', '');
      const filePath = path.join(CONFIG.docsDir, fileName);
      const lastmod = getFileModTime(filePath);
      
      return {
        loc: `${CONFIG.baseUrl}/docs/${docName}`,
        lastmod: lastmod,
        changefreq: 'weekly',
        priority: 0.7
      };
    });
    
    // 合并所有 URL
    const allUrls = [...staticPages, ...docPages];
    
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
  
  <!-- 文档页面 -->
${docPages.map(doc => generateUrlElement(
  doc.loc,
  doc.lastmod,
  doc.changefreq,
  doc.priority
)).join('')}
</urlset>`;
    
    // 写入文件
    fs.writeFileSync(CONFIG.outputPath, xmlContent, 'utf8');
    
    console.log(`✅ sitemap.xml 生成成功！`);
    console.log(`📊 统计信息：`);
    console.log(`   - 静态页面：${staticPages.length} 个`);
    console.log(`   - 文档页面：${docPages.length} 个`);
    console.log(`   - 总计：${allUrls.length} 个 URL`);
    console.log(`📁 输出路径：${CONFIG.outputPath}`);
    console.log(`\n📝 文档列表：`);
    docPages.forEach((doc, index) => {
      const title = getDocTitle(doc.loc.split('/').pop());
      console.log(`   ${index + 1}. ${title} (${doc.loc})`);
    });
    
  } catch (error) {
    console.error('❌ 生成 sitemap.xml 失败：', error);
    process.exit(1);
  }
}

/**
 * 主函数
 */
function main() {
  generateSitemap();
}

// 运行脚本
main();