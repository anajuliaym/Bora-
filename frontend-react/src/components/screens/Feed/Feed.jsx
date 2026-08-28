import { useMemo } from 'react';
import ScreenShell from '../../layout/ScreenShell.jsx';
import PostCard from '../../shared/PostCard.jsx';
import styles from './Feed.module.css';
import { basePosts, grads } from '../../../mock-data/mock-data.js';

export default function Feed({ state, dispatch, go }) {
  const posts = useMemo(() => {
    const posted = state.posted
      ? [{
        u: '@thiago_rolê', lvl: 12, loc: 'Bar do Zé, Vila Madalena', time: 'agora',
        badge: 'Desafio diário', cap: state.postedCaption || 'Desafio de hoje feito! +120 XP',
        likes: 0, bg: `url(${state.capturedPhoto || '/assets/photo1.jpg'}) center/cover`,
        avatarBg: 4, initial: 'T', filter: state.postedFilter,
      }]
      : [];
    return posted.concat(basePosts).map((p, i) => {
      const liked = !!state.liked[i];
      return {
        ...p,
        filter: p.filter || 'none',
        bg: typeof p.bg === 'number' ? grads[p.bg] : p.bg,
        avatarBg: grads[p.avatarBg],
        likes: p.likes + (liked ? 1 : 0),
        liked,
        heartAnim: state.liked[i] === undefined ? 'none' : (liked ? 'heartPopA 0.4s ease' : 'heartPopB 0.4s ease'),
        index: i,
      };
    });
  }, [state.posted, state.postedCaption, state.capturedPhoto, state.postedFilter, state.liked]);

  return (
    <ScreenShell overflow="auto">
      <div className={styles.header}>
        <img src="/assets/logo.svg" alt="Bora?" className={styles.logo} />
        <div className={styles.headerIcons}>
          <svg onClick={() => go('descobrir')} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgb(93,103,120)" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <button className={styles.chatBtn} onClick={() => go('chat')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgb(93,103,120)" strokeWidth="2">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
            <div className={styles.chatDot} />
          </button>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.challengeCard}>
          <div className={styles.challengeTop}>
            <span className={styles.challengeLabel}>Desafio diário</span>
            <span className={styles.challengeXp}>+120 XP</span>
          </div>
          <span className={styles.challengeTitle}>Vá a um rolê que você nunca foi</span>
          <div className={styles.challengeBottom}>
            <button className={styles.challengeLink} onClick={() => go('desafios', { backFrom: 'feed' })}>
              Termina em 6h 12min · ver todos
            </button>
            <button className={styles.challengeBtn} onClick={go === undefined ? undefined : () => go('camera')}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgb(255,255,255)" strokeWidth="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              Fazer agora
            </button>
          </div>
        </div>

        {posts.map((p) => (
          <PostCard
            key={p.index}
            post={p}
            liked={p.liked}
            heartAnim={p.heartAnim}
            delay={`${p.index * 0.07}s`}
            onToggleLike={() => dispatch({ type: 'TOGGLE_LIKE', postId: p.index })}
            onViewProfile={() => (
              p.u === '@thiago_rolê'
                ? go('perfil', { viewingProfile: null, albumReadOnly: false, roAlbumData: null })
                : go('perfil', { viewingProfile: { handle: p.u, lvl: p.lvl, avatarBg: p.avatarBg, initial: p.initial } })
            )}
            onComment={() => go('chat')}
          />
        ))}
      </div>
    </ScreenShell>
  );
}
