import { useMemo } from 'react';
import ScreenShell from '../../layout/ScreenShell.jsx';
import styles from './Descobrir.module.css';
import { eventsData, gruposData, grads } from '../../../mock-data/mock-data.js';

const ACTIVE = 'rgb(181,25,93)';
const INACT_FG = 'rgb(58,74,94)';
const RING = 'inset 0 0 0 1px rgb(226,232,240)';
const WHEN_OPTS = [{ n: 'Qualquer data', v: 'todos' }, { n: 'Hoje', v: 'hoje' }, { n: 'Esta semana', v: 'semana' }];
const DIST_OPTS = [{ n: 'Até 1 km', v: 1 }, { n: 'Até 2 km', v: 2 }, { n: 'Até 5 km', v: 5 }];
const CATS = ['Bar', 'Música', 'Esporte', 'Leitura', 'Yoga', 'Games'];

export default function Descobrir({ state, dispatch, go }) {
  const when = state.roleWhen || 'todos';
  const dist = state.roleDist || null;
  const free = !!state.roleFree;
  const cats = state.roleCats || {};
  const merge = (payload) => dispatch({ type: 'MERGE', payload });

  const catNames = Object.keys(cats).filter((k) => cats[k]);

  const filteredEvents = useMemo(() => eventsData
    .map((e, i) => ({ ...e, index: i, bg: grads[e.bg] }))
    .filter((e) =>
      (when === 'todos' || e.dateTag === when) &&
      (!dist || e.distKm <= dist) &&
      (!free || e.free) &&
      (catNames.length === 0 || catNames.includes(e.cat))
    ), [when, dist, free, catNames]);

  const hasActive = when !== 'todos' || dist || free || catNames.length > 0;
  const clearFilters = () => merge({ roleWhen: 'todos', roleDist: null, roleFree: false, roleCats: {} });

  const grupos = gruposData.map((g, i) => {
    const joined = !!state.joined[i];
    return {
      ...g, index: i, bg: grads[g.bg],
      btnLabel: joined ? 'Membro ✓' : 'Participar',
      btnBg: joined ? 'var(--bg-app)' : 'var(--accent)',
      btnFg: joined ? 'var(--primary)' : '#fff',
    };
  });

  return (
    <ScreenShell overflow="auto">
      <div className={styles.body}>
        <span className={styles.title}>Rolês</span>

        <div className={styles.search}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgb(93,103,120)" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input placeholder="Rolês, grupos, temas..." />
        </div>

        <div className={styles.section}>
          <span className={styles.sectionLabel}>Quando</span>
          <div role="radiogroup" aria-label="Quando" className={styles.segmented}>
            {WHEN_OPTS.map((w) => (
              <button
                key={w.v}
                role="radio"
                aria-checked={when === w.v}
                className={styles.segBtn}
                style={{ background: when === w.v ? ACTIVE : 'transparent', color: when === w.v ? '#fff' : INACT_FG }}
                onClick={() => merge({ roleWhen: w.v })}
              >
                {w.n}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <span className={styles.sectionLabel}>Distância e preço</span>
          <div className={styles.chipsRow}>
            {DIST_OPTS.map((d) => (
              <button
                key={d.v}
                aria-pressed={dist === d.v}
                className={styles.chip}
                style={{
                  background: dist === d.v ? ACTIVE : '#fff',
                  color: dist === d.v ? '#fff' : INACT_FG,
                  boxShadow: dist === d.v ? 'none' : RING,
                }}
                onClick={() => merge({ roleDist: dist === d.v ? null : d.v })}
              >
                {d.n}
              </button>
            ))}
            <button
              aria-pressed={free}
              className={`${styles.chip} ${styles.freeChip}`}
              style={{ background: free ? ACTIVE : '#fff', color: free ? '#fff' : INACT_FG, boxShadow: free ? 'none' : RING }}
              onClick={() => merge({ roleFree: !free })}
            >
              Grátis
              <span aria-hidden="true" className={styles.freeTrack} style={{ background: free ? 'rgba(255,255,255,0.4)' : 'rgb(203,213,225)' }}>
                <span className={styles.freeKnob} style={{ left: free ? '16px' : '2px' }} />
              </span>
            </button>
          </div>
        </div>

        <div className={styles.section}>
          <span className={styles.sectionLabel}>Categorias</span>
          <div className={styles.chipsRow}>
            {CATS.map((label) => {
              const on = !!cats[label];
              return (
                <button
                  key={label}
                  aria-pressed={on}
                  className={styles.chip}
                  style={{ background: on ? ACTIVE : '#fff', color: on ? '#fff' : INACT_FG, boxShadow: on ? 'none' : RING }}
                  onClick={() => merge({ roleCats: { ...cats, [label]: !cats[label] } })}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className={styles.resultRow}>
          <span aria-live="polite" className={styles.resultCount}>
            {filteredEvents.length === 1 ? '1 rolê encontrado' : `${filteredEvents.length} rolês encontrados`}
          </span>
          {hasActive && <button className={styles.clearBtn} onClick={clearFilters}>Limpar filtros</button>}
        </div>

        {filteredEvents.length === 0 && (
          <div className={styles.emptyCard}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgb(93,103,120)" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span>Nenhum rolê com esses filtros</span>
            <span>Tente ampliar a distância ou mudar a categoria.</span>
            <button className={styles.emptyBtn} onClick={clearFilters}>Limpar filtros</button>
          </div>
        )}

        {filteredEvents.map((ev) => (
          <button className={styles.evCard} key={ev.index} onClick={() => go('evento', { eventIdx: ev.index, backFrom: 'descobrir' })}>
            <div className={styles.evCover} style={{ background: ev.bg }}>
              <div className={styles.evCat}><span>{ev.cat}</span></div>
            </div>
            <div className={styles.evInfo}>
              <span>{ev.t}</span>
              <span>{ev.g} • {ev.when}</span>
              <span>{ev.loc} • {ev.going} vão</span>
            </div>
          </button>
        ))}

        <span className={styles.gruposTitle}>Grupos para você</span>
        {grupos.map((g) => (
          <div className={styles.grupoRow} key={g.index}>
            <div className={styles.grupoIcon} style={{ background: g.bg }}><span>{g.emoji}</span></div>
            <div className={styles.grupoInfo}>
              <span>{g.n}</span>
              <span>{g.m} membros</span>
            </div>
            <button
              className={styles.grupoBtn}
              style={{ background: g.btnBg, color: g.btnFg }}
              onClick={() => merge({ joined: { ...state.joined, [g.index]: !state.joined[g.index] } })}
            >
              {g.btnLabel}
            </button>
          </div>
        ))}
      </div>
    </ScreenShell>
  );
}
