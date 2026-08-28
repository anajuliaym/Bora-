import ScreenShell from '../../layout/ScreenShell.jsx';
import styles from './Evento.module.css';
import { eventsData, grads } from '../../../mock-data/mock-data.js';

export default function Evento({ state, dispatch, go }) {
  const idx = state.eventIdx ?? 0;
  const evento = { ...eventsData[idx], bg: grads[eventsData[idx].bg] };
  const going = !!state.goingMap[idx];

  const toggleGoing = () => dispatch({
    type: 'MERGE',
    payload: { goingMap: { ...state.goingMap, [idx]: !going } },
  });
  const toggleSaved = () => dispatch({ type: 'MERGE', payload: { saved: !state.saved } });

  return (
    <ScreenShell overflow="auto">
      <div className={styles.hero} style={{ background: evento.bg }}>
        <button className={styles.backBtn} onClick={() => go(state.backFrom || 'feed')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className={styles.heroTag}><span>Vale desafio diário • +120 XP</span></div>
      </div>

      <div className={styles.body}>
        <div className={styles.titleBlock}>
          <span className={styles.title}>{evento.t}</span>
          <span className={styles.sub}>{evento.g} • {evento.membros} membros</span>
        </div>

        <div className={styles.infoList}>
          <div className={styles.infoRow}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>{evento.when}</span>
          </div>
          <div className={styles.infoRow}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
            </svg>
            <span>{evento.loc} • {evento.dist}</span>
          </div>
          <div className={styles.infoRow}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>{evento.going} pessoas confirmadas</span>
          </div>
        </div>

        <div className={styles.descCard}><span>{evento.desc}</span></div>

        <button className={styles.goBtn} style={{ background: going ? 'var(--primary)' : 'var(--accent)' }} onClick={toggleGoing}>
          {going ? 'Você vai ✓' : 'Bora!'}
        </button>
        <button className={styles.saveBtn} onClick={toggleSaved}>
          {state.saved ? 'Salvo ✓' : 'Salvar para depois'}
        </button>
      </div>
    </ScreenShell>
  );
}
