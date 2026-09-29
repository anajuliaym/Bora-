import { Suspense, lazy } from 'react';
import { useCamera } from '../../../hooks/useCamera.js';
import styles from './Camera.module.css';
import { filters } from '../../../mock-data/mock-data.js';
import { publicarFoto, supabaseConfigurado } from '../../../api-supabase.js';

const Bora3D = lazy(() => import('../../shared/Bora3D.jsx'));

export default function Camera({ state, dispatch, go, startXp }) {
  const { videoRef, denied, error, retry, capture } = useCamera();
  const merge = (payload) => dispatch({ type: 'MERGE', payload });

  const filterIdx = state.filterIdx || 0;
  const camFilterCss = filters[filterIdx].css;
  const capturedBg = `url(${state.capturedPhoto || '/assets/photo1.jpg'}) center/cover`;
  const camCaptionShown = (state.camCaption || '').trim() || 'Bar do Zé, Vila Madalena';
  const camErrorMsg = error
    ? `Câmera não disponível (${error}) — mostrando foto de exemplo`
    : 'Câmera não disponível — mostrando foto de exemplo';

  const shutter = () => {
    if (state.printing) return;
    const shot = capture();
    merge({ printing: true, camModelReady: false, capturedPhoto: shot, postedFilter: camFilterCss });
  };

  const confirmPost = async () => {
    const legenda = (state.camCaption || '').trim();
    const origem = state.capturedPhoto || '/assets/photo1.jpg';
    merge({
      printing: false, posted: true, screen: 'feed',
      postedCaption: legenda, xpShow: true, xpVal: 0, fotoEnviadaId: null, fotoErro: null,
    });
    startXp();

    // Com Supabase configurado e usuário logado, a foto vai pro Storage e
    // vira uma linha em `fotos`; o Feed troca o post local pelo remoto.
    if (!supabaseConfigurado || !state.usuario) return;
    try {
      const foto = await publicarFoto({ origem, legenda, filtro: camFilterCss, local: 'Bar do Zé, Vila Madalena' });
      merge({ fotoEnviadaId: foto.id, fotosVersao: (state.fotosVersao || 0) + 1 });
    } catch (err) {
      merge({ fotoErro: err.message });
    }
  };

  return (
    <div className={styles.screen} style={{ position: 'absolute', inset: 0, animation: 'screenIn 0.4s cubic-bezier(0.22,1,0.36,1)' }}>
      <div className={styles.topBar}>
        <button className={styles.closeBtn} onClick={() => go('feed')}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <div className={styles.challengeTag}><span>Desafio diário • +120 XP</span></div>
        <div style={{ width: 26 }} />
      </div>

      <div className={styles.locRow}>
        <div className={styles.locPill}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgb(174,224,175)" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
          </svg>
          <span>Bar do Zé, Vila Madalena — localização confirmada ✓</span>
        </div>
      </div>

      <div className={styles.viewport}>
        <div className={styles.viewportBg} style={{ filter: camFilterCss }} />
        <video ref={videoRef} muted autoPlay playsInline className={styles.video} style={{ filter: camFilterCss }} />

        {denied && (
          <>
            <div className={styles.deniedBanner}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgb(255,216,1)" strokeWidth="2" style={{ flexShrink: 0 }}>
                <path d="M1 1l22 22" /><path d="M21 21H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4l1.5-2h5L15 5" /><path d="M14.5 14.5a4 4 0 1 1-6-4.9" />
              </svg>
              <span>{camErrorMsg}</span>
            </div>
            <button className={styles.retryBtn} onClick={retry}>
              <span>Tentar permitir câmera de novo</span>
            </button>
          </>
        )}

        <div className={styles.hint}><span>Tire a foto no rolê pra ganhar o XP</span></div>
        <div className={styles.filterName}><span>{filters[filterIdx].n}</span></div>
      </div>

      <div className={styles.filters}>
        {filters.map((f, i) => (
          <button key={f.n} className={styles.filterItem} onClick={() => merge({ filterIdx: i })}>
            <div
              className={styles.filterSwatch}
              style={{
                filter: f.css,
                boxShadow: i === filterIdx ? '0 0 0 3px rgb(12,16,36),0 0 0 6px rgb(255,0,127)' : '0 0 0 1px rgba(255,255,255,0.3)',
              }}
            />
            <span style={{ color: i === filterIdx ? 'var(--accent)' : 'rgba(255,255,255,0.75)' }}>{f.n}</span>
          </button>
        ))}
      </div>

      <div className={styles.shutterRow}>
        <button className={styles.shutter} onClick={shutter}>
          <div className={styles.shutterInner} />
        </button>
      </div>

      {state.printing && (
        <div className={styles.printOverlay}>
          <div className={styles.flash} />
          <div className={styles.model3dWrap}>
            <Suspense fallback={null}>
              <Bora3D
                model="polaroid"
                front
                style={{ width: 450, height: 354 }}
                onReady={() => merge({ camModelReady: true })}
              />
            </Suspense>
          </div>
          <div className={styles.printSlot}>
            {state.camModelReady && (
              <div className={styles.polaroid}>
                <button className={styles.polaroidPhoto} onClick={() => merge({ photoZoom: true })}>
                  <div className={styles.polaroidPhotoBg} style={{ background: capturedBg, filter: camFilterCss }} />
                  <div className={styles.polaroidDevelop} />
                  <div className={styles.polaroidSheen} />
                </button>
                <span className={styles.polaroidCaption}>{camCaptionShown}</span>
              </div>
            )}
          </div>
          {state.camModelReady && (
            <>
              <input
                className={styles.captionInput}
                value={state.camCaption || ''}
                onChange={(e) => merge({ camCaption: e.target.value })}
                placeholder="Escreva a legenda da foto..."
                maxLength={60}
              />
              <div className={styles.printActions}>
                <button className={styles.retakeBtn} onClick={() => merge({ printing: false, capturedPhoto: null })}>
                  Tirar outra
                </button>
                <button className={styles.postBtn} onClick={confirmPost}>
                  Postar no feed • +120 XP
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {state.photoZoom && (
        <button className={styles.zoomOverlay} onClick={() => merge({ photoZoom: false })}>
          <div className={styles.zoomCard}>
            <div className={styles.zoomPhoto}>
              <div style={{ position: 'absolute', inset: 0, background: capturedBg, filter: camFilterCss }} />
              <div className={styles.zoomSheen} />
            </div>
            <span className={styles.zoomCaption}>{camCaptionShown}</span>
          </div>
        </button>
      )}
    </div>
  );
}
