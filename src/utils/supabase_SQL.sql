-- Create helper function to set isPremium = true in auth.users.raw_user_meta_data
CREATE OR REPLACE FUNCTION public.update_user_is_premium(p_user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_set(coalesce(raw_user_meta_data, '{}'::jsonb), '{isPremium}', 'true'::jsonb, true)
  WHERE id = p_user_uuid;
END;
$$;

-- Revoke execute from anon and authenticated roles for safety
REVOKE EXECUTE ON FUNCTION public.update_user_is_premium(uuid) FROM anon, authenticated;

-- Grant execute to service_role (not a DB role; service role uses the key, so ensure function exists)
-- Note: service_role bypasses RLS and is not a database role; no GRANT needed for it.


-- payments 表
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL, -- e.g. 'xorpay'
  provider_charge_id text, -- 第三方的交易 id
  status text NOT NULL DEFAULT 'unknown', -- 归一化的状态值
  amount_cents  numeric, -- 金额，单位为分（整数）
  currency text, -- 币种代码，例如 'CNY', 'USD'
  user_id uuid, -- 可选，关联到你的用户表
  metadata jsonb, -- 业务元数据（非敏感）
  raw_payload jsonb, -- 原始回调内容（请参照最小化敏感信息的策略）
  processed_at timestamptz, -- 业务上处理的时间
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 唯一约束：用于 upsert 去重（provider + provider_charge_id）
-- Unique constraint for upsert behavior
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payments_provider_charge_unique'
  ) THEN
    ALTER TABLE public.payments
      ADD CONSTRAINT payments_provider_charge_unique UNIQUE (provider, provider_charge_id);
  END IF;
END$$;

-- 索引：用于常见查询与 RLS 条件
CREATE INDEX IF NOT EXISTS idx_payments_provider ON public.payments (provider);
CREATE INDEX IF NOT EXISTS idx_payments_provider_charge ON public.payments (provider_charge_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments (user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments (status);

-- 触发器：自动更新 updated_at
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_timestamp_payments') THEN
    CREATE TRIGGER set_timestamp_payments
      BEFORE UPDATE ON public.payments
      FOR EACH ROW
      EXECUTE FUNCTION public.trigger_set_timestamp();
  END IF;
END$$;

-- Add status CHECK constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payments_status_check'
  ) THEN
    ALTER TABLE public.payments
      ADD CONSTRAINT payments_status_check CHECK (status IN ('pending','success','failed','refunded','unknown'));
  END IF;
END$$;

-- Webhook events table for failed writes / retries
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  event_type text,
  payload jsonb,
  attempts int NOT NULL DEFAULT 0,
  last_error text,
  next_retry_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Trigger for webhook_events updated_at
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_timestamp_webhook_events') THEN
    CREATE TRIGGER set_timestamp_webhook_events
      BEFORE UPDATE ON public.webhook_events
      FOR EACH ROW
      EXECUTE FUNCTION public.trigger_set_timestamp();
  END IF;
END$$;

-- Indexes for webhook_events
CREATE INDEX IF NOT EXISTS idx_webhook_events_provider ON public.webhook_events (provider);
CREATE INDEX IF NOT EXISTS idx_webhook_events_next_retry_at ON public.webhook_events (next_retry_at);