import ScreenShell from '../../layout/ScreenShell.jsx';
import styles from './Chat.module.css';
import { chatsData, mensagensData, grads } from '../../../mock-data/mock-data.js';

export default function Chat({ state, dispatch, go }) {
  const chats = chatsData.map((c) => ({ ...c, bg: grads[c.bg] }));
  const mensagens = mensagensData.map((m) => ({
    txt: m.txt,
    align: m.me ? 'flex-end' : 'flex-start',
    bg: m.me ? 'var(--accent)' : '#fff',
    fg: m.me ? '#fff' : 'var(--text-primary)',
  }));

  const openThread = (name) => dispatch({ type: 'MERGE', payload: { chatThread: name } });
  const closeThread = () => dispatch({ type: 'MERGE', payload: { chatThread: null } });

  if (state.chatThread) {
    return (
      <ScreenShell overflow="hidden">
        <div className={styles.thread}>
          <div className={styles.threadHead}>
            <svg onClick={closeThread} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <div className={styles.threadAvatar}><span>M</span></div>
            <div className={styles.threadWho}>
              <span>@marina.sp</span>
              <span>online agora</span>
            </div>
          </div>
          <div className={styles.messages}>
            {mensagens.map((m, i) => (
              <div key={i} className={styles.bubble} style={{ alignSelf: m.align, background: m.bg }}>
                <span style={{ color: m.fg }}>{m.txt}</span>
              </div>
            ))}
          </div>
          <div className={styles.composer}>
            {/* SUBSTITUIR EM PRODUÇÃO: envio de mensagem decorativo — sem backend de chat real */}
            <input placeholder="Mensagem..." />
            <button className={styles.sendBtn} aria-label="Enviar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" /><path d="M22 2 15 22l-4-9-9-4 20-7z" />
              </svg>
            </button>
          </div>
        </div>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell overflow="auto">
      <div className={styles.list}>
        <div className={styles.headRow}>
          <button className={styles.backBtn} onClick={() => go('feed')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span className={styles.title}>Mensagens</span>
        </div>

        {chats.map((c, i) => (
          <button className={styles.row} key={i} onClick={() => openThread(c.n)}>
            <div className={styles.avatar} style={{ background: c.bg }}><span>{c.i}</span></div>
            <div className={styles.info}>
              <span>{c.n}</span>
              <span>{c.msg}</span>
            </div>
            <div className={styles.meta}>
              <span>{c.t}</span>
              {!!c.unread && <div className={styles.unread}><span>{c.unread}</span></div>}
            </div>
          </button>
        ))}
      </div>
    </ScreenShell>
  );
}
