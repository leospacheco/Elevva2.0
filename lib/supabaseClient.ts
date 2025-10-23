// leospacheco/elevva2.0/Elevva2.0-614cca7db9fdbc58490ff42844c5a139860d00dd/lib/supabaseClient.ts

import { createClient } from '@supabase/supabase-js';
// REMOVA: import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../env.js';

// Use process.env, que é injetado pelo Vite/Vercel
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // A mensagem de erro agora é mais clara para o ambiente de hospedagem
  throw new Error('As chaves do Supabase (URL e ANON_KEY) não foram carregadas corretamente. Verifique as variáveis de ambiente da Vercel.');
}

// Otimiza a conexão em tempo real para maior estabilidade.
// O restante do código permanece o mesmo:
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});