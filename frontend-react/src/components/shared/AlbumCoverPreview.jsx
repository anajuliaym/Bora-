export default function AlbumCoverPreview({ coverBg, textColor, items }) {
  return (
    <div
      style={{
        width: 93, height: 122, borderRadius: '3px 8px 8px 3px', background: coverBg,
        boxShadow: '0 6px 14px rgba(0,0,0,0.24), inset 0 0 0 1px rgba(255,255,255,0.1)',
        position: 'relative', overflow: 'hidden', flexGrow: 0,
      }}
    >
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(circle at 20% 20%,rgba(255,255,255,0.16),transparent 42%),'
          + 'radial-gradient(circle at 78% 55%,rgba(0,0,0,0.12),transparent 48%),'
          + 'radial-gradient(circle at 45% 85%,rgba(255,255,255,0.1),transparent 50%)',
      }} />
      <div style={{ position: 'absolute', left: 0, top: 0, width: 204, height: 340, transform: 'scale(0.3505)', transformOrigin: 'top left' }}>
        {items.map((it, i) => {
          const transform = `translate(-50%,-50%) rotate(${it.rot}) scale(${it.scale})`;
          if (it.isPhoto) {
            return (
              <div key={i} style={{ position: 'absolute', left: it.left, top: it.top, width: 92, transform, background: '#fff', padding: '5px 5px 18px 5px', boxShadow: '0 5px 12px rgba(0,0,0,0.28)' }}>
                <div style={{ width: '100%', aspectRatio: '1', background: it.bg }} />
              </div>
            );
          }
          if (it.isSticker) {
            return (
              <div key={i} style={{ position: 'absolute', left: it.left, top: it.top, width: it.stW, height: it.stH, background: `url('${it.src}') center/contain no-repeat`, transform }} />
            );
          }
          return (
            <div key={i} style={{ position: 'absolute', left: it.left, top: it.top, maxWidth: it.boxWidthPx, transform }}>
              <span style={{
                fontFamily: it.fontFamily, fontSize: 22, lineHeight: 1.15, color: textColor,
                textShadow: '-1px -1px 1px rgba(0,0,0,0.3), 1px 1px 1px rgba(255,255,255,0.4)',
                whiteSpace: 'pre-wrap', textAlign: 'center', display: 'block',
              }}>
                {it.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
