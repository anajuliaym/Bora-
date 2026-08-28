import { toDisplayItem } from '../../../utils/albumItems.js';

const HANDLE_STYLE = {
  width: 16, height: 16, borderRadius: '50%', background: 'var(--accent)',
  border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.35)', pointerEvents: 'none',
};

export default function AlbumItemView({ item, faceId, index, selected, readOnly, textColor, drag }) {
  const d = toDisplayItem(item);
  const transform = `translate(-50%,-50%) rotate(${d.rot}) scale(${d.scale})`;
  const outline = selected ? '2px dashed rgb(255,0,127)' : 'none';
  const z = selected ? 999 : (item.z != null ? item.z % 900 : index);
  const onDown = readOnly ? undefined : (e) => drag.startDrag(e, faceId, index);
  const cornerDown = readOnly ? undefined : (e) => drag.startScale(e, faceId, index, item.scale || 1, d.rot);
  const resizeDown = readOnly ? undefined : (e) => drag.startResize(e, faceId, index, item.boxWidth || 190);

  if (d.isPhoto) {
    return (
      <div
        onPointerDown={onDown}
        style={{
          position: 'absolute', left: d.left, top: d.top, width: 92, transform, zIndex: z,
          cursor: 'grab', touchAction: 'none', background: '#fff', padding: '5px 5px 18px 5px',
          boxShadow: '0 5px 12px rgba(0,0,0,0.28)', outline, outlineOffset: 2,
        }}
      >
        <div style={{ width: '100%', aspectRatio: '1', background: d.bg }} />
        <span style={{
          position: 'absolute', left: 0, right: 0, bottom: 3, textAlign: 'center',
          fontFamily: 'var(--font-heading)', fontStyle: 'italic', fontSize: 8, color: 'var(--text-secondary)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{d.loc}</span>
        {selected && !readOnly && (
          <div onPointerDown={cornerDown} style={{ position: 'absolute', right: -8, bottom: -8, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'nwse-resize', touchAction: 'none' }}>
            <div style={HANDLE_STYLE} />
          </div>
        )}
      </div>
    );
  }

  if (d.isSticker) {
    return (
      <div
        onPointerDown={onDown}
        style={{
          position: 'absolute', left: d.left, top: d.top, width: d.stW, height: d.stH,
          background: `url('${d.src}') center/contain no-repeat`, transform, zIndex: z,
          cursor: 'grab', touchAction: 'none', filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.3))',
          outline, outlineOffset: 2,
        }}
      >
        {selected && !readOnly && (
          <div onPointerDown={cornerDown} style={{ position: 'absolute', right: -8, bottom: -8, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'nwse-resize', touchAction: 'none' }}>
            <div style={HANDLE_STYLE} />
          </div>
        )}
      </div>
    );
  }

  // texto — sempre via children do JSX (auto-escapado pelo React), nunca dangerouslySetInnerHTML
  return (
    <div
      onPointerDown={onDown}
      style={{ position: 'absolute', left: d.left, top: d.top, maxWidth: d.boxWidthPx, transform, zIndex: z, cursor: 'grab', touchAction: 'none', outline, outlineOffset: 6, padding: 4 }}
    >
      <span style={{ fontFamily: d.fontFamily, fontSize: 22, lineHeight: 1.15, color: textColor, whiteSpace: 'pre-wrap', textAlign: 'center', display: 'block' }}>
        {d.text}
      </span>
      {selected && !readOnly && (
        <div onPointerDown={resizeDown} style={{ position: 'absolute', right: -14, top: '50%', transform: 'translateY(-50%)', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'ew-resize', touchAction: 'none' }}>
          <div style={{ ...HANDLE_STYLE, width: 18, height: 18 }} />
        </div>
      )}
    </div>
  );
}
