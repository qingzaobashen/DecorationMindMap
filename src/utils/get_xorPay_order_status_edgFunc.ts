// supabase/functions/get_xorpay_order_status/index.ts
console.info('get_xorpay_order_status function starting');

Deno.serve(async (req: Request) => {
  // 处理 CORS 预检请求
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    // 仅支持 GET 方法
    if (req.method !== 'GET') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    const url = new URL(req.url);
    const aoid = url.searchParams.get('aoid');

    if (!aoid) {
      return new Response(JSON.stringify({ error: 'Missing aoid query parameter' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    const queryUrl = `https://xorpay.com/api/query/${encodeURIComponent(aoid)}`;

    // 转发请求到 XorPay（使用 GET）
    const response = await fetch(queryUrl, {
      method: 'GET',
      headers: {
        // 按需添加或转发 headers，例如 Authorization（如果客户端传来）
        // 'Authorization': req.headers.get('Authorization') ?? '',
        'Accept': 'application/json',
      },
    });

    const text = await response.text();
    // 尝试解析为 JSON；如果解析失败则返回原始文本
    let payload: unknown;
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }

    // 通过响应状态码传递来自目标的状态（保持透明）
    return new Response(JSON.stringify(payload), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('代理请求失败:', error);
    return new Response(JSON.stringify({ error: '代理请求失败', details: String(error) }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }
});