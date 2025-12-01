// CloudFlare Worker API代理脚本
// 用于转发前端API请求到后端服务
import { Hono } from 'hono'
const app = new Hono();

app.get("/api/", (c) => c.json({ name: "Cloudflare" }));
export default app;
/**
 * CloudFlare Worker主函数
 * 处理所有传入的请求并转发到后端API
 * @param {Request} request - 客户端请求
 * @param {Object} env - Worker环境变量
 * @returns {Promise<Response>} - 后端API响应
 */
//export default {
//  async fetch(request, env, ctx) {
//    return new Response('Hello World!');
//  }
//};
