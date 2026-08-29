import { createClient } from '@supabase/supabase-js';

// This client uses the service role key to bypass RLS policies.
// IT MUST ONLY BE USED IN SERVER COMPONENTS/ACTIONS SECURED BY ADMIN AUTHENTICATION.
export const createAdminClient = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing Supabase URL or Service Role Key in environment variables.');
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
};
