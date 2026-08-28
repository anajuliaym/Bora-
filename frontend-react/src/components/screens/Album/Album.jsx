import { useEffect, useMemo, useState } from 'react';
import styles from './Album.module.css';
import AlbumFace from './AlbumFace.jsx';
import { useAlbumDrag } from './useAlbumDrag.js';
import { stickerList, stickerBox } from '../../../mock-data/mock-data.js';
import { loadAlbumIndex, saveAlbumIndex, loadAlbumFor, saveAlbum, deleteAlbumStorage } from '../../../hooks/useAlbumStorage.js';
import { textColorForBg, rgbToHex } from '../../../utils/albumItems.js';

const FONT_OPTIONS = [
  ['poppins', 'var(--font-heading)'],
  ['inter', 'var(--font-body)'],
  ['caveat', 'var(--font-caveat)'],
];

export default function Album({ state, dispatch, go }) {
  const [woodReady, setWoodReady] = useState(false);
  const [stickersReady, setStickersReady] = useState(false);
  const [, forceTick] = useState(0);

  useEffect(() => {
    const img = new Image();
    img.onload = img.onerror = () => setWoodReady(true);
    img.src = '/assets/wood.jpg';
  }, []);

  useEffect(() => {
    let loaded = 0;
    const total = stickerList.length;
    stickerList.forEach((src) => {
      const img = new Image();
      img.onload = img.onerror = () => {
        loaded++;
        if (loaded === total) setStickersReady(true);
      };
      img.src = src;
    });
  }, []);

  const readOnly = !!state.albumReadOnly;
  const currentAlbumId = state.currentAlbumId || 'default';
  const items = state.albumItems || (readOnly ? (state.roAlbumData || {}) : loadAlbumFor(currentAlbumId));
  const spread = state.albumSpread || 0;
  const sel = state.albumSel;

  const coverBg = items._coverColor || 'rgb(196,163,130)';
  const coverHex = rgbToHex(coverBg);
  const coverTextColor = textColorForBg(coverBg);
  const showCover = !state.albumOpened;
  const bookOpened = !!state.albumOpened;
  const albumHintText = !state.albumOpened
    ? 'Escolha a cor, adicione texto e figurinhas na capa'
    : 'Toque num item da bandeja e arraste na página';
  const albumName = readOnly
    ? (state.roAlbumName || 'Álbum')
    : ((loadAlbumIndex().find((a) => a.id === currentAlbumId) || {}).name || 'Meu álbum');
  const albumHasItems = Object.values(items || {}).some((arr) => Array.isArray(arr) && arr.length);
  const showResetBtn = !readOnly && albumHasItems;
  const albumPageLabel = `Páginas ${spread * 2 + 1}–${spread * 2 + 2} de 6`;

  const albumSheets = useMemo(() => [0, 1, 2].map((k) => {
    const flipped = k < spread;
    return {
      k,
      transform: flipped ? `translateZ(${k + 1}px) rotateY(-179.6deg)` : `translateZ(${3 - k}px) rotateY(0deg)`,
      z: flipped ? 2 + k : 12 - k,
      frontPE: !flipped && k === spread ? 'auto' : 'none',
      backPE: flipped && k === spread - 1 ? 'auto' : 'none',
      frontNum: k * 2 + 1,
      backNum: k * 2 + 2,
      frontItems: items['f' + k] || [],
      backItems: items['b' + k] || [],
    };
  }), [spread, items]);

  function mutate(fn) {
    if (readOnly) return;
    const cloned = JSON.parse(JSON.stringify(items));
    fn(cloned);
    saveAlbum(currentAlbumId, cloned);
    dispatch({ type: 'SET_ALBUM_ITEMS', items: cloned });
  }
  const setSelected = (selection) => dispatch({ type: 'MERGE', payload: { albumSel: selection } });

  function commitMove(faceId, i, payload) {
    if (!payload) {
      mutate((it) => { const arr = it[faceId]; if (arr && arr[i]) arr[i].z = Date.now(); });
      return { newFace: faceId, newIndex: i };
    }
    const { x, y, target } = payload;
    if (target === faceId) {
      mutate((it) => { const arr = it[faceId]; if (arr && arr[i]) { arr[i].x = x; arr[i].y = y; arr[i].z = Date.now(); } });
      return { newFace: faceId, newIndex: i };
    }
    let newIndex = 0;
    mutate((it) => {
      const arr = it[faceId] || [];
      const moved = arr.splice(i, 1)[0];
      if (!moved) return;
      moved.x = x; moved.y = y; moved.z = Date.now();
      it[target] = it[target] || [];
      it[target].push(moved);
      newIndex = it[target].length - 1;
    });
    return { newFace: target, newIndex };
  }
  const commitResize = (faceId, i, w) => mutate((it) => { const arr = it[faceId]; if (arr && arr[i]) arr[i].boxWidth = w; });
  const commitScale = (faceId, i, s) => mutate((it) => { const arr = it[faceId]; if (arr && arr[i]) arr[i].scale = s; });

  const drag = useAlbumDrag({ spread, commitMove, commitResize, commitScale, setSelected });

  function addAlbumItemAt(face, base, x, y) {
    const newIndex = (items[face] || []).length;
    mutate((it) => {
      it[face] = it[face] || [];
      it[face].push({ x, y, rot: Math.round(-10 + Math.random() * 20), scale: 1, z: Date.now(), ...base });
    });
    setSelected({ face, i: newIndex });
  }
  function addAlbumItem(base) {
    const face = state.albumOpened ? 'f' + spread : 'C';
    addAlbumItemAt(face, base, 42 + Math.random() * 16, 34 + Math.random() * 22);
  }

  function trayDrag(e, base) {
    e.preventDefault();
    const src = e.currentTarget;
    const tray = src.parentElement;
    const startX = e.clientX;
    const startY = e.clientY;
    const w = src.getBoundingClientRect().width;
    let ghost = null;
    let moved = false;
    let scrolling = false;
    let lastX = e.clientX;
    const move = (ev) => {
      if (!moved && !scrolling) {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        if (Math.hypot(dx, dy) > 6) {
          if (Math.abs(dy) > Math.abs(dx)) {
            moved = true;
            ghost = src.cloneNode(true);
            ghost.style.cssText += `;position:fixed;left:0;top:0;z-index:9999;pointer-events:none;margin:0;width:${w}px;height:auto;opacity:0.95;transform:translate(-50%,-50%) rotate(-4deg) scale(1.15)`;
            document.body.appendChild(ghost);
          } else {
            scrolling = true;
          }
        }
      }
      if (scrolling) { tray.scrollLeft -= ev.clientX - lastX; lastX = ev.clientX; }
      if (ghost) { ghost.style.left = ev.clientX + 'px'; ghost.style.top = ev.clientY + 'px'; }
    };
    const up = (ev) => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      if (ghost) ghost.remove();
      if (scrolling) return;
      if (!moved) { addAlbumItem(base); return; }
      const el = document.elementFromPoint(ev.clientX, ev.clientY);
      const faceEl = el && el.closest ? el.closest('[data-face]') : null;
      if (faceEl) {
        const r = faceEl.getBoundingClientRect();
        const x = Math.min(96, Math.max(4, ((ev.clientX - r.left) / r.width) * 100));
        const y = Math.min(94, Math.max(6, ((ev.clientY - r.top) / r.height) * 100));
        addAlbumItemAt(faceEl.getAttribute('data-face'), base, Math.round(x * 10) / 10, Math.round(y * 10) / 10);
      }
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  function mutSel(fn) {
    if (!sel) return;
    mutate((it) => { const item = (it[sel.face] || [])[sel.i]; if (item) fn(item); });
  }
  function startRotHold(e, dir) {
    e.preventDefault();
    let speed = 1.4;
    mutSel((it) => { it.rot = Math.round((it.rot + dir * speed) * 10) / 10; });
    const iv = setInterval(() => {
      speed = Math.min(speed + 0.5, 14);
      mutSel((it) => { it.rot = Math.round((it.rot + dir * speed) * 10) / 10; });
    }, 60);
    const stop = () => {
      clearInterval(iv);
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
    };
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
  }
  const selShrink = () => mutSel((it) => { it.scale = Math.max(0.4, Math.round(((it.scale || 1) - 0.12) * 100) / 100); });
  const selGrow = () => mutSel((it) => { it.scale = Math.min(3.2, Math.round(((it.scale || 1) + 0.12) * 100) / 100); });
  const selDelete = () => { if (sel) mutate((it) => { (it[sel.face] || []).splice(sel.i, 1); }); setSelected(null); };
  const selDone = () => setSelected(null);

  const setAlbumName = (e) => {
    const idx = loadAlbumIndex();
    const a = idx.find((x) => x.id === currentAlbumId);
    if (a) { a.name = e.target.value; saveAlbumIndex(idx); forceTick((v) => v + 1); }
  };
  const deleteAlbumBtn = () => {
    if (!window.confirm('Excluir este álbum? Essa ação não pode ser desfeita.')) return;
    let idx = loadAlbumIndex().filter((x) => x.id !== currentAlbumId);
    deleteAlbumStorage(currentAlbumId);
    if (!idx.length) idx = [{ id: 'default', name: 'Meu álbum' }];
    saveAlbumIndex(idx);
    dispatch({
      type: 'MERGE',
      payload: { currentAlbumId: idx[0].id, albumItems: null, albumOpened: false, albumSpread: 0, albumSel: null, screen: 'perfil' },
    });
  };
  const albumReset = () => {
    saveAlbum(currentAlbumId, {});
    dispatch({ type: 'MERGE', payload: { albumItems: {}, albumSel: null, albumSpread: 0 } });
  };
  const setCoverHex = (e) => mutate((it) => { it._coverColor = e.target.value; });

  const albumTab = state.albumTab || 'stickers';
  const setTab = (t) => dispatch({ type: 'MERGE', payload: { albumTab: t } });
  const albumTextDraft = state.albumTextDraft || '';
  const albumTextFont = state.albumTextFont || 'poppins';
  const addAlbumText = () => {
    const txt = albumTextDraft.trim();
    if (!txt) return;
    addAlbumItem({ type: 'text', text: txt, font: albumTextFont });
    dispatch({ type: 'MERGE', payload: { albumTextDraft: '' } });
  };

  const trayPhotos = [
    { bg: 'url(/assets/photo1.jpg) center/cover', loc: 'Bar do Zé' },
    { bg: 'rgb(168,214,150)', loc: 'Ibirapuera' },
    { bg: 'rgb(244,198,92)', loc: 'Sarau da Vila' },
    { bg: 'rgb(120,186,224)', loc: 'Feira do Bixiga' },
  ];
  const skeletons = [42, 50, 38, 56, 44, 48, 40, 52, 46, 42];

  if (!woodReady) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingBar} />
      </div>
    );
  }

  return (
    <div className={styles.screen}>
      <div className={styles.dim} />
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => go('perfil', { albumReadOnly: false, roAlbumData: null })}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(58,38,22)" strokeWidth="2.4">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className={styles.titleCol}>
          {readOnly ? (
            <span className={styles.titleStatic}>{albumName}</span>
          ) : (
            <input className={styles.titleInput} value={albumName} onChange={setAlbumName} maxLength={24} />
          )}
          <span className={styles.hintText}>{albumHintText}</span>
        </div>
        {!readOnly && (
          <button className={styles.deleteBtn} onClick={deleteAlbumBtn}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="rgb(200,60,50)" strokeWidth="2.2">
              <path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" />
            </svg>
          </button>
        )}
        {showResetBtn && (
          <button className={styles.resetBtn} onClick={albumReset}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgb(58,38,22)" strokeWidth="2.4">
              <path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" />
            </svg>
            <span>Reiniciar</span>
          </button>
        )}
      </div>

      <div className={styles.stage}>
        {showCover && (
          <>
            <div className={styles.coverWrap}>
              <div className={styles.cover} style={{ background: coverBg }}>
                <div className={styles.coverSpine} />
                <div className={styles.coverSheen} />
                <AlbumFace
                  faceId="C"
                  items={items.C || []}
                  selection={sel}
                  readOnly={readOnly}
                  textColor={coverTextColor}
                  drag={drag}
                  style={{ position: 'absolute', inset: 0, width: 194 }}
                />
              </div>
            </div>
            <button className={styles.openBtn} onClick={() => dispatch({ type: 'MERGE', payload: { albumOpened: true } })}>
              <span>Abrir álbum</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgb(58,38,22)" strokeWidth="2.4">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          </>
        )}

        {bookOpened && (
          <>
            <div className={styles.book}>
              <div className={styles.bookInner}>
                <div className={styles.bookCover} style={{ background: coverBg }} />
                <div className={styles.bookCoverSheen} />
                <div className={styles.spineHighlight} />
                <div className={styles.pageLeft}>
                  <AlbumFace faceId="L" items={items.L || []} selection={sel} readOnly={readOnly} textColor="rgb(58,38,22)" drag={drag} style={{ position: 'absolute', inset: 0 }} />
                </div>
                <div className={styles.pageEnd}><span>fim do álbum</span></div>
                {albumSheets.map((sh) => (
                  <div key={sh.k} className={styles.sheet} style={{ transform: sh.transform, zIndex: sh.z }}>
                    <div className={styles.sheetFace} style={{ pointerEvents: sh.frontPE }}>
                      <AlbumFace faceId={`f${sh.k}`} items={sh.frontItems} selection={sel} readOnly={readOnly} textColor="rgb(58,38,22)" drag={drag} style={{ position: 'absolute', inset: 0 }} />
                      <span className={styles.pageNumFront}>{sh.frontNum}</span>
                    </div>
                    <div className={`${styles.sheetFace} ${styles.sheetBack}`} style={{ pointerEvents: sh.backPE }}>
                      <AlbumFace faceId={`b${sh.k}`} items={sh.backItems} selection={sel} readOnly={readOnly} textColor="rgb(58,38,22)" drag={drag} style={{ position: 'absolute', inset: 0 }} />
                      <span className={styles.pageNumBack}>{sh.backNum}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.pager}>
              <button
                className={styles.pagerBtn}
                style={{ opacity: 1 }}
                onClick={() => (spread === 0
                  ? dispatch({ type: 'MERGE', payload: { albumOpened: false } })
                  : dispatch({ type: 'MERGE', payload: { albumSpread: spread - 1, albumSel: null } }))}
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="rgb(58,38,22)" strokeWidth="2.4"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
              <span className={styles.pagerLabel}>{albumPageLabel}</span>
              <button
                className={styles.pagerBtn}
                style={{ opacity: spread === 2 ? 0.3 : 1 }}
                onClick={() => dispatch({ type: 'MERGE', payload: { albumSpread: Math.min(2, spread + 1), albumSel: null } })}
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="rgb(58,38,22)" strokeWidth="2.4"><path d="M9 6l6 6-6 6" /></svg>
              </button>
            </div>
          </>
        )}
      </div>

      {sel && !readOnly && (
        <div className={styles.selToolbar}>
          <button className={styles.selBtn} onPointerDown={(e) => startRotHold(e, -1)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgb(58,38,22)" strokeWidth="2"><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" /></svg>
          </button>
          <button className={styles.selBtn} onPointerDown={(e) => startRotHold(e, 1)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgb(58,38,22)" strokeWidth="2" transform="scale(-1,1)"><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" /></svg>
          </button>
          <button className={styles.selBtn} onClick={selShrink}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgb(58,38,22)" strokeWidth="2.4"><path d="M5 12h14" /></svg>
          </button>
          <button className={styles.selBtn} onClick={selGrow}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgb(58,38,22)" strokeWidth="2.4"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
          </button>
          <button className={`${styles.selBtn} ${styles.selBtnDanger}`} onClick={selDelete}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgb(255,120,110)" strokeWidth="2"><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /></svg>
          </button>
          <button className={styles.selDoneBtn} onClick={selDone}><span>OK</span></button>
        </div>
      )}

      <div className={styles.tray}>
        {!readOnly && (
          <>
            {showCover && (
              <div className={styles.colorRow}>
                <span>Cor da capa</span>
                <input type="color" className={styles.colorInput} value={coverHex} onChange={setCoverHex} />
              </div>
            )}
            <div className={styles.tabRow}>
              {bookOpened && (
                <button
                  className={styles.tabBtn}
                  style={{ background: albumTab === 'fotos' ? 'var(--accent)' : 'rgba(58,38,22,0.12)', color: albumTab === 'fotos' ? '#fff' : 'rgb(58,38,22)' }}
                  onClick={() => setTab('fotos')}
                >
                  Fotos
                </button>
              )}
              <button
                className={styles.tabBtn}
                style={{ background: albumTab === 'stickers' ? 'var(--accent)' : 'rgba(58,38,22,0.12)', color: albumTab === 'stickers' ? '#fff' : 'rgb(58,38,22)' }}
                onClick={() => setTab('stickers')}
              >
                Adesivos
              </button>
              <button
                className={styles.tabBtn}
                style={{ background: albumTab === 'texto' ? 'var(--accent)' : 'rgba(58,38,22,0.12)', color: albumTab === 'texto' ? '#fff' : 'rgb(58,38,22)' }}
                onClick={() => setTab('texto')}
              >
                Texto
              </button>
            </div>

            {albumTab === 'fotos' && (
              <div className={styles.trayScroll}>
                {trayPhotos.map((tp, i) => (
                  <button key={i} className={styles.trayPhoto} onPointerDown={(e) => trayDrag(e, { type: 'photo', bg: tp.bg, loc: tp.loc })}>
                    <div style={{ width: '100%', aspectRatio: '1', background: tp.bg }} />
                  </button>
                ))}
              </div>
            )}

            {albumTab === 'stickers' && (
              <div className={styles.trayStickerScroll}>
                {!stickersReady && skeletons.map((w, i) => (
                  <div key={i} className={styles.skeleton} style={{ width: w }} />
                ))}
                {stickersReady && stickerList.map((src) => {
                  const b = stickerBox(src, 56);
                  return (
                    <button
                      key={src}
                      className={styles.traySticker}
                      style={{ width: b.w, height: b.h, backgroundImage: `url('${src}')` }}
                      onPointerDown={(e) => trayDrag(e, { type: 'sticker', src })}
                    />
                  );
                })}
              </div>
            )}

            {albumTab === 'texto' && (
              <div className={styles.textRow}>
                <input
                  className={styles.textInput}
                  value={albumTextDraft}
                  onChange={(e) => dispatch({ type: 'MERGE', payload: { albumTextDraft: e.target.value } })}
                  placeholder="Escreva algo..."
                  maxLength={40}
                />
                <div className={styles.fontRow}>
                  {FONT_OPTIONS.map(([fk, fam]) => (
                    <button
                      key={fk}
                      className={styles.fontBtn}
                      style={{ background: albumTextFont === fk ? 'var(--accent)' : 'rgba(58,38,22,0.1)', color: albumTextFont === fk ? '#fff' : 'rgb(58,38,22)', fontFamily: fam }}
                      onClick={() => dispatch({ type: 'MERGE', payload: { albumTextFont: fk } })}
                    >
                      Aa
                    </button>
                  ))}
                  <button className={styles.addTextBtn} onClick={addAlbumText}><span>Adicionar</span></button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
