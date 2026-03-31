# BrowserRouter 服务器配置指南

## 📋 概述

由于您的项目已从 HashRouter 切换到 BrowserRouter，需要配置服务器支持前端路由，确保所有路由都能正确访问，刷新页面时不会出现 404 错误。

## 🔧 不同服务器环境的配置方案

### 1. Nginx 配置

适用于：独立服务器、云服务器、Docker 容器

```nginx
server {
    listen 80;
    server_name www.qingzao.site www.www.qingzao.site;

    root /var/www/qingzao/dist;
    index index.html;

    # 启用 gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # 静态资源缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # React Router 配置 - 所有路由都返回 index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理（如果有后端 API）
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**部署步骤：**
```bash
# 1. 构建项目
npm run build

# 2. 上传 dist 目录到服务器
scp -r dist/* user@server:/var/www/qingzao/

# 3. 配置 Nginx
sudo nano /etc/nginx/sites-available/qingzao

# 4. 创建软链接
sudo ln -s /etc/nginx/sites-available/qingzao /etc/nginx/sites-enabled/

# 5. 测试配置
sudo nginx -t

# 6. 重启 Nginx
sudo systemctl restart nginx
```

### 2. Apache 配置

适用于：共享主机、传统服务器

在项目根目录创建 `.htaccess` 文件：

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# 启用压缩
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# 缓存控制
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

**部署步骤：**
```bash
# 1. 构建项目
npm run build

# 2. 将 .htaccess 文件复制到 dist 目录
cp .htaccess dist/

# 3. 上传 dist 目录内容到服务器
```

### 3. Node.js/Express 配置

适用于：使用 Node.js 后端的服务器

创建 `server.js` 文件：

```javascript
const express = require('express');
const path = require('path');
const history = require('connect-history-api-fallback');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3000;

// 启用 gzip 压缩
app.use(compression());

// 静态文件服务
app.use(express.static(path.join(__dirname, 'dist')));

// API 路由（如果有）
app.use('/api', require('./api/routes'));

// SPA 路由支持 - 所有非 API 请求都返回 index.html
app.use(history({
  index: '/index.html',
  verbose: false
}));

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```

**安装依赖：**
```bash
npm install express connect-history-api-fallback compression
```

**部署步骤：**
```bash
# 1. 构建项目
npm run build

# 2. 启动服务器
node server.js

# 或使用 PM2 管理进程
pm2 start server.js --name "qingzao"
```

### 4. Vercel 配置

适用于：Vercel 平台部署

在项目根目录创建 `vercel.json`：

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

**部署步骤：**
```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 部署
vercel

# 3. 生产环境部署
vercel --prod
```

### 5. Netlify 配置

适用于：Netlify 平台部署

在项目根目录创建 `netlify.toml`：

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

**部署步骤：**
```bash
# 1. 安装 Netlify CLI
npm i -g netlify-cli

# 2. 部署
netlify deploy --prod
```

### 6. GitHub Pages 配置

适用于：GitHub Pages 部署

修改 `vite.config.js`：

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/DecorationMindMap/', // 仓库名称
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
```

在 `.github/workflows/static.yml` 中配置：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
      - uses: actions/deploy-pages@v4
```

**注意：** GitHub Pages 对 SPA 路由支持有限，建议使用 404.html 重定向方案。

### 7. Cloudflare Pages 配置

适用于：Cloudflare Pages 部署

创建 `_redirects` 文件：

```
/* /index.html 200
```

创建 `_headers` 文件：

```
/*
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin

/assets/*
  Cache-Control: public, max-age=31536000, immutable
```

### 8. Docker + Nginx 配置

适用于：容器化部署

创建 `Dockerfile`：

```dockerfile
# 构建阶段
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 生产阶段
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

创建 `nginx.conf`：

```nginx
server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # 静态资源缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**构建和运行：**
```bash
# 构建镜像
docker build -t qingzao-app .

# 运行容器
docker run -d -p 80:80 --name qingzao qingzao-app
```

## 🧪 测试路由配置

### 1. 本地测试

```bash
# 使用 serve 包测试
npm install -g serve
serve -s dist -l 3000

# 访问测试路由
http://localhost:3000/
http://localhost:3000/forum
http://localhost:3000/docs/README
```

### 2. 生产环境测试

```bash
# 测试各个路由
curl -I https://www.qingzao.site/
curl -I https://www.qingzao.site/forum
curl -I https://www.qingzao.site/docs/README

# 检查是否返回 200 状态码
```

### 3. 浏览器测试

1. 访问各个路由页面
2. 刷新页面，确保不会出现 404 错误
3. 检查浏览器控制台是否有错误
4. 测试直接访问深层路由（如 `/docs/README`）

## 🚨 常见问题排查

### 问题 1：刷新页面出现 404

**原因：** 服务器未配置路由重写

**解决方案：** 按照上述配置对应的服务器环境进行配置

### 问题 2：静态资源 404

**原因：** 资源路径配置错误

**解决方案：** 检查 `vite.config.js` 中的 `base` 配置

### 问题 3：API 请求失败

**原因：** API 路由被前端路由拦截

**解决方案：** 确保服务器配置中 API 路由优先级高于前端路由

### 问题 4：缓存问题

**原因：** 浏览器或 CDN 缓存了旧版本

**解决方案：**
- 清除浏览器缓存
- 在构建时添加版本号
- 配置正确的缓存策略

## 📋 部署检查清单

部署前确认：
- [ ] 已将 HashRouter 改为 BrowserRouter
- [ ] 已配置服务器路由重写规则
- [ ] 已测试所有路由都能正常访问
- [ ] 已配置静态资源缓存策略
- [ ] 已启用 gzip 压缩
- [ ] 已配置安全响应头
- [ ] 已更新 robots.txt 和 sitemap.xml
- [ ] 已测试移动端访问
- [ ] 已配置 HTTPS（生产环境）
- [ ] 已设置监控和日志

## 🎯 推荐部署方案

根据您的项目特点，推荐以下部署方案：

1. **快速部署**：使用 Vercel 或 Netlify（零配置）
2. **企业级部署**：使用 Nginx + Docker
3. **成本优化**：使用 GitHub Pages（免费）
4. **高性能**：使用 Cloudflare Pages（全球 CDN）

选择最适合您需求的部署方案，并按照相应的配置指南进行设置。

---

**文档版本**：1.0
**更新日期**：2026-03-24
**适用项目**：装修知识导图 (www.qingzao.site)