import { createClient } from '@supabase/supabase-js';

// Las variables VITE_* son reemplazadas en tiempo de compilación por Vite.
// En Netlify deben definirse en la sección de variables de entorno.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

if (!supabase) {
  console.warn('[Supabase] URL o ANON KEY no definidas. El cliente no será inicializado. Configura las variables de entorno en Netlify o crea un .env.local para pruebas locales.');
}
