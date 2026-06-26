import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        const cookie = document.cookie
          .split('; ')
          .find((c) => c.startsWith(`${name}=`))
        return cookie?.split('=')[1]
      },
      set(name: string, value: string, options: any) {
        document.cookie = `${name}=${value}; path=${options.path ?? '/'}; max-age=${options.maxAge ?? 31536000}; ${options.sameSite ? `samesite=${options.sameSite};` : ''} ${options.secure ? 'secure;' : ''}`
      },
      remove(name: string, options: any) {
        document.cookie = `${name}=; path=${options.path ?? '/'}; max-age=0`
      },
    },
  });
}
