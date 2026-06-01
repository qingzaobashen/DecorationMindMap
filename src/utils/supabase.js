/**
 * Supabase客户端实例管理
 * 创建并导出唯一的Supabase客户端实例，供整个应用使用
 * 支持多设备并发登录：每个设备拥有独立会话，互不影响
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://uwgvflkueracnwgwdwpe.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export default supabase;
