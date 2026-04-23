// 部署在supabase上的后端API： xorpay-webhook Edge Function
// Verifies HMAC-SHA256 (hex) signature from Xorpay and upserts into public.payments

//Xorpay的请求示例为：curl 'https://xorpay.com/api/pay/702889' --data 'name=alipay%20%E6%B5%8B%E8%AF%95%E8%AE%A2%E5%8D%95toSupabase&pay_type=native&price=0.01&order_id=api-test-1773648423341&order_uid=542749852%40qq.com&notify_url=https%3A%2F%2Fuwgvflkueracnwgwdwpe.supabase.co%2Ffunctions%2Fv1%2Fxorpay-webhook&more=&sign=CF81BE33C164D0149D49113B317D81D0'  
//签名串顺序为：（name,pay_type,price,order_id,notify_url,secret）

//第一次生成的代码
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const XORPAY_SECRET = Deno.env.get('XORPAY_SECRET');

if (!SUPABASE_URL) console.warn('SUPABASE_URL not set');
if (!SUPABASE_SERVICE_ROLE_KEY) console.warn('SUPABASE_SERVICE_ROLE_KEY not set');
if (!XORPAY_SECRET) console.warn('XORPAY_SECRET not set');

async function hmacSha256Hex(keyStr, msgStr) {
  const enc = new TextEncoder();
  const key = enc.encode(keyStr);
  const msg = enc.encode(msgStr);
  const cryptoKey = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, msg);
  const hex = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
  return hex;
}

function timingSafeEqualHex(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

async function verifySignature(req, bodyText) {
  const signature = req.headers.get('x-xorpay-signature') || req.headers.get('x-signature');
  if (!signature || !XORPAY_SECRET) return false;
  // signature expected as hex
  const computed = await hmacSha256Hex(XORPAY_SECRET, bodyText);
  return timingSafeEqualHex(computed, signature);
}

async function upsertPayment(payload) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return false;

  const providerChargeId = payload.id || payload.charge_id || payload.chargeId || null;
  const status = payload.status || payload.state || 'unknown';
  const amount = payload.amount ?? null;
  const currency = payload.currency ?? null;

  // Build body for upsert via REST: use POST with upsert via Prefer: resolution=merge-duplicates
  const row = {
    provider: 'xorpay',
    provider_charge_id: providerChargeId,
    status,
    amount,
    currency,
    raw_payload: payload,
  };

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

  return res.ok;
}

addEventListener('fetch', (event) => {
  event.respondWith(handle(event.request));
});

async function handle(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  }

  const bodyText = await req.text();
  const verified = await verifySignature(req, bodyText);
  if (!verified) {
    return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  let payload;
  try {
    payload = JSON.parse(bodyText);
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  // Process known events if you want (example)
  // Background upsert
  const p = upsertPayment(payload);
  try { (globalThis as any).EdgeRuntime?.waitUntil?.(p); } catch (e) {}

  return new Response(JSON.stringify({ received: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}


// 第二个代码：
// supabase/functions/payment-callback/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// 配置 Supabase 客户端
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// XorPay 配置
const XORPAY_APP_SECRET = Deno.env.get('XORPAY_APP_SECRET')!

// 验证 XorPay 签名
function verifySignature(params: Record<string, string>, secret: string): boolean {
  // 按照 XorPay 文档实现签名验证逻辑
  // 这里需要根据 XorPay 的具体签名规则实现
  return true // 示例实现，实际需要根据文档修改
}

serve(async (req) => {
  try {
    // 解析请求体
    const body = await req.json()
    
    // 验证签名
    if (!verifySignature(body, XORPAY_APP_SECRET)) {
      return new Response('Invalid signature', { status: 400 })
    }
    
    // 处理支付结果
    const { out_trade_no, trade_status, total_fee, attach } = body
    
    if (trade_status === 'SUCCESS') {
      // 解析附加信息（如用户 ID、支付类型等）
      const attachData = JSON.parse(attach || '{}')
      const { user_id, payment_type, article_id } = attachData
      
      // 根据支付类型更新用户状态
      if (payment_type === 'vip') {
        // 升级为 VIP 用户
        await supabase.auth.admin.updateUserById(user_id, {
          user_metadata: {
            isPremium: true,
            premium_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          }
        })
      } else if (payment_type === 'article' && article_id) {
        // 购买文章
        const { data: user } = await supabase.auth.admin.getUserById(user_id)
        const currentPurchasedArticles = user.user_metadata?.purchased_articles || []
        
        if (!currentPurchasedArticles.includes(article_id)) {
          const updatedPurchasedArticles = [...currentPurchasedArticles, article_id]
          
          await supabase.auth.admin.updateUserById(user_id, {
            user_metadata: {
              ...user.user_metadata,
              purchased_articles: updatedPurchasedArticles
            }
          })
        }
      }
    }
    
    // 返回成功响应给 XorPay
    return new Response(JSON.stringify({ code: 0, msg: 'success' }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Payment callback error:', error)
    return new Response('Internal server error', { status: 500 })
  }
})


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
// |more|	    string|	订单传过来的其他信息|
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
//"more": "{}",
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

async function upsertPayment(payload) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return false;

  const providerChargeId = payload.id || payload.charge_id || payload.chargeId || null;
  const status = payload.status || payload.state || 'unknown';
  const amount = payload.amount ?? null;
  const currency = payload.currency ?? null;

  // Build body for upsert via REST: use POST with upsert via Prefer: resolution=merge-duplicates
  const row = {
    provider: 'xorpay',
    provider_charge_id: providerChargeId,
    status,
    amount,
    currency,
    raw_payload: payload,
  };

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

  return res.ok;
}


Deno.serve(async (req) => {
  try {
    const contentType = req.headers.get('content-type') || '';
    const bodyText = await req.text();
    console.info('bodyText:', bodyText);
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

    // Process known events if you want (example)
    // Background upsert
    const p = upsertPayment(payload);
    try { 
        (globalThis as any).EdgeRuntime?.waitUntil?.(p); 
    } catch (e) {}

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


// 第四次生成的代码
// xorpay-webhook Edge Function
// Assumptions:
// - SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are available as environment variables.
// - Amount unit preference: cents (integer).
// - payments table and webhook_events table created as previously.
// - This function is meant to run server-side (Service Role Key required).

interface WebhookPayload {
  id?: string;
  charge_id?: string;
  chargeId?: string;
  status?: string;
  state?: string;
  amount?: number | string;
  price?: number | string;
  currency?: string;
  more?: {
    user_id?: string | null;
    [k: string]: any;
  };
  [k: string]: any;
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const VALID_STATUSES: Record<string, string> = {
  'paid': 'success',
  'success': 'success',
  'completed': 'success',
  'succeeded': 'success',
  'failed': 'failed',
  'cancelled': 'failed',
  'canceled': 'failed',
  'pending': 'pending',
  'refunded': 'refunded',
  'unknown': 'unknown',
};

function normalizeStatus(rawStatus?: any): string {
  if (!rawStatus) return 'unknown';
  const s = String(rawStatus).toLowerCase();
  return VALID_STATUSES[s] ?? 'unknown';
}

function parseAmountToCents(rawAmount?: any): number | null {
  if (rawAmount === null || rawAmount === undefined || rawAmount === '') return null;
  // Support strings like '1.23' or numbers. Return integer cents.
  const n = Number(String(rawAmount).replace(/,/g, ''));
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100);
}

function extractProviderChargeId(payload: WebhookPayload): string | null {
  return (payload.id || payload.charge_id || payload.chargeId || null) as string | null;
}

function sanitizeRawPayload(payload: WebhookPayload) {
  const raw = JSON.parse(JSON.stringify(payload)); // deep clone
  const SENSITIVE_KEYS = ['card_number', 'card_token', 'cvv', 'ssn', 'id_card', 'bank_account', 'pan'];
  for (const k of SENSITIVE_KEYS) {
    if (raw[k]) delete raw[k];
  }
  // mask email if present
  if (raw.email && typeof raw.email === 'string') {
    raw.email = raw.email.replace(/(.{2}).+(@.+)/, '$1***$2');
  }
  // also sanitize nested payment_method details if present
  if (raw.payment_method && typeof raw.payment_method === 'object') {
    delete raw.payment_method.card_number;
    delete raw.payment_method.card_token;
    delete raw.payment_method.cvv;
  }
  return raw;
}

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

async function postWithRetries(url: string, opts: any, attempts = 3) {
  let i = 0;
  while (i < attempts) {
    try {
      const res = await fetchWithTimeout(url, opts, 7000);
      if (res.ok) return { ok: true, res };
      // Retry on 5xx
      if (res.status >= 500) {
        i++;
        await new Promise(r => setTimeout(r, 2 ** i * 200));
        continue;
      }
      // 4xx: don't retry
      return { ok: false, res };
    } catch (err) {
      // network error / timeout
      i++;
      if (i >= attempts) return { ok: false, error: String(err) };
      await new Promise(r => setTimeout(r, 2 ** i * 200));
    }
  }
  return { ok: false, error: 'unknown' };
}

function buildPaymentRow(payload: WebhookPayload) {
  const provider = 'xorpay';
  const provider_charge_id = extractProviderChargeId(payload);
  const status = normalizeStatus(payload.status ?? payload.state);
  const amount_cents = parseAmountToCents(payload.amount ?? payload.price ?? payload.total);
  const currency = payload.currency ?? null;
  const user_id = payload.more?.user_id ?? null;

  const raw_payload = sanitizeRawPayload(payload);

  const row: any = {
    provider,
    provider_charge_id,
    status,
    amount_cents,
    currency,
    raw_payload,
  };
  if (user_id) row.user_id = user_id;
  return row;
}

async function insertOrUpsertPayment(row: any) {
  const url = `${SUPABASE_URL.replace(/\/+$/,'')}/rest/v1/payments`;
  const opts = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Prefer': 'resolution=merge-duplicates',
      'Accept': 'application/json'
    },
    body: JSON.stringify(row),
  };
  return await postWithRetries(url, opts, 3);
}

async function updateUserIsPremium(userId: string) {
  // We'll PATCH auth.users via REST to update raw_user_meta_data.isPremium = true
  // Supabase stores raw_user_meta_data as jsonb. We'll fetch current value then PATCH with merged object.
  const usersUrl = `${SUPABASE_URL.replace(/\/+$/,'')}/rest/v1/auth.users?id=eq.${encodeURIComponent(userId)}`;
  const getOpts = {
    method: 'GET',
    headers: {
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Accept': 'application/json'
    }
  };
  try {
    const res = await fetchWithTimeout(usersUrl, getOpts, 5000);
    if (!res.ok) {
      return { ok: false, status: res.status, text: await res.text() };
    }
    const users = await res.json();
    if (!Array.isArray(users) || users.length === 0) {
      return { ok: false, error: 'user_not_found' };
    }
    const user = users[0];
    const currentMeta = user.raw_user_meta_data ?? {};
    const newMeta = { ...currentMeta, isPremium: true };

    const patchUrl = `${SUPABASE_URL.replace(/\/+$/,'')}/rest/v1/auth.users?id=eq.${encodeURIComponent(userId)}`;
    const patchOpts = {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ raw_user_meta_data: newMeta })
    };
    const patchRes = await fetchWithTimeout(patchUrl, patchOpts, 7000);
    if (!patchRes.ok) {
      return { ok: false, status: patchRes.status, text: await patchRes.text() };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

async function writeWebhookEventOnFailure(provider: string, eventType: string | null, payload: any, lastError: string) {
  const url = `${SUPABASE_URL.replace(/\/+$/,'')}/rest/v1/webhook_events`;
  const row = {
    provider,
    event_type: eventType,
    payload,
    attempts: 0,
    last_error: lastError,
    next_retry_at: null
  };
  const opts = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(row)
  };
  try {
    const res = await fetchWithTimeout(url, opts, 5000);
    if (!res.ok) {
      console.error('Failed to write webhook_events', await res.text());
    }
  } catch (err) {
    console.error('Error writing webhook_events', String(err));
  }
}

Deno.serve(async (req: Request) => {
  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: 'server misconfigured' }), { status: 500 });
    }

    // Only allow POST
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'method_not_allowed' }), { status: 405 });
    }

    const payload: WebhookPayload = await req.json().catch(() => ({}));
    const row = buildPaymentRow(payload);
    const providerChargeId = row.provider_charge_id;

    if (!providerChargeId) {
      // Missing id, still optionally record event and respond 400
      await writeWebhookEventOnFailure('xorpay', null, payload, 'missing_provider_charge_id');
      return new Response(JSON.stringify({ error: 'missing provider charge id' }), { status: 400 });
    }

    // Upsert payment
    const upsertResult = await insertOrUpsertPayment(row);
    if (!upsertResult.ok) {
      const errText = upsertResult.error ?? (upsertResult.res ? await upsertResult.res.text() : 'unknown');
      console.error('Upsert payment failed', errText);
      // write to webhook_events for retry
      await writeWebhookEventOnFailure('xorpay', 'payment_upsert', payload, String(errText));
      return new Response(JSON.stringify({ ok: false, error: 'upsert_failed', detail: String(errText) }), { status: 502 });
    }

    // If user_id present, update auth.users.raw_user_meta_data.isPremium = true
    const userId = row.user_id;
    if (userId) {
      const upd = await updateUserIsPremium(userId);
      if (!upd.ok) {
        console.error('Failed to update user meta', upd);
        // record for retry but still return success for webhook handling (idempotency)
        await writeWebhookEventOnFailure('xorpay', 'update_user_meta', { user_id: userId, payment: row }, String(upd.error ?? upd.text ?? JSON.stringify(upd)));
        // respond 200 to webhook to avoid retries from provider, but note failure in body
        return new Response(JSON.stringify({ ok: true, warning: 'user_update_failed' }), { status: 200 });
      }
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error('Unhandled error in webhook handler', String(err));
    // write to webhook_events for retry
    try {
      const body = await req.text().catch(() => null);
      await writeWebhookEventOnFailure('xorpay', 'handler_exception', body, String(err));
    } catch (e) {
      console.error('Failed to persist error event', String(e));
    }
    return new Response(JSON.stringify({ ok: false, error: 'internal_error' }), { status: 500 });
  }
});