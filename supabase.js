// supabase.js — Supabase client bootstrap
// Load after the Supabase UMD CDN script
(function(){
  const SUPABASE_URL = 'https://tgitprtaxkfrlzpedhsr.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnaXRwcnRheGtmcmx6cGVkaHNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNjExNjksImV4cCI6MjA4MDgzNzE2OX0.5MJschK7xS5xw4xZjKWtgxueNNu9EkY_oo56y3oyJQ0';

  if(!window.supabase){
    console.error('Supabase library not loaded. Ensure CDN script is included before supabase.js');
    return;
  }

  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  window.supabaseClient = client;
})();
