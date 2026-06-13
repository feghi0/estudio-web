import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ccssyrbmjihpcoumwedd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjc3N5cmJtamlocGNvdW13ZWRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyMzk4NTgsImV4cCI6MjA5NjgxNTg1OH0.49yVugaedG2WCFkYcDtvGz85qzTBZahNZylP5b38VZo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) {
    console.error("Error fetching profiles:", error);
  } else {
    console.log("Profiles found:", data);
  }
}

run();
