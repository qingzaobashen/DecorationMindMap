// CloudFlare Worker API代理脚本
// 用于转发前端API请求到后端服务

/**
 * CloudFlare Worker主函数
 * 处理所有传入的请求并转发到后端API
 * @param {Request} request - 客户端请求
 * @param {Object} env - Worker环境变量
 * @returns {Promise<Response>} - 后端API响应
 */
export default {
  async fetch(request, env) {
    // 获取后端API地址
    const backendUrl = env.BACKEND_API_URL || 'https://your-backend-api.example.com';
    
    try {
      // 解析请求URL
      const url = new URL(request.url);
      
      // 构建目标URL，移除/worker路径前缀（如果有）
      let targetPath = url.pathname.replace(/^\/worker/, '');
      const targetUrl = `${backendUrl}${targetPath}${url.search}`;
      
      // 创建新的请求对象，保留原始请求的方法、头信息和正文
      const headers = new Headers(request.headers);
      
      // 设置必要的头信息
      headers.set('X-Forwarded-Host', url.hostname);
      headers.set('X-Forwarded-Proto', url.protocol);
      
      // 移除可能导致问题的头信息
      headers.delete('Origin');
      headers.delete('Host');
      
      // 创建转发请求
      const fetchOptions = {
        method: request.method,
        headers: headers,
        redirect: 'follow'
      };
      
      // 如果不是GET请求，包含请求正文
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        fetchOptions.body = await request.body;
      }
      
      // 发送请求到后端API
      const response = await fetch(targetUrl, fetchOptions);
      
      // 创建响应头，添加CORS支持
      const responseHeaders = new Headers(response.headers);
      responseHeaders.set('Access-Control-Allow-Origin', '*');
      responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      // 返回后端响应，添加CORS头
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders
      });
      
    } catch (error) {
      // 错误处理
      console.error('API Proxy Error:', error);
      
      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: error.message || 'An unknown error occurred'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }
};
