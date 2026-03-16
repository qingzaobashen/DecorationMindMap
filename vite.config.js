// 从vite库中导入defineConfig函数，用于定义Vite配置
import { defineConfig } from 'vite'
// 从@vitejs/plugin-react库中导入react插件，用于支持React开发
import react from '@vitejs/plugin-react'
// 先安装CloudFlare的vite插件，然后再导入cloudflare插件
// 用了这个插件就可以直接用“npm run dev"来通过vite启动worker了,这样就可以同时部署前端react和后端worker了？
import { cloudflare } from "@cloudflare/vite-plugin"

// 示可参考Vite官方文档进行配置
// https://vite.dev/config/
// 导出Vite配置对象，使用defineConfig函数进行包裹
// 这里配置了一个插件，即react插件，用于支持React开发
// 同时添加了CloudFlare的vite插件，用于支持CloudFlare Worker开发
export default defineConfig({
  // plugins:[react(),cloudflare()], // 这里还是暂时不用cloudflare的vite插件，这会导致npm run dev时报错，
  // 若想启动worker，则运行命令：npx wrangler dev; 运行npm run dev只会启动前端服务器
  plugins: [react()],
  // 配置base路径，解决GitHub Pages部署时的404错误
  // 注意：如果仓库名称改变，需要相应修改这里的路径
  // 动态设置base路径：生产构建时使用GitHub Pages路径，开发和本地预览时使用根路径
  // base: process.env.NODE_ENV === 'production' ? '/DecorationMindMap/' : '/'
  

  // 以下是vite的典型配置的说明，可参考
  // // 项目根目录，默认为当前工作目录
  // root: path.resolve(__dirname, './src'),

  // // 基础路径，用于部署在子路径时使用
  // base: '/my-app/',

  // // 开发服务器配置
  // server: {
  //   // 指定开发服务器端口
  //   port: 3000,
  //   // 是否自动打开浏览器
  //   open: true,
  //   // 配置代理服务器，用于解决跨域问题
  //   proxy: {
  //     '/api': {
  //       target: 'http://localhost:8080', // 目标服务器地址
  //       changeOrigin: true, // 是否改变请求源
  //       rewrite: (path) => path.replace(/^\/api/, ''), // 重写请求路径
  //     },
  //   },
  // },

  // // 构建配置
  // build: {
  //   // 指定输出目录
  //   outDir: path.resolve(__dirname, '../dist'),
  //   // 指定静态资源目录
  //   assetsDir: 'static',
  //   // 是否生成 sourcemap 文件
  //   sourcemap: true,
  //   // 是否压缩代码
  //   minify: 'terser', // 使用 terser 进行代码压缩
  //   // 配置 Rollup 选项
  //   rollupOptions: {
  //     // 配置外部依赖
  //     external: ['lodash'],
  //     // 配置输出格式
  //     output: {
  //       manualChunks: {
  //         // 将 lodash 单独打包
  //         lodash: ['lodash'],
  //       },
  //     },
  //   },
  // },

  // // 插件配置
  // plugins: [
  //   // 使用 Vue 插件
  //   vue(),
  // ],

  // // 模块解析配置
  // resolve: {
  //   // 配置路径别名
  //   alias: {
  //     '@': path.resolve(__dirname, './src'), // 将 @ 映射到 src 目录
  //   },
  // },

  // // CSS 配置
  // css: {
  //   // 配置 CSS 预处理器选项
  //   preprocessorOptions: {
  //     scss: {
  //       // 全局注入 SCSS 变量
  //       additionalData: `@import "@/styles/variables.scss";`,
  //     },
  //   },
  // },

  // // 环境变量配置
  // envPrefix: 'VITE_', // 环境变量前缀，默认为 VITE_
})
