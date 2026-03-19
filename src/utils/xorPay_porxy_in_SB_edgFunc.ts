// supabase/functions/proxy_for_xorpay/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  console.log("req: ", req);
  // 处理 CORS 预检请求
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  }

  try {
    // 获取请求头
    const contentType = req.headers.get('content-type') || '';
    
    // 解析请求体
    let body;
    if (contentType.includes('application/x-www-form-urlencoded')) {
      body = await req.text();
    } else {
      body = await req.text();
    }
    
    console.log('Received body:', body);
    
    // 转发请求到 XorPay
    const response = await fetch('https://xorpay.com/api/pay/702889', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body
    });
    
    const data = await response.json();
    
    // 返回响应
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  } catch (error) {
    console.error('代理请求失败:', error);
    return new Response(JSON.stringify({ error: '代理请求失败', details: String(error) }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  }
});