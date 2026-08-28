import { stickerBox } from '../mock-data/mock-data.js';

const FONT_FAMILIES = {
  caveat: 'var(--font-caveat)',
  inter: 'var(--font-body)',
  poppins: 'var(--font-heading)',
};

/** Converte um item cru do álbum (photo/sticker/text) nos campos de exibição
 * (posição %, rotação, tamanho) usados tanto na prévia da capa quanto na
 * página real do álbum. */
export function toDisplayItem(it) {
  const box = it.type === 'sticker' ? stickerBox(it.src, 64) : { w: 64, h: 64 };
  return {
    ...it,
    isPhoto: it.type === 'photo',
    isSticker: it.type === 'sticker',
    isText: it.type === 'text',
    left: it.x + '%',
    top: it.y + '%',
    rot: it.rot + 'deg',
    scale: it.scale,
    stW: box.w + 'px',
    stH: box.h + 'px',
    fontFamily: FONT_FAMILIES[it.font] || FONT_FAMILIES.poppins,
    boxWidthPx: (it.boxWidth || 190) + 'px',
  };
}

export function textColorForBg(c) {
  let r = 196, g = 163, b = 130;
  if (c) {
    if (c[0] === '#') {
      const n = parseInt(c.slice(1), 16);
      r = (n >> 16) & 255; g = (n >> 8) & 255; b = n & 255;
    } else {
      const m = c.match(/\d+/g);
      if (m) { r = +m[0]; g = +m[1]; b = +m[2]; }
    }
  }
  return `rgba(${Math.round(r * 0.42)},${Math.round(g * 0.42)},${Math.round(b * 0.42)},0.85)`;
}

export function rgbToHex(c) {
  if (!c) return '#c4a382';
  if (c[0] === '#') return c;
  const m = c.match(/\d+/g);
  if (!m) return '#c4a382';
  return '#' + m.slice(0, 3).map((n) => (+n).toString(16).padStart(2, '0')).join('');
}
