import { useMemo } from 'react';
import ScreenShell from '../../layout/ScreenShell.jsx';
import styles from './Agenda.module.css';
import { eventsData, grads } from '../../../mock-data/mock-data.js';

export default function Agenda({ state, go }) {
  const agendaEvents = useMemo(() => {
    return eventsData
      .map((e, i) => ({ ...e, index: i, bg: grads[e.bg] }))
      .filter((e) => state.goingMap[e.index])
      .map((e) => {
        // localização atual simulada: Bar do Zé (índice 0) — SUBSTITUIR EM
        // PRODUÇÃO: um app real usaria geolocalização de verdade aqui.
        const atLocation = e.index === 0;
        return {
          ...e,
          atLocation,
          awayFrom: !atLocation,
          distLabel: atLocation ? 'você está aqui' : `${e.dist} de você`,
          others: Math.max(e.going - 2, 0),
        };
      });
  }, [state.goingMap]);

  const count = agendaEvents.length === 0
    ? 'Nenhum rolê confirmado'
    : agendaEvents.length === 1 ? '1 rolê confirmado' : `${agendaEvents.length} rolês confirmados`;

  return (
    <ScreenShell overflow="auto">
      <div className={styles.body}>
        <div className={styles.titleRow}>
          <span className={styles.title}>Meus rolês</span>
          <span className={styles.count}>{count}</span>
        </div>

        <button className={styles.challengesCard} onClick={() => go('desafios', { backFrom: 'agenda' })}>
          <div className={styles.challengesText}>
            <span>Desafios</span>
            <span>1 diário aberto • +120 XP te esperando</span>
          </div>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
            <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.4" fill="#fff" />
          </svg>
        </button>

        {agendaEvents.length === 0 && (
          <div className={styles.emptyCard}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="rgb(93,103,120)" strokeWidth="1.8">
              <rect x="3" y="4" width="18" height="18" rx="3" />
              <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>Você ainda não confirmou nenhum rolê</span>
            <button className={styles.emptyBtn} onClick={() => go('descobrir')}>Explorar rolês</button>
          </div>
        )}

        {agendaEvents.map((ae) => {
          const open = () => go('evento', { eventIdx: ae.index, backFrom: 'agenda' });
          return (
            <div className={styles.card} key={ae.index}>
              <button className={styles.cover} style={{ background: ae.bg }} onClick={open}>
                <div className={styles.whenTag}><span>{ae.when}</span></div>
                <div className={styles.catTag}><span>{ae.cat}</span></div>
              </button>
              <div className={styles.info}>
                <div className={styles.infoTitle}>
                  <button onClick={open}>{ae.t}</button>
                  <span className={styles.infoSub}>{ae.g} • {ae.membros} membros</span>
                </div>
                <div className={styles.locRow}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgb(51,132,170)" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>{ae.loc} • {ae.distLabel}</span>
                </div>
                <div className={styles.avatarsRow}>
                  <div className={styles.avatars}>
                    <div className={styles.mini} style={{ background: 'rgb(168,214,150)' }}><span>M</span></div>
                    <div className={styles.mini} style={{ background: 'rgb(244,198,92)' }}><span>D</span></div>
                    <div className={styles.mini} style={{ background: 'rgb(226,120,170)' }}><span>P</span></div>
                  </div>
                  <span className={styles.othersLabel}>Marina, Dudinha e mais {ae.others} vão</span>
                </div>

                {ae.atLocation && (
                  <div className={styles.statusOk}>
                    <span>Você está no local — câmera liberada!</span>
                    <button className={styles.statusOkBtn} onClick={() => go('camera')}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                      </svg>
                      Tirar foto agora
                    </button>
                  </div>
                )}
                {ae.awayFrom && (
                  <div className={styles.statusAway}>
                    <span>Você está a {ae.dist} — chegue no local pra liberar a câmera</span>
                    <button className={styles.statusAwayBtn} disabled>Câmera bloqueada</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </ScreenShell>
  );
}
