# 快速部署指南 - BrowserRouter 路由配置

## 🚀 快速选择部署方案

根据您的需求选择最合适的部署方案：

| 部署方案 | 适用场景 | 配置难度 | 成本 | 推荐指数 |
|---------|---------|---------|------|---------|
| **Vercel** | 个人项目、快速部署 | ⭐ 极简单 | 免费 | ⭐⭐⭐⭐⭐⭐ |
| **Netlify** | 个人项目、快速部署 | ⭐ 极简单 | 免费 | ⭐⭐⭐⭐⭐ |
| **Nginx** | 企业级、高性能 | ⭐⭐⭐ 中等 | 服务器费用 | ⭐⭐⭐⭐ |
| **Apache** | 共享主机 | ⭐⭐ 简单 | 共享主机费用 | ⭐⭐⭐ |
| **GitHub Pages** | 开源项目 | ⭐⭐ 简单 | 免费 | ⭐⭐⭐ |

## 📦 推荐方案：Vercel（最简单）

### 1. 安装 Vercel CLI
```bash
npm i -g vercel
```

### 2. 部署项目
```bash
# 在项目根目录执行
vercel

# 按照提示操作：
# - Set up and deploy? Y
# - Which scope? 选择您的账户
# - Link to existing project? N
# - What's your project's name? qingzao
# - In which directory is your code located? ./
# - Want to override the settings? N
```

### 3. 生产环境部署
```bash
vercel --prod
```

**完成！** Vercel 会自动处理路由重写，无需额外配置。

## 📦 备选方案：Netlify（也很简单）

### 1. 安装 Netlify CLI
```bash
npm i -g netlify-cli
```

### 2. 部署项目
```bash
# 在项目根目录执行
netlify deploy --prod

# 按照提示操作：
# - This folder contains a dynamically generated app? Y
# - Command to build site: npm run build
# - Directory to deploy: dist
```

**完成！** Netlify 会自动处理路由重写。

## 📦 企业方案：Nginx（推荐用于生产环境）

### 1. 构建项目
```bash
npm run build
```

### 2. 上传到服务器
```bash
# 使用 SCP 上传
scp -r dist/* user@your-server:/var/www/qingzao/

# 或使用 FTP/SFTP 工具上传
```

### 3. 配置 Nginx
```bash
# 复制 nginx.conf 到服务器配置目录
scp nginx.conf user@your-server:/etc/nginx/sites-available/qingzao

# SSH 登录服务器
ssh user@your-server

# 创建软链接
sudo ln -s /etc/nginx/sites-available/qingzao /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

### 4. 配置域名
```bash
# 在域名服务商处添加 A 记录
# A 记录: qingzao.com -> 您的服务器 IP
# A 记录: www.qingzao.com -> 您的服务器 IP
```

## 📦 共享主机方案：Apache

### 1. 构建项目
```bash
npm run build
```

### 2. 复制 .htaccess 到 dist 目录
```bash
cp .htaccess dist/
```

### 3. 上传到服务器
```bash
# 使用 FTP/SFTP 工具上传 dist 目录内容到网站根目录
```

**完成！** Apache 会自动读取 .htaccess 文件处理路由。

## 📦 开源方案：GitHub Pages

### 1. 修改 vite.config.js
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/DecorationMindMap/', // 修改为您的仓库名称
  build: {
    outDir: 'dist'
  }
})
```

### 2. 推送到 GitHub
```bash
git add .
git commit -m "Add GitHub Pages support"
git push
```

### 3. 启用 GitHub Pages
1. 访问仓库设置页面
2. 找到 "Pages" 设置
3. 选择 "Source" 为 "GitHub Actions"
4. 保存设置

**注意：** GitHub Pages 对 SPA 路由支持有限，建议使用 Vercel 或 Netlify。

## ✅ 部署后验证

### 1. 测试路由
访问以下 URL，确保都能正常访问：
- https://qingzao.com/
- https://qingzao.com/forum
- https://qingzao.com/docs/README

### 2. 测试刷新
在每个页面按 F5 刷新，确保不会出现 404 错误。

### 3. 检查控制台
打开浏览器开发者工具，检查是否有错误信息。

### 4. 测试移动端
在手机上访问网站，确保移动端体验良好。

## 🎯 推荐部署流程

### 对于个人项目（推荐 Vercel）
```bash
# 1. 本地开发
npm run dev

# 2. 测试
npm run build && npm run preview

# 3. 部署
vercel --prod
```

### 对于企业项目（推荐 Nginx）
```bash
# 1. 本地开发
npm run dev

# 2. 构建
npm run build

# 3. 部署到服务器
./deploy.sh  # 创建部署脚本

# 4. 监控日志
tail -f /var/log/nginx/qingzao_access.log
```

## 🛠️ 创建部署脚本（可选）

创建 `deploy.sh` 文件：

```bash
#!/bin/bash

# 配置变量
SERVER_USER="your-user"
SERVER_HOST="your-server.com"
SERVER_PATH="/var/www/qingzao"
LOCAL_DIST="./dist"

# 构建
echo "Building project..."
npm run build

# 上传
echo "Uploading to server..."
rsync -avz --delete $LOCAL_DIST/ $SERVER_USER@$SERVER_HOST:$SERVER_PATH/

# 重启 Nginx（需要 sudo 权限）
echo "Restarting Nginx..."
ssh $SERVER_USER@$SERVER_HOST "sudo systemctl restart nginx"

echo "Deployment completed!"
```

使用方法：
```bash
chmod +x deploy.sh
./deploy.sh
```

## 📋 部署检查清单

部署前确认：
- [ ] 已将 HashRouter 改为 BrowserRouter
- [ ] 已选择部署方案
- [ ] 已测试本地构建
- [ ] 已配置环境变量（如需要）
- [ ] 已准备域名和服务器

部署后验证：
- [ ] 所有路由都能正常访问
- [ ] 刷新页面不会出现 404
- [ ] 静态资源加载正常
- [ ] 移动端访问正常
- [ ] HTTPS 配置正确（生产环境）
- [ ] robots.txt 和 sitemap.xml 可访问
- [ ] 已提交 sitemap 到搜索引擎

## 🔧 故障排除

### 问题：部署后页面空白
**解决方案：** 检查浏览器控制台，查看是否有资源加载错误。

### 问题：刷新页面 404
**解决方案：** 确认服务器配置了路由重写规则。

### 问题：API 请求失败
**解决方案：** 检查 API 路由配置，确保没有被前端路由拦截。

### 问题：静态资源 404
**解决方案：** 检查 `vite.config.js` 中的 `base` 配置。

## 📞 获取帮助

如果遇到问题：
1. 查看详细配置文档：[SERVER_ROUTING_CONFIG.md](./SERVER_ROUTING_CONFIG.md)
2. 检查服务器日志
3. 在浏览器开发者工具中查看网络请求
4. 联系服务器提供商技术支持

---

**推荐选择：** 对于您的装修知识导图项目，推荐使用 **Vercel** 或 **Netlify**，因为它们配置简单、免费、性能优秀，且自动处理路由重写问题。

**文档版本**：1.0
**更新日期**：2026-03-24