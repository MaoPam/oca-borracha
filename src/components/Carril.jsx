import { useEffect, useRef } from 'react';
import { META } from '../data/casillas.js';
import Casilla from './Casilla.jsx';

// Vista de celular: las 60 casillas en una tira que se desliza sola
// hasta dejar al muñeco del turno en el centro. En el espiral de 9x7
// cada casilla queda de unos 40px en un celular; aqui caben grandes.
export default function Carril({ jugadores, turno, resaltada, onVer }) {
  const ref = useRef(null);
  const pos = jugadores[turno]?.pos ?? 1;

  useEffect(() => {
    const carril = ref.current;
    const casilla = carril?.querySelector(`[data-n="${pos}"]`);
    if (!carril || !casilla) return;
    // scrollIntoView moveria tambien la pagina entera; movemos solo la tira.
    const destino = casilla.offsetLeft - (carril.clientWidth - casilla.offsetWidth) / 2;
    const brusco = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    carril.scrollTo({ left: destino, behavior: brusco ? 'auto' : 'smooth' });
  }, [pos]);

  return (
    <div className="carril-caja">
      <div className="carril" ref={ref} aria-label="Casillas de la 1 a la 60">
        {Array.from({ length: META }, (_, i) => i + 1).map(n => (
          <Casilla key={n} n={n} jugadores={jugadores} turno={turno} resaltada={resaltada} onVer={onVer} />
        ))}
      </div>
    </div>
  );
}
