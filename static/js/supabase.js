// NÃO USE IMPORT!!!
// Supabase já está carregado no <script> do CDN no HTML.

const SUPABASE_URL = "https://flpygmhnpagppxitqkhw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZscHlnbWhucGFncHB4aXRxa2h3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTUzNDIsImV4cCI6MjA3ODk5MTM0Mn0.m1vuSLoc6OX15AExTmbPSlGRWxTMfWXywbreQXYODpA"

// Criar client corretamente no navegador
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log("🔥 Supabase conectado:", supabase);
