import { createBrowserClient } from '@supabase/ssr';

export function createSupabaseBrowserClient() {
  const url: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      'Supabase client is not configured. Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }

  return createBrowserClient(url, key);
}