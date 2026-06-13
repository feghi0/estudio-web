import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ccssyrbmjihpcoumwedd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjc3N5cmJtamlocGNvdW13ZWRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyMzk4NTgsImV4cCI6MjA5NjgxNTg1OH0.49yVugaedG2WCFkYcDtvGz85qzTBZahNZylP5b38VZo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const email = `edubot.test.${Math.floor(Math.random() * 100000)}@gmail.com`;
  const password = 'Password123!';

  console.log("Creating test user with email:", email);
  const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
    email,
    password
  });

  if (signUpErr) {
    console.error("SignUp Error:", signUpErr);
    return;
  }

  const user = signUpData.user;
  console.log("User signed up successfully. ID:", user.id);

  // Sign in
  const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (signInErr) {
    console.error("SignIn Error:", signInErr);
    return;
  }

  const session = signInData.session;
  console.log("Logged in session user ID:", session.user.id);

  // Attempt insert using the authenticated client
  const testTask = {
    user_id: session.user.id,
    title: 'Test Task from Authenticated CLI',
    description: 'This is a test description',
    column: 'todo',
    priority: 'medium',
    tags: ['test'],
    due_date: '2026-06-25',
    subtasks: [],
    comments: []
  };

  const { data: insertRes, error: insertErr } = await supabase.from('tasks').insert([testTask]).select();
  if (insertErr) {
    console.error("Insert Error with auth:", insertErr);
  } else {
    console.log("Insert success with auth!:", insertRes);
  }
}

run();
