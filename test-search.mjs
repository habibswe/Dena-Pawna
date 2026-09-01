import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  // Let's insert a fake person to test
  await supabase.from('people').insert({ name: 'Habib Bhai', phone: '01712345678', type: 'customer' });
  
  const search = "hab";
  const { data, error } = await supabase
    .from('people')
    .select('*')
    .or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
    
  console.log("People Error:", error);
  console.log("People Data:", data);
}
test();
