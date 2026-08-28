import styles from './PostCard.module.css';

export default function PostCard({ post, liked, heartAnim, onToggleLike, onViewProfile, onComment, delay = '0s' }) {
  return (
    <div className={styles.card} style={{ animationDelay: delay }}>
      <div className={styles.head}>
        <button className={styles.avatar} style={{ background: post.avatarBg }} onClick={onViewProfile}>
          <span>{post.initial}</span>
        </button>
        <div className={styles.who}>
          <div className={styles.whoTop}>
            <button className={styles.uname} onClick={onViewProfile}>{post.u}</button>
            <div className={styles.lvl}><span>LVL {post.lvl}</span></div>
          </div>
          <div className={styles.locRow}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgb(93,103,120)" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span className={styles.loc}>{post.loc}</span>
          </div>
        </div>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--text-secondary)" style={{ cursor: 'pointer' }}>
          <circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" />
        </svg>
      </div>

      <div className={styles.photo}>
        <div className={styles.photoBg} style={{ background: post.bg, filter: post.filter }} />
        <div className={styles.time}><span>{post.time}</span></div>
        {post.badge && (
          <div className={styles.badge}><span>{post.badge}</span></div>
        )}
      </div>

      <div className={styles.actions}>
        <span className={styles.cap}>{post.cap}</span>
        <div className={styles.icons}>
          <button onClick={onToggleLike} aria-label="Curtir">
            <svg width="24" height="24" viewBox="0 0 24 24" fill={liked ? 'rgb(255,0,127)' : 'none'} stroke="rgb(255,0,127)" strokeWidth="2" style={{ animation: heartAnim }}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
          <button onClick={onComment} aria-label="Comentar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgb(93,103,120)" strokeWidth="2">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          </button>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgb(93,103,120)" strokeWidth="2" style={{ cursor: 'pointer' }}>
            <line x1="22" y1="2" x2="11" y2="13" /><path d="M22 2 15 22l-4-9-9-4 20-7z" />
          </svg>
        </div>
      </div>

      <div className={styles.likes}>
        <span>{post.likes} curtidas</span>
      </div>
    </div>
  );
}
