import { createClient } from '@supabase/supabase-js';

// Las variables VITE_* son reemplazadas en tiempo de compilación por Vite.
// En Netlify deben definirse en la sección de variables de entorno.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Supabase] URL o ANON KEY no definidas. Verifica variables en Netlify.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
