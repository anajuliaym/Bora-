import { useMemo } from 'react';
import styles from './BottomNav.module.css';

const ORDER = ['feed', 'mapa', 'descobrir', 'agenda', 'perfil'];
const CENTERS = [72, 143, 214, 285, 356];
const LABELS = ['Home', 'Mapa', 'Rolês', 'Agenda', 'Perfil'];
const pct = (v) => (v / 428) * 100 + '%';

function navPathFor(c) {
  const notch = `L ${(c - 53).toFixed(1)} 0 C ${(c - 42.97).toFixed(1)} 0 ${(c - 35.16).toFixed(1)} 8.514 ${(c - 29.96).toFixed(1)} 17.096 C ${(c - 23.83).toFixed(1)} 27.228 ${(c - 12.71).toFixed(1)} 34 ${c} 34 C ${(c + 10.1).toFixed(1)} 34 ${(c + 19.2).toFixed(1)} 29.722 ${(c + 25.59).toFixed(1)} 22.879 C ${(c + 35.19).toFixed(1)} 12.59 ${(c + 46.19).toFixed(1)} 0 ${(c + 60.27).toFixed(1)} 0`;
  return `M 0 75 L 0 14 C 0 6.27 6.27 0 14 0 ${notch} L 414 0 C 421.73 0 428 6.27 428 14 L 428 75 Z`;
}

// Ícones outline (estado não-selecionado) — mesmos paths do original.
const ICONS_UNSELECTED = [
  <svg key="feed" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>,
  <svg key="mapa" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>,
  <svg key="descobrir" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>,
  <svg key="agenda" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="3" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>,
  <svg key="perfil" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>,
];

const ICONS_SELECTED = [
  <svg key="feed" width="24" height="24" viewBox="0 0 24 24" fill="#fff" className={styles.navPop}>
    <path d="M12 2.5 21.5 10v11a1 1 0 0 1-1 1h-5.5v-6.5h-6V22H3.5a1 1 0 0 1-1-1V10L12 2.5z" />
  </svg>,
  <svg key="mapa" width="24" height="24" viewBox="0 0 24 24" fill="#fff" className={styles.navPop}>
    <path d="M12 1.5a8.5 8.5 0 0 1 8.5 8.5c0 6.5-8.5 12.5-8.5 12.5S3.5 16.5 3.5 10A8.5 8.5 0 0 1 12 1.5zm0 5.5a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
  </svg>,
  <svg key="descobrir" width="24" height="24" viewBox="0 0 24 24" fill="#fff" className={styles.navPop}>
    <path d="M12 1.5A10.5 10.5 0 1 0 22.5 12 10.5 10.5 0 0 0 12 1.5zm4.5 6-2.6 6.4L7.5 16.5l2.6-6.4 6.4-2.6z" />
  </svg>,
  <svg key="agenda" width="24" height="24" viewBox="0 0 24 24" fill="#fff" className={styles.navPop}>
    <path d="M19 4h-1V2.5a1 1 0 0 0-2 0V4H8V2.5a1 1 0 0 0-2 0V4H5a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm1 15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V10h16v9z" />
    <rect x="7" y="13" width="4" height="4" rx="1" />
  </svg>,
  <svg key="perfil" width="24" height="24" viewBox="0 0 24 24" fill="#fff" className={styles.navPop}>
    <circle cx="12" cy="7.5" r="4.5" />
    <path d="M12 14c-4.7 0-8 2.6-8 6v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1c0-3.4-3.3-6-8-6z" />
  </svg>,
];

export default function BottomNav({ state, go }) {
  const visible = ['feed', 'mapa', 'agenda', 'perfil', 'descobrir'].includes(state.screen);

  const { idx, path, positions } = useMemo(() => {
    const navScreen = state.screen === 'perfil' && state.viewingProfile
      ? state.prevNavScreen || 'feed'
      : state.screen;
    const i = Math.max(0, ORDER.indexOf(navScreen));
    return {
      idx: i,
      path: navPathFor(CENTERS[i]),
      positions: CENTERS.map(pct),
    };
  }, [state.screen, state.viewingProfile, state.prevNavScreen]);

  if (!visible) return null;

  const handlers = [
    () => go('feed'),
    () => go('mapa'),
    () => go('descobrir'),
    () => go('agenda'),
    () => go('perfil'),
  ];

  return (
    <div className={styles.nav}>
      <svg viewBox="0 0 428 75" preserveAspectRatio="none" className={styles.bg}>
        <path d={path} fill="var(--primary)" />
      </svg>
      <div className={styles.indicator} style={{ left: positions[idx] }}>
        {ICONS_SELECTED[idx]}
      </div>
      {ORDER.map((key, i) => (
        <div key={key} className={styles.item} style={{ left: positions[i] }} onClick={handlers[i]}>
          {i !== idx && ICONS_UNSELECTED[i]}
          {state.showNavLabels !== false && <span className={styles.label}>{LABELS[i]}</span>}
        </div>
      ))}
    </div>
  );
}
