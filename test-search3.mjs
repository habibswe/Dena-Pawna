import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  const search = "inc";
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .or(`type::text.ilike.%${search}%`);
    
  console.log("Error:", error);
}
test();
