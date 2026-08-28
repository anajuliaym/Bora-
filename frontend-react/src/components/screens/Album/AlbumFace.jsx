import AlbumItemView from './AlbumItemView.jsx';

export default function AlbumFace({ faceId, items, selection, readOnly, textColor, drag, style, withDataFace = true }) {
  return (
    <div data-face={withDataFace ? faceId : undefined} style={style}>
      {items.map((item, i) => (
        <AlbumItemView
          key={i}
          item={item}
          faceId={faceId}
          index={i}
          selected={!readOnly && !!selection && selection.face === faceId && selection.i === i}
          readOnly={readOnly}
          textColor={textColor}
          drag={drag}
        />
      ))}
    </div>
  );
}
