import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create a Supabase client with specific fetch options for static data
export const supabaseStaticClient = createClient(supabaseUrl as string, supabaseKey, {
  auth: {
    persistSession: false,
  },
  global: {
    fetch: (url, options) => {
      return fetch(url, {
        ...options,
        cache: 'force-cache', // This ensures data is cached
        next: { revalidate: 3600 }, // Revalidate every hour
      });
    },
  },
}); 