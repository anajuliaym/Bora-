// Conta (login/cadastro) e fotos do feed via Supabase.
// Se o Supabase não estiver configurado, as telas caem no modo protótipo
// (navegam sem autenticar) — ver Login.jsx / Cadastro.jsx.
import { obterCliente, supabaseConfigurado } from './lib/supabase.js';

export { supabaseConfigurado };

const BUCKET = 'fotos';

// Mensagens do Supabase (inglês) -> texto pro usuário.
function traduzir(error) {
  const m = error?.message || '';
  if (/invalid login credentials/i.test(m)) return 'Email ou senha incorretos.';
  if (/email not confirmed/i.test(m)) return 'Confirme seu email antes de entrar (veja a caixa de entrada).';
  if (/already registered|already been registered/i.test(m)) return 'Esse email já tem conta. Tente entrar.';
  if (/password should be at least/i.test(m)) return 'A senha precisa ter pelo menos 6 caracteres.';
  if (/valid email/i.test(m)) return 'Digite um email válido.';
  if (/perfis_usuario_key|duplicate key/i.test(m)) return 'Esse @usuario já está em uso.';
  if (/rate limit/i.test(m)) return 'Muitas tentativas. Espere um pouco e tente de novo.';
  if (/failed to fetch|networkerror/i.test(m)) return 'Sem conexão com o Supabase.';
  return m || 'Algo deu errado. Tente de novo.';
}

const erro = (e) => new Error(traduzir(e));

async function perfilDe(sb, userId) {
  const { data } = await sb.from('perfis').select('id, nome, usuario, xp').eq('id', userId).maybeSingle();
  return data;
}

function montarUsuario(user, perfil) {
  return {
    id: user.id,
    email: user.email,
    nome: perfil?.nome || user.user_metadata?.nome || user.email.split('@')[0],
    usuario: perfil?.usuario || user.user_metadata?.usuario || user.email.split('@')[0],
    xp: perfil?.xp ?? 0,
  };
}

// ---- conta ------------------------------------------------------------------

export async function entrar(email, senha) {
  const sb = await obterCliente();
  const { data, error } = await sb.auth.signInWithPassword({ email: email.trim(), password: senha });
  if (error) throw erro(error);
  return montarUsuario(data.user, await perfilDe(sb, data.user.id));
}

/**
 * Cria a conta. Se o projeto exigir confirmação de email (padrão do Supabase),
 * devolve { precisaConfirmarEmail: true } e o usuário precisa clicar no link.
 * Pra demo: Authentication > Providers > Email > desligar "Confirm email".
 */
export async function cadastrar({ nome, email, usuario, senha }) {
  const sb = await obterCliente();
  const { data, error } = await sb.auth.signUp({
    email: email.trim(),
    password: senha,
    options: { data: { nome: nome.trim(), usuario: usuario.trim().toLowerCase().replace(/^@/, '') } },
  });
  if (error) throw erro(error);
  if (!data.session) return { precisaConfirmarEmail: true };
  return { usuario: montarUsuario(data.user, await perfilDe(sb, data.user.id)) };
}

export async function sair() {
  const sb = await obterCliente();
  await sb.auth.signOut();
}

export async function usuarioAtual() {
  const sb = await obterCliente();
  const { data } = await sb.auth.getUser();
  if (!data?.user) return null;
  return montarUsuario(data.user, await perfilDe(sb, data.user.id));
}

// ---- fotos ------------------------------------------------------------------

async function paraBlob(origem) {
  // origem: data URL (canvas.toDataURL da câmera) ou caminho de asset.
  const res = await fetch(origem);
  return res.blob();
}

/** Sobe a foto pro Storage (<user_id>/<timestamp>.jpg) e registra em `fotos`. */
export async function publicarFoto({ origem, legenda, filtro, local, localId }) {
  const sb = await obterCliente();
  const { data: auth } = await sb.auth.getUser();
  if (!auth?.user) throw new Error('Entre na sua conta pra postar.');

  const blob = await paraBlob(origem);
  const ext = blob.type === 'image/png' ? 'png' : blob.type === 'image/webp' ? 'webp' : 'jpg';
  const caminho = `${auth.user.id}/${Date.now()}.${ext}`;

  const up = await sb.storage.from(BUCKET).upload(caminho, blob, { contentType: blob.type || 'image/jpeg', upsert: false });
  if (up.error) throw erro(up.error);

  const { data, error } = await sb
    .from('fotos')
    .insert({ user_id: auth.user.id, caminho, legenda: legenda || null, filtro: filtro || null, local: local || null, local_id: localId ?? null })
    .select('id')
    .single();
  if (error) {
    await sb.storage.from(BUCKET).remove([caminho]).catch(() => {});
    throw erro(error);
  }
  return { id: data.id, url: urlPublica(sb, caminho) };
}

function urlPublica(sb, caminho) {
  return sb.storage.from(BUCKET).getPublicUrl(caminho).data.publicUrl;
}

/** Feed: fotos mais recentes com quem postou (view feed_fotos). */
export async function listarFeed(limite = 30) {
  const sb = await obterCliente();
  const { data, error } = await sb.from('feed_fotos').select('*').limit(limite);
  if (error) throw erro(error);
  return (data || []).map((f) => ({
    id: f.id,
    userId: f.user_id,
    url: urlPublica(sb, f.caminho),
    legenda: f.legenda || '',
    filtro: f.filtro || 'none',
    local: f.local || 'São Paulo',
    criadoEm: f.criado_em,
    nome: f.nome,
    usuario: f.usuario,
    xp: f.xp || 0,
  }));
}
