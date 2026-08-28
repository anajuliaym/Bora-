import { Suspense, lazy, useMemo } from 'react';
import ScreenShell from '../../layout/ScreenShell.jsx';
import AlbumCoverPreview from '../../shared/AlbumCoverPreview.jsx';
import styles from './Perfil.module.css';
import { polaroids as polaroidsData, grads, stickerList } from '../../../mock-data/mock-data.js';
import { loadAlbumIndex, loadAlbumFor, saveAlbumIndex } from '../../../hooks/useAlbumStorage.js';
import { toDisplayItem, textColorForBg } from '../../../utils/albumItems.js';

const Bora3D = lazy(() => import('../../shared/Bora3D.jsx'));

export default function Perfil({ state, dispatch, go }) {
  const vp = state.viewingProfile;
  const isOwnProfile = !vp;

  const openAlbum = (extra) => go('album', { albumItems: null, albumOpened: false, albumSpread: 0, albumSel: null, ...extra });

  const createAlbum = () => {
    const idx = loadAlbumIndex();
    const id = 'a' + Date.now();
    idx.push({ id, name: `Álbum ${idx.length + 1}` });
    saveAlbumIndex(idx);
    openAlbum({ currentAlbumId: id });
  };

  // SUBSTITUIR EM PRODUÇÃO: sem backend, o "álbum de outro usuário" é
  // gerado na hora com dados fixos — um app real buscaria isso de uma API.
  const viewOtherAlbum = () => {
    const roData = {
      _coverColor: vp.avatarBg,
      C: [
        { type: 'sticker', src: stickerList[3], x: 50, y: 26, rot: -6, scale: 1, z: 1 },
        { type: 'text', text: vp.handle, font: 'poppins', x: 50, y: 70, rot: 0, scale: 1, boxWidth: 150, z: 2 },
      ],
      f0: [
        { type: 'photo', bg: 'url(/assets/photo1.jpg) center/cover', loc: 'Bar do Zé', x: 50, y: 45, rot: -3, scale: 1, z: 1 },
      ],
    };
    openAlbum({ albumReadOnly: true, roAlbumData: roData, roAlbumName: `Álbum de ${vp.handle}` });
  };

  const albumHighlights = useMemo(() => {
    if (vp) {
      return [{
        id: `ro-${vp.handle}`,
        name: `Álbum de ${vp.handle}`,
        coverBg: vp.avatarBg,
        textColor: textColorForBg(vp.avatarBg),
        items: [
          { type: 'sticker', src: stickerList[3], x: 50, y: 26, rot: -6, scale: 1 },
          { type: 'text', text: vp.handle, font: 'poppins', x: 50, y: 70, rot: 0, scale: 1, boxWidth: 150 },
        ].map(toDisplayItem),
        open: viewOtherAlbum,
      }];
    }
    return loadAlbumIndex().map((a) => {
      const items = loadAlbumFor(a.id);
      const coverBg = items._coverColor || 'rgb(196,163,130)';
      return {
        id: a.id,
        name: a.name,
        coverBg,
        textColor: textColorForBg(coverBg),
        items: (items.C || []).map(toDisplayItem),
        open: () => openAlbum({ currentAlbumId: a.id }),
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vp, state.screen]);

  const polaroids = polaroidsData.map((ph, i) => ({
    ...ph,
    bg: typeof ph.bg === 'number' ? grads[ph.bg] : ph.bg,
    open: () => dispatch({ type: 'MERGE', payload: { polaroidView: i } }),
  }));

  const profile = vp
    ? { initial: vp.initial, name: vp.handle, lvl: vp.lvl, avatarBg: vp.avatarBg, sub: `Perfil de ${vp.handle}` }
    : { initial: 'T', name: '@thiago_rolê', lvl: 12, avatarBg: 'var(--secondary-mid)', sub: 'São Paulo • na Bora? desde 2025' };

  return (
    <ScreenShell overflow="auto">
      <div className={styles.body}>
        {!isOwnProfile && (
          <button className={styles.backBtn} onClick={() => go('feed')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2.4">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}

        <div className={styles.headBlock}>
          <div className={styles.avatar} style={{ background: profile.avatarBg }}><span>{profile.initial}</span></div>
          <div className={styles.nameRow}>
            <span>{profile.name}</span>
            <div className={styles.lvl}><span>LVL {profile.lvl}</span></div>
          </div>
          <span className={styles.sub}>{profile.sub}</span>
        </div>

        <div className={styles.xpCard}>
          <div className={styles.xpText}>
            <div className={styles.xpRow}>
              <span>Progresso para o LVL 13</span>
              <span>2.450 / 3.000 XP</span>
            </div>
            <div className={styles.bar}><div className={styles.barFill} /></div>
          </div>
          <Suspense fallback={<div className={styles.medal3d} />}>
            <Bora3D model="medal" sway style={{ width: 88, height: 53, flexShrink: 0 }} />
          </Suspense>
        </div>

        <div className={styles.stats}>
          <div className={styles.statBox}><span>47</span><span>Rolês</span></div>
          <div className={styles.statBox}><span>23</span><span>Desafios</span></div>
          <div className={styles.statBox}><span>128</span><span>Amigos</span></div>
        </div>

        <div className={styles.sectionHead}>
          <span className={styles.sectionTitle}>{isOwnProfile ? 'Meus álbuns' : 'Álbuns'}</span>
          {isOwnProfile && (
            <button className={styles.addBtn} onClick={createAlbum}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.4">
                <path d="M12 5v14" /><path d="M5 12h14" />
              </svg>
            </button>
          )}
        </div>
        <div className={styles.albumRow}>
          {albumHighlights.map((al) => (
            <button className={styles.albumCol} key={al.id} onClick={al.open}>
              <AlbumCoverPreview coverBg={al.coverBg} textColor={al.textColor} items={al.items} />
              <span className={styles.albumName}>{al.name}</span>
            </button>
          ))}
        </div>

        <span className={styles.sectionTitle}>Check-ins recentes</span>
        <div className={styles.polaroidGrid}>
          {polaroids.map((ph, i) => (
            <button className={styles.polaroid} key={i} style={{ transform: `rotate(${ph.rot})` }} onClick={ph.open}>
              <div className={styles.polaroidPhoto} style={{ background: ph.bg }} />
              <span className={styles.polaroidCaption}>{ph.loc}</span>
            </button>
          ))}
        </div>
      </div>
    </ScreenShell>
  );
}
