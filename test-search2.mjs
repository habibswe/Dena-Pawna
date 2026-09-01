import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  const search = "habib";
  
  // Step 1: Search people
  const { data: people } = await supabase.from('people').select('id').ilike('name', `%${search}%`);
  const personIds = people?.map(p => p.id) || [];
  
  // Step 2: Search categories
  const { data: cats } = await supabase.from('categories').select('id').ilike('name', `%${search}%`);
  const catIds = cats?.map(c => c.id) || [];

  // Step 3: Construct OR query
  let orQuery = `type.ilike.%${search}%,note.ilike.%${search}%`;
  if (personIds.length > 0) {
    orQuery += `,person_id.in.(${personIds.join(',')})`;
  }
  if (catIds.length > 0) {
    orQuery += `,category_id.in.(${catIds.join(',')})`;
  }
  
  console.log("OR Query:", orQuery);

  const { data, error } = await supabase
    .from('transactions')
    .select('*, people(name), categories(name)')
    .or(orQuery);
    
  console.log("Error:", error);
}
test();
