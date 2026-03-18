
//第三次代码：使用了xorpay提供的签名算法，签名串顺序已确定，
// xorpay-webhook Edge Function
// Verifies MD5 signature from Xorpay and upserts into public.payments

// 我们前端向XorPay请求API时的参数如下：
//{"name":"alipay 测试订单toSupabase", "pay_type":"native", "price":"0.01", "order_id":"api-test-1773648423341", "order_uid":"542749852@qq.com", "notify_url":"https://uwgvflkueracnwgwdwpe.supabase.co/functions/v1/xorpay-webhook", "sign":"CF81BE33C164D0149D49113B317D81D0"}

// XorPay回调supabase时，给的参数示例如下：
// |名称|	     类型|	说明|
// |aoid|	    string|	XorPay 平台订单唯一标识|
// |order_id|	string|	你传入的 order_id 参数|
// |pay_price|	float|	例如: 50.00|
// |pay_time|	string|	例如: 2019-01-01 00:00:00|
// |more|	    string|	订单传过来的其他信息，如user_id|
// |detail|	    string|	json格式，订单支付详细信息 \
//                  transaction_id:	渠道流水号 \
//                  bank_type:	用户付款方式 \
//                  buyer:	消费者 |
// |sign|	    string|	签名, 参数 aoid + order_id + pay_price + pay_time + app secret 顺序拼接后 MD5
// 
//{"aoid": "001",
//"order_id": "api-test-1773648423341",
//"pay_price": "0.01",
//"pay_time": "2026-03-10 10:00:00",
//"more": "{\"user_id\":\"1faf1c9c-447e-4bcf-9da4-341e6b850c76\"}",
//"detail": "xxxx",
//"sign" : "c6fcb85f2e9b4ad5808919ae28a30d35"
//}
import { createHash } from "node:crypto";
console.info('xorpay-webhook started');

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const XORPAY_SECRET = Deno.env.get('XORPAY_SECRET');

if (!SUPABASE_URL) console.warn('SUPABASE_URL not set');
if (!SUPABASE_SERVICE_ROLE_KEY) console.warn('SUPABASE_SERVICE_ROLE_KEY not set');
if (!XORPAY_SECRET) console.warn('XORPAY_SECRET not set');

// ********* 插入前的数据校验与规范化 start *********
// 关键目标：
// 把 amount 解析为数值并拒绝非法值。
// 将 status 归一到受控枚举（例如: pending, success, failed, refunded, unknown）。
// 清洗/映射字段名（provider_charge_id 等）。
// 限制 raw_payload 存储：去除或脱敏敏感字段（如 card_number, card_token, id_card, email 视策略而定）。
const VALID_STATUSES = {
  'paid': 'success',
  'success': 'success',
  'completed': 'success',
  'failed': 'failed',
  'cancelled': 'failed',
  'pending': 'pending',
  'unknown': 'unknown',
};

function normalizeStatus(rawStatus) {
  if (!rawStatus) return 'unknown';
  const s = String(rawStatus).toLowerCase();
  return VALID_STATUSES[s] ?? 'unknown';
}

function parseAmount(rawAmount) {
  if (rawAmount === null || rawAmount === undefined || rawAmount === '') return null;
  // 支持字符串 '0.01' 或数字，尽量按小数点保留两位
  const n = Number(String(rawAmount).replace(/,/g, ''));
  if (!Number.isFinite(n)) return null;
  // 可根据存储策略返回分（整数）或 decimals（numeric）
  // 这里返回浮点数（谨慎：浮点可能带精度问题）
  // return Math.round(n * 100) / 100;
  // 若使用整数（以分为单位）存储金额则能避免浮点精度问题：该函数返回 Math.round(n * 100) 并把表的 amount 改为 bigint 或 numeric，或新列 amount_cents bigint。
  return Math.round(n * 100);
}

function buildRowFromPayload(payload) {
  console.info('buildRowFromPayload payload:', payload);

  const provider = 'xorpay';
  const providerChargeId = payload.order_id || payload.id || payload.charge_id || payload.chargeId || null;
  const status = normalizeStatus(payload.status || payload.state);
  const amount_cents = parseAmount(payload.pay_price ?? payload.amount ?? payload.price);
  const currency = payload.currency ?? null;
  console.info('buildRowFromPayload more:', payload.more);
  
  // 处理XorPay返回的more字段，可能使用单引号而不是标准双引号
  let more;
  try {
    // 先尝试直接解析
    more = JSON.parse(payload.more || '{}');
  } catch (error) {
    // 如果失败，尝试将单引号替换为双引号后再解析
    try {
      const fixedMore = payload.more.replace(/'/g, '"');
      more = JSON.parse(fixedMore || '{}');
    } catch (retryError) {
      console.error('解析more字段失败:', retryError);
      more = {};
    }
  }
  
  const user_id = more?.user_id ?? null;
  console.info('buildRowFromPayload user_id:', user_id);

  // 最小化 raw_payload：拷贝并删除敏感字段
  const raw = { ...payload };
  delete raw.card_number;
  delete raw.card_token;
  delete raw.cvv;
  // 视需要删除或掩码 email / phone / id_card 等
  if (raw.email) {
    raw.email = String(raw.email).replace(/(.{2}).+(@.+)/, '$1***$2'); // 简单掩码示例
  }

  return {
    provider,
    provider_charge_id: providerChargeId,
    user_id,
    status,
    amount_cents ,
    currency,
    raw_payload: raw,
  };
}
// ********* 插入前的数据校验与规范化 end *********

async function fetchWithTimeout(url: string, opts: any = {}, timeoutMs = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

// 更新订单表 payments
async function upsertPayment(row) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return false;

  console.log('upsertPayment row:', row);


  const url = `${SUPABASE_URL.replace(/\/+$/,'')}/rest/v1/payments`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Prefer': 'resolution=merge-duplicates',
    },
    body: JSON.stringify(row),
  });
  console.log('upsertPayment res:', res.status, res.statusText);

  return res.ok;
}

// 更新用户表中的 isPremium 字段
// 替换原有的 updateUserIsPremium 函数，改为调用 RPC public.update_user_is_premium
async function updateUserIsPremium(userId: string) {
  const url = `${SUPABASE_URL.replace(/\/+$/,'')}/rest/v1/rpc/update_user_is_premium`;
  const opts = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      // prefer single-statement commit
      'Prefer': 'tx=commit'
    },
    body: JSON.stringify({ p_user_uuid: userId })
  };
  try {
    const res = await fetchWithTimeout(url, opts, 7000);
    if (!res.ok) {
      return { ok: false, status: res.status, text: await res.text() };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

Deno.serve(async (req) => {
  try {
    const contentType = req.headers.get('content-type') || '';
    const bodyText = await req.text();
    console.info('bodyText:', bodyText, typeof bodyText);
    // parse form
    let params = new URLSearchParams();
    if (contentType.includes('application/x-www-form-urlencoded')) {
      params = new URLSearchParams(bodyText);
    } else {
      // try parse json -> convert to params
      try {
        const j = JSON.parse(bodyText || '{}');
        for (const k of Object.keys(j)) params.set(k, String(j[k] ?? ''));
      } catch (_) {}
    }

    const providedSign = (params.get('sign') || '').toLowerCase();
    if (!providedSign) return new Response(JSON.stringify({ error: 'missing sign' }), { status: 400 });

    // signature string order: aoid + order_id + pay_price + pay_time + app secret 顺序拼接后 MD5
    const secret = Deno.env.get('XORPAY_SECRET') || '';
    if (!secret) return new Response(JSON.stringify({ error: 'missing XORPAY_SECRET env' }), { status: 500 });

    const build = (k:string) => params.get(k) ?? '';
    const signingString = build('aoid') + build('order_id') + build('pay_price') + build('pay_time') + secret;

    const hash = createHash('md5').update(signingString, 'utf8').digest('hex').toLowerCase();

    // timing-safe compare
    const ok = timingSafeEqual(hash, providedSign);
    if (!ok) {
      //console.error('sign not ok:',signingString, hash, providedSign);
      return new Response(JSON.stringify({ error: 'invalid signature' }), { status: 401 });
    }
    console.info('sign ok:', hash, providedSign);
    // Process payload: example insert into payments table via REST using service role
    // For brevity we just return success. In production, upsert into Supabase DB using SUPABASE_SERVICE_ROLE_KEY.
    
    let payload;
    try {
      payload = JSON.parse(bodyText);
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Build body for upsert via REST: use POST with upsert via Prefer: resolution=merge-duplicates
    const row = buildRowFromPayload(payload);

    // Process known events if you want (example)
    // Background upsert
    const p = upsertPayment(row);
    try { 
        (globalThis as any).EdgeRuntime?.waitUntil?.(p); 
    } catch (e) {}

    // If user_id present, update auth.users.raw_user_meta_data.isPremium = true
    const userId = row.user_id;
    console.info('updateUser userId:', userId);
    if (userId) {
      const upd = await updateUserIsPremium(userId);
      if (!upd.ok) {
        console.error('Failed to update user meta', upd);
        // respond 200 to webhook to avoid retries from provider, but note failure in body
        return new Response(JSON.stringify({ ok: true, warning: 'user_update_failed' }), { status: 200 });
      }
      console.info('Successfully updated user meta for', userId);
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'internal' }), { status: 500 });
  }
});

function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const la = a.length, lb = b.length;
  if (la !== lb) return false;
  let diff = 0;
  for (let i = 0; i < la; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}