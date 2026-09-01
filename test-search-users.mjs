import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  const search = "habib";
  
  const { data: profileMatches } = await supabase.from('profiles').select('id').ilike('full_name', `%${search}%`);
  const matchingUserIds = profileMatches?.map(p => p.id) || [];
  
  let orQuery = `name.ilike.%${search}%`;
  if (matchingUserIds.length > 0) {
    orQuery += `,user_id.in.(${matchingUserIds.join(',')})`;
  }
  
  console.log("OR Query:", orQuery);

  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .or(orQuery);
    
  console.log("Accounts Error:", error);
  console.log("Accounts Data Length:", data?.length);
}
test();
