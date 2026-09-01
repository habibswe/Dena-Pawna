import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  const search = "habib";
  // The API doesn't document text search for JS sdk easily, but let's check
  // if listUsers takes a filter or something.
  // Actually, listUsers takes { page, perPage }. It doesn't take filtering natively in the standard TS definition.
  const { data, error } = await supabase.auth.admin.listUsers();
  const matched = data?.users.filter(u => u.email.includes(search));
  console.log("Filtered users locally:", matched?.length);
}
test();
