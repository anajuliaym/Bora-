// Cliente Supabase (auth + banco + storage de fotos).
//
// Config vem de VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY (.env.local — ver
// .env.example). A anon key é pública por design: quem protege os dados são
// as políticas RLS do banco (supabase/migrations/0001_auth_e_fotos.sql).
//
// Sessão/token ficam SÓ EM MEMÓRIA (storage customizado abaixo), nunca em
// localStorage/sessionStorage — um XSS não consegue roubar o token e ele não
// sobrevive a um reload (OWASP A07). Custo: recarregar a página = logar de novo.
//
// A lib (~100 KB) é carregada sob demanda no primeiro uso.

const url = import.meta.env.VITE_SUPABASE_URL || '';
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabaseConfigurado = /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url) && anonKey.length > 20;

const memoria = new Map();
const armazenamentoEmMemoria = {
  getItem: (k) => (memoria.has(k) ? memoria.get(k) : null),
  setItem: (k, v) => { memoria.set(k, v); },
  removeItem: (k) => { memoria.delete(k); },
};

let clientePromise = null;

/** Devolve o cliente Supabase (carrega a lib na primeira chamada). */
export function obterCliente() {
  if (!supabaseConfigurado) return Promise.reject(new Error('Supabase não configurado (ver frontend-react/.env.example)'));
  if (!clientePromise) {
    clientePromise = import('@supabase/supabase-js').then(({ createClient }) =>
      createClient(url, anonKey, {
        auth: {
          storage: armazenamentoEmMemoria,
          persistSession: true,      // "persiste" só dentro do storage em memória
          autoRefreshToken: true,
          detectSessionInUrl: false,
        },
      }),
    );
  }
  return clientePromise;
}
