import { useState } from 'react';
import styles from './Cadastro.module.css';
import { cadastrar, supabaseConfigurado } from '../../../api-supabase.js';

export default function Cadastro({ go, dispatch }) {
  const [form, setForm] = useState({ nome: '', email: '', usuario: '', senha: '', termos: false });
  const [erro, setErro] = useState('');
  const [ok, setOk] = useState('');
  const [carregando, setCarregando] = useState(false);
  const campo = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!supabaseConfigurado) {
      // SUBSTITUIR EM PRODUÇÃO: sem Supabase configurado o cadastro é
      // decorativo e só navega pro feed, como no protótipo original.
      go('feed');
      return;
    }
    setErro('');
    setCarregando(true);
    try {
      const r = await cadastrar(form);
      if (r.precisaConfirmarEmail) {
        setOk('Conta criada! Confirme o email que enviamos e depois entre.');
        setTimeout(() => go('login'), 2500);
        return;
      }
      dispatch({ type: 'MERGE', payload: { usuario: r.usuario } });
      go('feed');
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className={styles.screen}>
      <div className={styles.blobGreen} />
      <div className={styles.blobYellow} />
      <div className={styles.blobBlue} />
      <div className={styles.blur} />
      <form className={styles.content} onSubmit={submit}>
        <img src="/assets/logo.svg" alt="Bora?" className={styles.logo} />

        <button type="button" className={styles.ssoBtn} onClick={() => (supabaseConfigurado ? setErro('Login com Google ainda não foi habilitado no Supabase.') : go('feed'))}>
          <svg width="16" height="16" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z" />
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
            <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C41.4 34.9 44 29.9 44 24c0-1.3-.1-2.6-.4-3.9z" />
          </svg>
          <span>Entrar com Google</span>
        </button>
        <button type="button" className={styles.ssoBtn} onClick={() => go('login')}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="rgb(38,38,38)" strokeWidth="2">
            <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" />
          </svg>
          <span>Entrar com email</span>
        </button>

        <div className={styles.divider}>
          <div className="line" style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.15)' }} />
          <span>OU</span>
          <div className="line" style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.15)' }} />
        </div>

        <div className={styles.fields}>
          <input placeholder="Nome" value={form.nome} onChange={campo('nome')} autoComplete="name" required={supabaseConfigurado} maxLength={60} />
          <input type="email" placeholder="Email" value={form.email} onChange={campo('email')} autoComplete="email" required={supabaseConfigurado} maxLength={120} />
          <input
            placeholder="@usuario"
            value={form.usuario}
            onChange={campo('usuario')}
            autoComplete="username"
            required={supabaseConfigurado}
            pattern="@?[a-zA-Z0-9_.]{3,30}"
            title="3 a 30 caracteres: letras, números, _ ou ."
            maxLength={31}
          />
          <input
            type="password"
            placeholder="Senha (mín. 6)"
            value={form.senha}
            onChange={campo('senha')}
            autoComplete="new-password"
            required={supabaseConfigurado}
            minLength={supabaseConfigurado ? 6 : undefined}
            maxLength={72}
          />
        </div>

        <label className={styles.terms}>
          <input type="checkbox" checked={form.termos} onChange={campo('termos')} required={supabaseConfigurado} />
          <span>Li e aceito os Termos e a Política de Privacidade.</span>
        </label>

        {erro && <div className={styles.erro} role="alert">{erro}</div>}
        {ok && <div className={styles.ok} role="status">{ok}</div>}
        {!supabaseConfigurado && (
          <div className={styles.aviso}>Modo protótipo: Supabase não configurado, o cadastro não é salvo.</div>
        )}

        <button type="submit" className={styles.submit} disabled={carregando}>
          {carregando ? 'Criando conta…' : 'Continuar'}
        </button>

        <div className={styles.footer}>
          <button type="button" onClick={() => go('login')}>Tem uma conta? Entrar</button>
        </div>
      </form>
    </div>
  );
}
