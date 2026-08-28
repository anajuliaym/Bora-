import ScreenShell from '../../layout/ScreenShell.jsx';
import styles from './Desafios.module.css';
import { challenges } from '../../../mock-data/mock-data.js';

const TABS = [
  ['diario', 'Diário'],
  ['semanal', 'Semanal'],
  ['mensal', 'Mensal'],
];

export default function Desafios({ state, dispatch, go }) {
  const tab = state.challengeTab || 'diario';
  const list = challenges[tab].map((c) => ({ ...c, open: !c.done }));
  const setTab = (t) => dispatch({ type: 'MERGE', payload: { challengeTab: t } });

  return (
    <ScreenShell overflow="auto">
      <div className={styles.body}>
        <div className={styles.headRow}>
          <button className={styles.backBtn} onClick={() => go(state.backFrom || 'feed')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span className={styles.title}>Desafios</span>
        </div>

        <div className={styles.progressCard}>
          <div className={styles.progressTop}>
            <div className={styles.progressWho}>
              <div className={styles.progressAvatar}><span>12</span></div>
              <div className={styles.progressWhoText}>
                <span>@thiago_rolê</span>
                <span>2.450 / 3.000 XP para o LVL 13</span>
              </div>
            </div>
            <button className={styles.rankLink} onClick={() => go('ranking', { backFrom: 'desafios' })}>
              <span>Ranking →</span>
            </button>
          </div>
          <div className={styles.bar}><div className={styles.barFill} /></div>
        </div>

        <button className={styles.rankCard} onClick={() => go('ranking', { backFrom: 'desafios' })}>
          <div>
            <span>Ranking entre amigos</span>
            <span>Você está em 3º lugar esta semana</span>
          </div>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" />
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
          </svg>
        </button>

        <div className={styles.tabs}>
          {TABS.map(([key, label]) => (
            <button
              key={key}
              className={styles.tab}
              style={{
                background: tab === key ? 'var(--primary)' : '#fff',
                color: tab === key ? '#fff' : 'var(--text-secondary)',
              }}
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {list.map((c, i) => (
          <div className={styles.chCard} key={i}>
            <div className={styles.chTop}>
              <div className={styles.chText}>
                <span className={styles.chTitle}>{c.t}</span>
                <span className={styles.chDesc}>{c.d}</span>
              </div>
              <span className={styles.chXp}>+{c.xp} XP</span>
            </div>
            {c.done && (
              <div className={styles.chDone}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Concluído — recompensa recebida</span>
              </div>
            )}
            {c.open && (
              <button className={styles.chBtn} onClick={() => go('camera')}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                Fazer agora
              </button>
            )}
          </div>
        ))}
      </div>
    </ScreenShell>
  );
}
