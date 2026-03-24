/**
 * GitHub Pages 部署验证脚本
 * 
 * 此脚本用于验证 GitHub Pages 部署配置是否正确
 * 检查：
 * 1. vite.config.js 中的 base 配置
 * 2. public/404.html 中的仓库名称配置
 * 3. 生成的 dist/index.html 中的资源路径
 * 
 * 使用方法：
 * node scripts/verify-deployment.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 颜色输出
 */
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

/**
 * 输出信息
 */
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * 读取文件内容
 */
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    log(`❌ 无法读取文件: ${filePath}`, 'red');
    return null;
  }
}

/**
 * 检查 vite.config.js 中的 base 配置
 */
function checkViteConfig() {
  log('\n📋 检查 vite.config.js...', 'blue');
  
  const configPath = path.join(__dirname, '../vite.config.js');
  const configContent = readFile(configPath);
  
  if (!configContent) {
    return false;
  }
  
  // 检查是否包含 base 配置
  const hasBase = configContent.includes('base:');
  
  if (!hasBase) {
    log('❌ 未找到 base 配置', 'red');
    return false;
  }
  
  log('✅ 找到 base 配置', 'green');
  
  // 检查是否包含 CI 检查
  const hasCICheck = configContent.includes('process.env.CI');
  
  if (hasCICheck) {
    log('✅ 包含 process.env.CI 检查', 'green');
  } else {
    log('⚠️  未包含 process.env.CI 检查，建议添加', 'yellow');
  }
  
  // 尝试提取仓库名称（从三元表达式中）
  const repoNameMatch = configContent.match(/base:\s*.*?['"]\/([^'"]+)\/['"]/);
  
  if (repoNameMatch) {
    const repoName = repoNameMatch[1];
    log(`✅ 仓库名称: ${repoName}`, 'green');
    return repoName;
  } else {
    log('⚠️  无法自动提取仓库名称，请手动检查', 'yellow');
    return null;
  }
}

/**
 * 检查 public/404.html 中的仓库名称配置
 */
function check404Html(expectedRepoName) {
  log('\n📋 检查 public/404.html...', 'blue');
  
  const htmlPath = path.join(__dirname, '../public/404.html');
  const htmlContent = readFile(htmlPath);
  
  if (!htmlContent) {
    return false;
  }
  
  // 检查仓库名称配置
  const repoNameMatch = htmlContent.match(/const repoName\s*=\s*['"]([^'"]+)['"]/);
  
  if (!repoNameMatch) {
    log('❌ 未找到 repoName 配置', 'red');
    return false;
  }
  
  const repoName = repoNameMatch[1];
  log(`✅ 找到 repoName 配置: ${repoName}`, 'green');
  
  // 检查仓库名称是否一致
  if (expectedRepoName) {
    const expected = `/${expectedRepoName}`;
    
    if (repoName === expected) {
      log('✅ 仓库名称与 vite.config.js 一致', 'green');
      return true;
    } else {
      log(`❌ 仓库名称不一致！`, 'red');
      log(`   vite.config.js: ${expected}`, 'yellow');
      log(`   404.html: ${repoName}`, 'yellow');
      return false;
    }
  }
  
  return true;
}

/**
 * 检查 dist/index.html 中的资源路径
 */
function checkDistHtml() {
  log('\n📋 检查 dist/index.html...', 'blue');
  
  const distPath = path.join(__dirname, '../dist/index.html');
  const distContent = readFile(distPath);
  
  if (!distContent) {
    log('⚠️  dist/index.html 不存在，请先运行 npm run build', 'yellow');
    return false;
  }
  
  // 检查 CSS 文件路径
  const cssMatch = distContent.match(/href="([^"]+\.css)"/);
  
  if (!cssMatch) {
    log('❌ 未找到 CSS 文件引用', 'red');
    return false;
  }
  
  const cssPath = cssMatch[1];
  log(`✅ 找到 CSS 文件路径: ${cssPath}`, 'green');
  
  // 检查 JS 文件路径
  const jsMatch = distContent.match(/src="([^"]+\.js)"/);
  
  if (!jsMatch) {
    log('❌ 未找到 JS 文件引用', 'red');
    return false;
  }
  
  const jsPath = jsMatch[1];
  log(`✅ 找到 JS 文件路径: ${jsPath}`, 'green');
  
  // 检查路径是否包含仓库名称
  const hasRepoPrefix = cssPath.startsWith('/DecorationMindMap/') || jsPath.startsWith('/DecorationMindMap/');
  
  if (hasRepoPrefix) {
    log('✅ 资源路径包含仓库名称前缀', 'green');
    return true;
  } else {
    log('❌ 资源路径不包含仓库名称前缀！', 'red');
    log('   这会导致 GitHub Pages 部署时出现 404 错误', 'yellow');
    return false;
  }
}

/**
 * 检查 dist 目录结构
 */
function checkDistStructure() {
  log('\n📋 检查 dist 目录结构...', 'blue');
  
  const distPath = path.join(__dirname, '../dist');
  
  if (!fs.existsSync(distPath)) {
    log('❌ dist 目录不存在，请先运行 npm run build', 'red');
    return false;
  }
  
  log('✅ dist 目录存在', 'green');
  
  // 检查必要文件
  const requiredFiles = [
    'index.html',
    '404.html',
    'robots.txt',
    'sitemap.xml'
  ];
  
  let allFilesExist = true;
  
  for (const file of requiredFiles) {
    const filePath = path.join(distPath, file);
    
    if (fs.existsSync(filePath)) {
      log(`✅ ${file} 存在`, 'green');
    } else {
      log(`❌ ${file} 不存在`, 'red');
      allFilesExist = false;
    }
  }
  
  // 检查 assets 目录
  const assetsPath = path.join(distPath, 'assets');
  
  if (fs.existsSync(assetsPath)) {
    log('✅ assets 目录存在', 'green');
    
    // 列出 assets 目录中的文件
    const assetFiles = fs.readdirSync(assetsPath);
    log(`   包含 ${assetFiles.length} 个文件:`, 'blue');
    assetFiles.slice(0, 5).forEach(file => {
      log(`   - ${file}`, 'reset');
    });
    
    if (assetFiles.length > 5) {
      log(`   ... 还有 ${assetFiles.length - 5} 个文件`, 'reset');
    }
  } else {
    log('❌ assets 目录不存在', 'red');
    allFilesExist = false;
  }
  
  return allFilesExist;
}

/**
 * 主函数
 */
function main() {
  log('🚀 开始验证 GitHub Pages 部署配置...\n', 'blue');
  
  // 检查 vite.config.js
  const repoName = checkViteConfig();
  
  // 检查 404.html
  const htmlOk = check404Html(repoName);
  
  // 检查 dist 目录结构
  const structureOk = checkDistStructure();
  
  // 检查 dist/index.html
  const distOk = checkDistHtml();
  
  // 总结
  log('\n📊 验证总结:', 'blue');
  
  if (repoName && htmlOk && structureOk && distOk) {
    log('✅ 所有检查通过！可以安全部署到 GitHub Pages', 'green');
    log('\n下一步:', 'blue');
    log('1. 提交代码: git add . && git commit -m "Verify deployment"', 'reset');
    log('2. 推送到 GitHub: git push', 'reset');
    log('3. 等待 GitHub Actions 部署完成', 'reset');
    log('4. 访问您的 GitHub Pages URL', 'reset');
    process.exit(0);
  } else {
    log('❌ 发现问题，请修复后再部署', 'red');
    log('\n常见问题:', 'yellow');
    log('- vite.config.js 中的 base 配置不正确', 'reset');
    log('- public/404.html 中的 repoName 配置不正确', 'reset');
    log('- dist 目录不存在或结构不完整', 'reset');
    log('- 资源路径不包含仓库名称前缀', 'reset');
    log('\n建议:', 'yellow');
    log('1. 运行 npm run build 重新构建', 'reset');
    log('2. 运行 npm run preview 本地预览', 'reset');
    log('3. 检查 vite.config.js 和 public/404.html 配置', 'reset');
    log('4. 再次运行此脚本验证', 'reset');
    process.exit(1);
  }
}

// 运行脚本
main();