import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../env.js';

const supabaseUrl = SUPABASE_URL;
const supabaseAnonKey = SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be provided in env.js');
}

// A inicialização padrão do cliente é suficiente.
// O problema de recarregamento no foco da janela foi corrigido no hook useAuth,
// tornando desnecessária a opção `global: {}` que estava prejudicando as conexões em tempo real.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);