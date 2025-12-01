// 从vite库中导入defineConfig函数，用于定义Vite配置
import { defineConfig } from 'vite'
// 从@vitejs/plugin-react库中导入react插件，用于支持React开发
import react from '@vitejs/plugin-react'
// 先安装CloudFlare的vite插件，然后再导入cloudflare插件
// 用了这个插件就可以直接用“npm run deploy"来部署worker了？这样就可以同时部署前端react和后端worker了？
import { cloudflare } from "@cloudflare/vite-plugin"

// 注释提示可参考Vite官方文档进行配置
// https://vite.dev/config/
// 导出Vite配置对象，使用defineConfig函数进行包裹
// 这里配置了一个插件，即react插件，用于支持React开发
// 同时添加了CloudFlare的vite插件，用于支持CloudFlare Worker开发
export default defineConfig({
  plugins: [react(), cloudflare()],
})
