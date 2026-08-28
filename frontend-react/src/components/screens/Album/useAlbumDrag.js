import { useCallback, useRef } from 'react';

/**
 * Gestos de arrastar/redimensionar/escalar item do álbum. Segue o mesmo
 * padrão de performance do app original: durante o gesto, muta o DOM
 * diretamente via ref (sem passar pelo reducer a cada pixel); só no
 * pointerup é que o valor final é "commitado" (reducer + localStorage).
 */
export function useAlbumDrag({ spread, commitMove, commitResize, commitScale, setSelected }) {
  const dragPos = useRef(null);

  const startDrag = useCallback((e, faceId, i) => {
    e.preventDefault();
    e.stopPropagation();
    setSelected({ face: faceId, i });
    const el = e.currentTarget;
    const page = el.parentElement;
    const pr = page.getBoundingClientRect();
    el.style.zIndex = '99';
    const isRight = faceId[0] === 'f';

    const move = (ev) => {
      const nx = ((ev.clientX - pr.left) / pr.width) * 100;
      const ny = Math.min(94, Math.max(6, ((ev.clientY - pr.top) / pr.height) * 100));
      el.style.left = nx + '%';
      el.style.top = ny + '%';
      dragPos.current = { nx, ny };
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      const p = dragPos.current;
      dragPos.current = null;
      if (!p) {
        commitMove(faceId, i, null);
        setSelected({ face: faceId, i });
        return;
      }
      let target = faceId;
      let tx = p.nx;
      if (faceId !== 'C') {
        if (isRight && p.nx < 0) { target = spread > 0 ? 'b' + (spread - 1) : 'L'; tx = p.nx + 100; }
        else if (!isRight && p.nx > 100) { target = 'f' + spread; tx = p.nx - 100; }
      }
      tx = Math.min(96, Math.max(4, tx));
      const ty = Math.round(p.ny * 10) / 10;
      const { newFace, newIndex } = commitMove(faceId, i, { x: Math.round(tx * 10) / 10, y: ty, target });
      setSelected({ face: newFace, i: newIndex });
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }, [spread, commitMove, setSelected]);

  const startResize = useCallback((e, faceId, i, startW) => {
    e.preventDefault();
    e.stopPropagation();
    const box = e.currentTarget.parentElement;
    const startX = e.clientX;
    let liveW = startW;
    const move = (ev) => {
      const dx = (ev.clientX - startX) * 2;
      liveW = Math.min(340, Math.max(80, Math.round(startW + dx)));
      box.style.maxWidth = liveW + 'px';
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      commitResize(faceId, i, liveW);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }, [commitResize]);

  const startScale = useCallback((e, faceId, i, startScale, rotDeg) => {
    e.preventDefault();
    e.stopPropagation();
    const box = e.currentTarget.parentElement;
    const startX = e.clientX;
    const startY = e.clientY;
    let liveScale = startScale;
    const move = (ev) => {
      const d = (ev.clientX - startX + (ev.clientY - startY)) / 2;
      liveScale = Math.min(3.2, Math.max(0.4, Math.round((startScale + d / 80) * 100) / 100));
      box.style.transform = `translate(-50%,-50%) rotate(${rotDeg}) scale(${liveScale})`;
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      commitScale(faceId, i, liveScale);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }, [commitScale]);

  return { startDrag, startResize, startScale };
}
