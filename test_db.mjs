const url = 'https://ydaidnppdvzwvdhziifc.supabase.co/rest/v1/products?select=id,name,status';
const apikey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkYWlkbnBwZHZ6d3ZkaHppaWZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NTYxMjUsImV4cCI6MjA4OTIzMjEyNX0.h_K-lJUw2UBLGA9gDFqXV0Ropw_P14lo2USn_J7BSrI';
fetch(url, { headers: { 'apikey': apikey, 'Authorization': 'Bearer ' + apikey } })
  .then(r => r.json())
  .then(d => { console.log("DB PRODUCTS:", d); process.exit(0); })
  .catch(e => { console.error(e); process.exit(1); });
