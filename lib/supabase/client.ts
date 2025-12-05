'use client';

import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export function createClient() {
  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  );
}

// Export a default instance for backward compatibility
// This will automatically handle cookies in the browser
export const supabase = createClient();

