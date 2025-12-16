/**
 * Supabase客户端实例管理
 * 创建并导出唯一的Supabase客户端实例，供整个应用使用
 */
import { createClient } from '@supabase/supabase-js';

// 创建唯一的Supabase客户端实例
const supabase = createClient(
  import.meta.env.VITE_PUBLIC_SUPABASE_URL,
  import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY
);

export default supabase;
