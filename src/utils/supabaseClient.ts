import { createBrowserClient } from '@supabase/ssr' // v2
 import { Database } from '@/types/supabase'         // 型生成している場合

 export const supabase = createBrowserClient<Database>(
// export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
)
