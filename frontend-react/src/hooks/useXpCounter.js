import { useEffect, useRef } from 'react';

/** Anima state.xpVal de 5 em 5 até 120 a cada 34ms, como o setInterval do
 * app original. `dispatch` deve ser o dispatch do reducer principal. */
export function useXpCounter(dispatch) {
  const intervalRef = useRef(null);

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const start = () => {
    clearInterval(intervalRef.current);
    let v = 0;
    dispatch({ type: 'MERGE', payload: { xpVal: 0 } });
    intervalRef.current = setInterval(() => {
      v = Math.min(v + 5, 120);
      dispatch({ type: 'MERGE', payload: { xpVal: v } });
      if (v >= 120) clearInterval(intervalRef.current);
    }, 34);
  };

  const stop = () => clearInterval(intervalRef.current);

  return { start, stop };
}
