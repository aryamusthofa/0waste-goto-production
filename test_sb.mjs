import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ydaidnppdvzwvdhziifc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkYWlkbnBwZHZ6d3ZkaHppaWZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NTYxMjUsImV4cCI6MjA4OTIzMjEyNX0.h_K-lJUw2UBLGA9gDFqXV0Ropw_P14lo2USn_J7BSrI'
);

async function test() {
  console.log("Fetching...");
  const { data, error } = await supabase.from('products').select('*').neq('status', 'sold_out').order('created_at', { ascending: false });
  console.log("Error:", error);
  console.log("Data length:", data ? data.length : null);
  process.exit(0);
}
test();
