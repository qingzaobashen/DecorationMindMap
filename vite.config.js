// 从vite库中导入defineConfig函数，用于定义Vite配置
import { defineConfig } from 'vite'
// 从@vitejs/plugin-react库中导入react插件，用于支持React开发
import react from '@vitejs/plugin-react'

// 注释提示可参考Vite官方文档进行配置
// https://vite.dev/config/
// 导出Vite配置对象，使用defineConfig函数进行包裹
// 这里配置了一个插件，即react插件，用于支持React开发
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
