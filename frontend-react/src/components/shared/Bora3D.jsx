import { useEffect, useRef } from 'react';
import '../../lib/bora-3d.js'; // side-effect: registra customElements.define('bora-3d', ...)

/**
 * Wrapper React para o web component <bora-3d>. Ouve o evento
 * 'bora3d-ready' na instância (via ref), não em window — assim várias
 * <bora-3d> na tela ao mesmo tempo (ex: perfil + overlay de XP) não se
 * confundem, diferente do listener global do app original.
 */
export default function Bora3D({ model, sway, front, yaw, spin, style, onReady }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !onReady) return;
    const handler = () => onReady();
    el.addEventListener('bora3d-ready', handler);
    return () => el.removeEventListener('bora3d-ready', handler);
  }, [onReady]);

  // <bora-3d> força width/height:100% em si mesmo assim que conecta (pra
  // preencher o container) — por isso o tamanho pedido vai num wrapper, não
  // no elemento direto, senão ele nunca é aplicado (sobrescrito no connect).
  return (
    <div style={style}>
      <bora-3d
        ref={ref}
        model={model}
        sway={sway ? '1' : undefined}
        front={front ? '1' : undefined}
        yaw={yaw}
        spin={spin}
      />
    </div>
  );
}
