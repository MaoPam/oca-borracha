import FichaDibujo from './FichaDibujo.jsx';
import { colorDe } from './colores.js';
import { META } from '../data/casillas.js';

const enTira = (pos) => `${((pos - 1) / (META - 1)) * 100}%`;

// La carrera: cada ficha en su lugar sobre una tira del 1 al 60, en el encabezado,
// para saber quién va ganando sin abrir la burbuja.
export default function Carrera({ jugadores, turno, lineas = [], prendida }) {
  const todos = jugadores.map((j, i) => ({ j, i }));
  const enJuego = todos.filter(({ j }) => !j.gano);
  const lider = enJuego.length ? enJuego.reduce((a, b) => (b.j.pos > a.j.pos ? b : a)) : null;

  // Fichas muy juntas se apilan en dos alturas, alternando, para que no se tapen.
  const arriba = new Set();
  [...todos].sort((a, b) => a.j.pos - b.j.pos).forEach((x, k, orden) => {
    const previa = orden[k - 1];
    if (previa && x.j.pos - previa.j.pos < 3 && !arriba.has(previa.i)) arriba.add(x.i);
  });

  return (
    <div className="carrera" aria-label="Quién va ganando">
      <span className="carrera-linea" />
      {[...new Set([1, ...lineas, 60])].map(n => (
        <i key={n} className={`carrera-marca${lineas.includes(n) ? ' evento' : ''}${prendida === n ? ' prendida' : ''}`} style={{ left: enTira(n) }}><b>{n}</b></i>
      ))}
      {todos.map(({ j, i }) => (
        <span
          key={i}
          className={`carrera-f${i === turno ? ' ahora' : ''}${arriba.has(i) ? ' arriba' : ''}`}
          style={{ left: enTira(j.pos), '--c': colorDe(i).c }}
          title={`${j.nombre}: ${j.gano ? `lugar ${j.gano}` : `casilla ${j.pos}`}`}
        >
          {lider?.i === i && <span className="carrera-lider">1º</span>}
          <svg viewBox="0 0 40 56" aria-hidden="true"><FichaDibujo tipo={j.ficha} inicial={(j.nombre || '?')[0].toUpperCase()} /></svg>
        </span>
      ))}
    </div>
  );
}
