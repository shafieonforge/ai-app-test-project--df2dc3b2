import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const url: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Supabase client is not configured. Missing URL or anon key.');
  }

  return createBrowserClient(url, key);
}