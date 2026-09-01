import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  const { data: tData, error: tError } = await supabase.from('transactions').select('*, people(name), categories(name), accounts(name)');
  console.log("Transactions Error:", tError);
}
test();
