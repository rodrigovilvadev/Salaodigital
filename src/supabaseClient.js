import { createClient } from '@supabase/supabase-js';

// URL correta (ajustada sem o ponto extra no final)
const supabaseUrl = 'https://vqpboodhhyvwtfrpgrk.supabase.co';

// Chave Anon Public (com as aspas obrigatórias)
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxcGJib2RoaHl2d3RmdnJwZ3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyMTE3NDksImV4cCI6MjA4NDc4Nzc0OX0.8Swb8y8YbzTtYuAEc9flAYyIGiYo5fNAqPQJvWqrZEs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);