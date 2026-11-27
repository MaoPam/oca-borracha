import { META } from '../data/casillas.js';
import { trazarEspiral } from '../game/reglas.js';
import Casilla, { Fichas } from './Casilla.jsx';
import { memeDe } from './lona.js';

const { camino, meta } = trazarEspiral();

// El camino se dibuja en un lienzo con la misma proporción que la zona de
// casillas (9 columnas x 7 filas), así cada punto cae en el centro de su casilla.
const AN = 900, AL = 571, CW = AN / 9, CH = AL / 7;
const centro = ([f, c]) => [(c + 0.5) * CW, (f + 0.5) * CH];
const PUNTOS = [
  ...camino.map(centro),
  [((meta.cols[0] + meta.cols[1] + 1) / 2) * CW, (meta.filas[0] + 0.5) * CH],
];
const LINEA = PUNTOS.map(p => p.map(v => v.toFixed(1)).join(',')).join(' ');

// Una flecha en el hueco justo después de cada vuelta del espiral. Va en el
// hueco y no en la esquina porque en la esquina la taparía la casilla.
const FLECHAS = PUNTOS.slice(1, -1).flatMap((b, k) => {
  const a = PUNTOS[k], c = PUNTOS[k + 2];
  const gira = Math.sign(b[0] - a[0]) !== Math.sign(c[0] - b[0]) || Math.sign(b[1] - a[1]) !== Math.sign(c[1] - b[1]);
  if (!gira) return [];
  const ang = (Math.atan2(c[1] - b[1], c[0] - b[0]) * 180) / Math.PI;
  return [{ x: (b[0] + c[0]) / 2, y: (b[1] + c[1]) / 2, ang }];
});

// Cámara que sigue a la ficha: el tablero se agranda ZOOM veces y se recorre para que la
// casilla quede al centro. Los porcentajes de translate son del propio tablero, así que
// sirve igual en cualquier tamaño de pantalla.
const ZOOM = 1.9;
const centroPct = (n) => {
  const [f, c] = n >= META ? [meta.filas[0], (meta.cols[0] + meta.cols[1]) / 2] : camino[n - 1];
  // 1.5% y 2.3%: el relleno del tablero, en horizontal y en vertical.
  return [1.5 + ((c + 0.5) / 9) * 97, 2.3 + ((f + 0.5) / 7) * 95.4];
};
const tope = (v) => Math.min(0, Math.max(100 - 100 * ZOOM, v));   // que nunca se vea fuera del tablero
const encuadre = (n) => {
  const [x, y] = centroPct(n);
  return `translate(${tope(50 - x * ZOOM)}%, ${tope(50 - y * ZOOM)}%) scale(${ZOOM})`;
};

export default function Tablero({ jugadores, turno, resaltada, camara, onVer }) {
  return (
    <div className="tablero-caja">
      <div className={`tablero${camara ? ' siguiendo' : ''}`} style={camara ? { transform: encuadre(camara) } : undefined} aria-label="Tablero de 60 casillas">
        <span className="cinta-esq e1" aria-hidden="true" /><span className="cinta-esq e2" aria-hidden="true" />
        <span className="cinta-esq e3" aria-hidden="true" /><span className="cinta-esq e4" aria-hidden="true" />

        <svg className="camino" viewBox={`0 0 ${AN} ${AL}`} preserveAspectRatio="none" aria-hidden="true">
          <polyline points={LINEA} />
        </svg>

        {camino.map(([fila, col], k) => (
          <Casilla
            key={k + 1}
            n={k + 1}
            jugadores={jugadores}
            turno={turno}
            resaltada={resaltada}
            onVer={onVer}
            estilo={{ gridRow: fila + 1, gridColumn: col + 1 }}
          />
        ))}

        <button
          type="button"
          className="meta"
          style={{ gridRow: `${meta.filas[0] + 1} / ${meta.filas[1] + 2}`, gridColumn: `${meta.cols[0] + 1} / ${meta.cols[1] + 2}` }}
          aria-label="60. Ruleta de la victoria"
          onClick={() => onVer(META)}
        >
          <img className="meme" src={memeDe(META)} alt="" draggable="false" />
          <span className="meta-letrero"><small>60</small>Ruleta de la Victoria</span>
          <Fichas jugadores={jugadores} turno={turno} n={META} />
        </button>

        <svg className="flechas" viewBox={`0 0 ${AN} ${AL}`} preserveAspectRatio="none" aria-hidden="true">
          {FLECHAS.map((f, i) => (
            <path key={i} d="M-9 -7 L9 0 L-9 7 Z" transform={`translate(${f.x.toFixed(1)} ${f.y.toFixed(1)}) rotate(${f.ang.toFixed(0)})`} />
          ))}
        </svg>
      </div>
    </div>
  );
}
