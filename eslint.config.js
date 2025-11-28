// 导入ESLint核心配置
import js from '@eslint/js'
// 导入全局变量配置
import globals from 'globals'
// 导入React Hooks插件
import reactHooks from 'eslint-plugin-react-hooks'
// 导入React Refresh插件
import reactRefresh from 'eslint-plugin-react-refresh'

// 导出ESLint配置
export default [
  // 忽略dist目录
  { ignores: ['dist'] },
  {
    // 匹配所有js和jsx文件
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      // 使用ECMAScript 2020版本
      ecmaVersion: 2020,
      // 设置全局变量为浏览器环境
      globals: globals.browser,
      parserOptions: {
        // 使用最新的ECMAScript版本
        ecmaVersion: 'latest',
        // 启用JSX支持
        ecmaFeatures: { jsx: true },
        // 设置模块类型为ES模块
        sourceType: 'module',
      },
    },
    plugins: {
      // 启用React Hooks插件
      'react-hooks': reactHooks,
      // 启用React Refresh插件
      'react-refresh': reactRefresh,
    },
    rules: {
      // 继承ESLint推荐规则
      ...js.configs.recommended.rules,
      // 继承React Hooks推荐规则
      ...reactHooks.configs.recommended.rules,
      // 启用未使用变量检查，忽略以大写字母或下划线开头的变量
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      // 启用React Refresh组件导出警告，允许常量导出
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
]
