// leospacheco/elevva2.0/Elevva2.0-614cca7db9fdbc58490ff42844c5a139860d00dd/lib/supabaseClient.ts (ESTADO CORRETO)

import { createClient } from '@supabase/supabase-js';

// CORREÇÃO: Use a sintaxe correta do Vite para ler variáveis VITE_...
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('As chaves do Supabase (URL e ANON_KEY) não foram carregadas corretamente. Verifique as variáveis de ambiente da Vercel.');
}

// Otimiza a conexão em tempo real para maior estabilidade.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
