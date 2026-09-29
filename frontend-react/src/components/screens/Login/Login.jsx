import { useState } from 'react';
import styles from './Login.module.css';
import { entrar, supabaseConfigurado } from '../../../api-supabase.js';

export default function Login({ go, dispatch }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const enter = async (e) => {
    e.preventDefault();
    if (!supabaseConfigurado) {
      // SUBSTITUIR EM PRODUÇÃO: sem Supabase configurado (.env.local) o login é
      // decorativo e navega direto pro feed, como no protótipo original.
      go('feed');
      return;
    }
    setErro('');
    setCarregando(true);
    try {
      const usuario = await entrar(email, senha);
      dispatch({ type: 'MERGE', payload: { usuario } });
      go('feed');
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  };

  const google = () => {
    if (!supabaseConfigurado) { go('feed'); return; }
    setErro('Login com Google ainda não foi habilitado no Supabase (Authentication > Providers).');
  };

  return (
    <div className={styles.screen}>
      <form className={styles.form} onSubmit={enter}>
        <span className={styles.label}>Email</span>
        <input
          type="email"
          placeholder="seuemail@gmail.com"
          className={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required={supabaseConfigurado}
          maxLength={120}
        />
        <span className={styles.label}>Senha</span>
        <input
          type="password"
          placeholder="••••••••••••"
          className={styles.input}
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          autoComplete="current-password"
          required={supabaseConfigurado}
          minLength={supabaseConfigurado ? 6 : undefined}
          maxLength={72}
        />
        <div className={styles.forgotRow}>
          <button type="button" className={styles.forgot}>Esqueceu a senha?</button>
        </div>
        {erro && <div className={styles.erro} role="alert">{erro}</div>}
        {!supabaseConfigurado && (
          <div className={styles.aviso}>Modo protótipo: Supabase não configurado, qualquer login entra.</div>
        )}
        <button type="submit" className={styles.primaryBtn} disabled={carregando}>
          {carregando ? 'Entrando…' : 'Entrar'}
        </button>
        <div className={styles.divider}>
          <div className="line" style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.4)' }} />
          <span>Ou Entre com</span>
          <div className="line" style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.4)' }} />
        </div>
        <button type="button" className={styles.googleBtn} onClick={google}>
          <svg width="16" height="16" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z" />
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
            <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C41.4 34.9 44 29.9 44 24c0-1.3-.1-2.6-.4-3.9z" />
          </svg>
          <span>Google</span>
        </button>
        <div className={styles.footer}>
          <span>Não tem uma conta?</span>
          <button type="button" onClick={() => go('cadastro')}>Criar nova</button>
        </div>
      </form>
    </div>
  );
}
