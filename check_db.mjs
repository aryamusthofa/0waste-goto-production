import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function check() {
  const { data, error } = await supabase.from('products').select('id, name, status, stock, quantity');
  if (error) console.error('Error:', error);
  else {
    console.log('PRODUCTS IN DB:', data);
  }
}
check();
