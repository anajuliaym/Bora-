import ScreenShell from '../../layout/ScreenShell.jsx';
import styles from './Mapa.module.css';
import { eventsData, grads } from '../../../mock-data/mock-data.js';

const TILES = [
  'https://a.basemaps.cartocdn.com/light_all/15/12131/18588.png',
  'https://b.basemaps.cartocdn.com/light_all/15/12132/18588.png',
  'https://c.basemaps.cartocdn.com/light_all/15/12133/18588.png',
  'https://a.basemaps.cartocdn.com/light_all/15/12131/18589.png',
  'https://b.basemaps.cartocdn.com/light_all/15/12132/18589.png',
  'https://c.basemaps.cartocdn.com/light_all/15/12133/18589.png',
  'https://a.basemaps.cartocdn.com/light_all/15/12131/18590.png',
  'https://b.basemaps.cartocdn.com/light_all/15/12132/18590.png',
  'https://c.basemaps.cartocdn.com/light_all/15/12133/18590.png',
  'https://a.basemaps.cartocdn.com/light_all/15/12131/18591.png',
  'https://b.basemaps.cartocdn.com/light_all/15/12132/18591.png',
  'https://c.basemaps.cartocdn.com/light_all/15/12133/18591.png',
  'https://a.basemaps.cartocdn.com/light_all/15/12131/18592.png',
  'https://b.basemaps.cartocdn.com/light_all/15/12132/18592.png',
  'https://c.basemaps.cartocdn.com/light_all/15/12133/18592.png',
];

const PIN_DEFS = [
  { x: '38%', y: '42%', color: 'rgb(255,0,127)', ev: 0 },
  { x: '68%', y: '30%', color: 'rgb(51,132,170)', ev: 1 },
  { x: '55%', y: '60%', color: 'rgb(112,97,163)', ev: 2 },
];

export default function Mapa({ state, dispatch, go }) {
  // SUBSTITUIR EM PRODUÇÃO: grade de tiles estáticos do CartoDB — não é um
  // mapa interativo (sem pan/zoom real, sem SDK de mapas).
  const evIdx = state.eventIdx ?? 0;
  const mapEvent = { ...eventsData[evIdx], bg: grads[eventsData[evIdx].bg] };

  return (
    <ScreenShell overflow="hidden" className={styles.screen}>
      <div className={styles.tiles}>
        {TILES.map((src, i) => (
          <img key={i} src={src} alt="" loading="lazy" />
        ))}
      </div>

      {PIN_DEFS.map((pin) => (
        <button
          key={pin.ev}
          className={styles.pin}
          style={{ left: pin.x, top: pin.y }}
          onClick={() => dispatch({ type: 'MERGE', payload: { eventIdx: pin.ev } })}
        >
          <div className={styles.pinDrop} style={{ background: pin.color }}>
            <div className={styles.pinDot} />
          </div>
        </button>
      ))}

      <button className={styles.searchBar} onClick={() => go('descobrir')}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgb(93,103,120)" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span>Buscar rolês perto de você</span>
      </button>

      <div className={styles.eventCard}>
        <div className={styles.eventThumb} style={{ background: mapEvent.bg }} />
        <div className={styles.eventInfo}>
          <span>{mapEvent.t}</span>
          <span>{mapEvent.when}</span>
          <span>{mapEvent.dist} de você</span>
        </div>
        <button className={styles.eventBtn} onClick={() => go('evento', { eventIdx: evIdx, backFrom: 'mapa' })}>Ver</button>
      </div>
    </ScreenShell>
  );
}
