import { useEffect, useRef, useState } from 'react';

/** Pede acesso à câmera frontal (com fallback pra qualquer câmera) e expõe
 * um <video> ref pronto pra usar, além de capture() pra tirar a foto. */
export function useCamera() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [denied, setDenied] = useState(false);
  const [error, setError] = useState(null);

  const request = () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setDenied(true);
      setError('unsupported');
      return;
    }
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: 'user' } }, audio: false })
      .catch(() => navigator.mediaDevices.getUserMedia({ video: true, audio: false }))
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        setDenied(false);
        setError(null);
      })
      .catch((err) => {
        setDenied(true);
        setError((err && (err.name || err.message)) || 'erro');
      });
  };

  useEffect(() => {
    request();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function capture() {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return null;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = v.videoWidth;
      canvas.height = v.videoHeight;
      const ctx = canvas.getContext('2d');
      // Espelha a captura pra bater com o preview (câmera frontal) — sem
      // isso a foto salva sai "ao contrário" do que a pessoa viu na tela.
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', 0.86);
    } catch {
      return null;
    }
  }

  return { videoRef, denied, error, retry: request, capture };
}
