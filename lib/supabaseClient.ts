// leospacheco/elevva2.0/Elevva2.0-2e625c01bf03adbd73590c7f11bb5aa655af3b80/lib/supabaseClient.ts

import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../env.js';

const supabaseUrl = SUPABASE_URL;
const supabaseAnonKey = SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be provided in env.js');
}

// CORREÇÃO: Adicionamos um objeto de opções para o createClient.
// O 'global: {}' força o cliente Supabase a não adicionar seus listeners padrão de
// 'visibilitychange', que causam o re-fetch no foco da janela.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {},
});