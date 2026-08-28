import { Suspense, lazy } from 'react';
import styles from './XpShow.module.css';
import { confetti } from '../../mock-data/mock-data.js';

const Bora3D = lazy(() => import('./Bora3D.jsx'));

export default function XpShow({ xpVal, onClose }) {
  return (
    <div className={styles.overlay}>
      {confetti.map((cf, i) => (
        <div
          key={i}
          className={styles.confetti}
          style={{
            left: cf.x, width: cf.w, height: cf.h, background: cf.c,
            animation: `confettiFall ${cf.dur} linear ${cf.d} infinite`,
          }}
        />
      ))}
      <div className={styles.card}>
        <Suspense fallback={<div className={styles.medal3d} />}>
          <Bora3D model="medal" sway style={{ width: 130, height: 130 }} />
        </Suspense>
        <span className={styles.title}>Desafio diário concluído!</span>
        <span className={styles.xpVal}>+{xpVal} XP</span>
        <span className={styles.sub}>Check-in publicado no feed</span>
        <button className={styles.btn} onClick={onClose}>Continuar</button>
      </div>
    </div>
  );
}
