import styles from './PolaroidModal.module.css';
import { polaroids as polaroidsData, grads } from '../../mock-data/mock-data.js';

export default function PolaroidModal({ index, onClose }) {
  const raw = polaroidsData[index];
  if (!raw) return null;
  const ph = { ...raw, bg: typeof raw.bg === 'number' ? grads[raw.bg] : raw.bg };

  return (
    <button className={styles.overlay} onClick={onClose}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <div className={styles.head}>
          <div className={styles.avatar}><span>T</span></div>
          <div className={styles.who}>
            <div className={styles.whoTop}>
              <span>@thiago_rolê</span>
              <div className={styles.lvl}><span>LVL 12</span></div>
            </div>
            <div className={styles.locRow}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgb(93,103,120)" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
              <span>{ph.loc}</span>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2.4">
              <path d="M18 6L6 18" /><path d="M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className={styles.photoWrap}>
          <div className={styles.photo}>
            <div className={styles.photoBg} style={{ background: ph.bg }} />
            <span className={styles.photoCaption}>{ph.loc}</span>
          </div>
        </div>

        <div className={styles.badgeRow}>
          {ph.badge ? (
            <div className={styles.badge}><span>{ph.badge}</span></div>
          ) : (
            <div className={styles.noBadge}><span>Check-in de rolê</span></div>
          )}
        </div>

        <div className={styles.cap}><span>{ph.cap}</span></div>

        <div className={styles.meta}>
          <div className={styles.metaItem}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="3" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>{ph.date}</span>
          </div>
          <div className={styles.metaItem}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2">
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /><circle cx="12" cy="12" r="10" />
            </svg>
            <span>{ph.role}</span>
          </div>
        </div>
      </div>
    </button>
  );
}
