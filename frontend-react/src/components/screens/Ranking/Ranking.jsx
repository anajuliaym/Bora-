import { Suspense, lazy } from 'react';
import ScreenShell from '../../layout/ScreenShell.jsx';
import styles from './Ranking.module.css';
import { rankingData, grads } from '../../../mock-data/mock-data.js';

const Bora3D = lazy(() => import('../../shared/Bora3D.jsx'));

export default function Ranking({ state, go }) {
  const ranking = rankingData.map((r) => ({
    ...r,
    bg: grads[r.bg],
    shadow: r.me
      ? 'inset 0 0 0 2px rgb(255,0,127),0px 10px 28px -8px rgba(0,0,0,0.1)'
      : 'inset 0 0 0 1px rgb(236,240,245)',
  }));

  return (
    <ScreenShell overflow="auto">
      <div className={styles.body}>
        <div className={styles.headRow}>
          <button className={styles.backBtn} onClick={() => go(state.backFrom || 'feed')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span className={styles.title}>Ranking entre amigos</span>
        </div>

        <div className={styles.podium}>
          <div className={styles.podiumCol}>
            <div className={styles.podiumAvatar} style={{ width: 60, height: 60, background: 'rgb(147,203,233)' }}><span style={{ fontSize: 20 }}>L</span></div>
            <span className={styles.podiumName}>@lets.codar</span>
            <div className={styles.podiumBlock} style={{ height: 52, background: 'var(--grad-blue-2)' }}><span>2</span></div>
          </div>
          <div className={styles.podiumCol}>
            <Suspense fallback={<div className={styles.trophy3d} />}>
              <Bora3D model="trophy" style={{ width: 220, height: 114, marginBottom: -34, marginTop: -14 }} />
            </Suspense>
            <div className={styles.podiumAvatar} style={{ width: 70, height: 70, background: 'rgb(244,198,92)' }}><span style={{ fontSize: 24 }}>D</span></div>
            <span className={styles.podiumName}>@dudinha</span>
            <div className={styles.podiumBlock} style={{ height: 72, background: 'var(--accent)' }}><span>1</span></div>
          </div>
          <div className={styles.podiumCol}>
            <div className={styles.podiumAvatar} style={{ width: 60, height: 60, background: 'var(--secondary-mid)' }}><span style={{ fontSize: 20 }}>T</span></div>
            <span className={styles.podiumName}>você</span>
            <div className={styles.podiumBlock} style={{ height: 40, background: 'var(--primary)' }}><span>3</span></div>
          </div>
        </div>

        {ranking.map((r) => (
          <div className={styles.row} key={r.pos} style={{ boxShadow: r.shadow }}>
            <span className={styles.pos}>{r.pos}</span>
            <div className={styles.avatar} style={{ background: r.bg }}><span>{r.i}</span></div>
            <div className={styles.who}>
              <span>{r.n}</span>
              <span>LVL {r.lvl}</span>
            </div>
            <span className={styles.xp}>{r.xp}</span>
          </div>
        ))}
      </div>
    </ScreenShell>
  );
}
