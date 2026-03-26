/**
 * 百度站长平台验证辅助脚本
 * 
 * 此脚本用于验证百度站长平台配置是否正确
 * 检查：
 * 1. 验证文件是否存在
 * 2. 验证文件内容是否正确
 * 3. HTML 标签是否正确
 * 
 * 使用方法：
 * node scripts/verify-baidu.js
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
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
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
    return null;
  }
}

/**
 * 检查验证文件
 */
function checkVerificationFile() {
  log('\n📋 检查百度验证文件...', 'blue');
  
  const verificationCode = 'codeva-gf1t9VJLil';
  const fileName = `baidu_verify_${verificationCode}.txt`;
  const filePath = path.join(__dirname, '../public', fileName);
  
  // 检查文件是否存在
  if (!fs.existsSync(filePath)) {
    log(`❌ 验证文件不存在: ${fileName}`, 'red');
    log('   请创建文件并添加验证代码', 'yellow');
    return false;
  }
  
  log(`✅ 验证文件存在: ${fileName}`, 'green');
  
  // 检查文件内容
  const content = readFile(filePath);
  
  if (!content) {
    log('❌ 无法读取验证文件', 'red');
    return false;
  }
  
  const trimmedContent = content.trim();
  
  if (trimmedContent !== verificationCode) {
    log('❌ 验证文件内容不正确', 'red');
    log(`   期望: ${verificationCode}`, 'yellow');
    log(`   实际: ${trimmedContent}`, 'yellow');
    return false;
  }
  
  log('✅ 验证文件内容正确', 'green');
  log(`   内容: ${verificationCode}`, 'cyan');
  
  return true;
}

/**
 * 检查 HTML 标签
 */
function checkHTMLTag() {
  log('\n📋 检查 HTML 验证标签...', 'blue');
  
  const filePath = path.join(__dirname, '../index.html');
  const content = readFile(filePath);
  
  if (!content) {
    log('❌ 无法读取 index.html', 'red');
    return false;
  }
  
  const verificationCode = 'codeva-gf1t9VJLil';
  const metaTagPattern = /<meta\s+name=["']baidu-site-verification["']\s+content=["']([^"']+)["']\s*\/?>/i;
  const match = content.match(metaTagPattern);
  
  if (!match) {
    log('❌ 未找到百度验证标签', 'red');
    log('   请在 index.html 中添加:', 'yellow');
    log(`   <meta name="baidu-site-verification" content="${verificationCode}" />`, 'cyan');
    return false;
  }
  
  const tagContent = match[1];
  
  if (tagContent !== verificationCode) {
    log('❌ 验证标签内容不正确', 'red');
    log(`   期望: ${verificationCode}`, 'yellow');
    log(`   实际: ${tagContent}`, 'yellow');
    return false;
  }
  
  log('✅ 验证标签存在且内容正确', 'green');
  log(`   内容: ${verificationCode}`, 'cyan');
  
  return true;
}

/**
 * 检查 dist 目录
 */
function checkDistDirectory() {
  log('\n📋 检查 dist 目录...', 'blue');
  
  const distPath = path.join(__dirname, '../dist');
  
  if (!fs.existsSync(distPath)) {
    log('⚠️  dist 目录不存在，请先运行 npm run build', 'yellow');
    return false;
  }
  
  log('✅ dist 目录存在', 'green');
  
  // 检查验证文件是否在 dist 目录中
  const verificationCode = 'codeva-gf1t9VJLil';
  const fileName = `baidu_verify_${verificationCode}.txt`;
  const filePath = path.join(distPath, fileName);
  
  if (!fs.existsSync(filePath)) {
    log(`⚠️  验证文件未复制到 dist 目录`, 'yellow');
    log('   运行 npm run build 后会自动复制', 'cyan');
    return false;
  }
  
  log(`✅ 验证文件已复制到 dist 目录`, 'green');
  
  return true;
}

/**
 * 主函数
 */
function main() {
  log('🚀 开始验证百度站长平台配置...\n', 'blue');
  
  // 检查验证文件
  const fileOk = checkVerificationFile();
  
  // 检查 HTML 标签
  const tagOk = checkHTMLTag();
  
  // 检查 dist 目录
  const distOk = checkDistDirectory();
  
  // 总结
  log('\n📊 验证总结:', 'blue');
  
  if (fileOk && tagOk && distOk) {
    log('✅ 所有检查通过！可以提交到百度站长平台', 'green');
    log('\n验证方式:', 'blue');
    log('1. 文件验证（推荐）:', 'cyan');
    log('   URL: https://www.qingzao.site/baidu_verify_codeva-gf1t9VJLil.txt', 'reset');
    log('2. HTML 标签验证:', 'cyan');
    log('   URL: https://www.qingzao.site', 'reset');
    log('   注意: 如果存在 301 重定向，建议使用文件验证', 'yellow');
    log('\n下一步:', 'blue');
    log('1. 运行 npm run build 构建项目', 'reset');
    log('2. 提交代码: git add . && git commit -m "Add Baidu verification"', 'reset');
    log('3. 推送到 GitHub: git push', 'reset');
    log('4. 在百度站长平台验证', 'reset');
    process.exit(0);
  } else {
    log('❌ 发现问题，请修复后再验证', 'red');
    log('\n常见问题:', 'yellow');
    log('- 验证文件不存在或内容不正确', 'reset');
    log('- HTML 标签不存在或内容不正确', 'reset');
    log('- dist 目录不存在或验证文件未复制', 'reset');
    log('\n建议:', 'yellow');
    log('1. 检查 public/baidu_verify_codeva-gf1t9VJLil.txt 文件', 'reset');
    log('2. 检查 index.html 中的验证标签', 'reset');
    log('3. 运行 npm run build 重新构建', 'reset');
    log('4. 再次运行此脚本验证', 'reset');
    process.exit(1);
  }
}

// 运行脚本
main();