import { createClient } from '@supabase/supabase-js';

async function test() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  
  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .eq("id", "eae64f34-31a5-4725-84fb-c3e0d5dc71ff")
    .single();
    
  console.log("Data file_url:", data?.file_urls);
  if (error) console.error("Error:", error);
}
test();
