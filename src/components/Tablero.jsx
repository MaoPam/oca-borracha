import { META } from '../data/casillas.js';
import { trazarEspiral } from '../game/reglas.js';
import Casilla from './Casilla.jsx';
import FichaDibujo from './FichaDibujo.jsx';
import { colorDe } from './colores.js';
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

// Fila y columna de una casilla; la 60 es el centro del letrero de la Ruleta.
const celdaDe = (n) => (n >= META ? [meta.filas[0], (meta.cols[0] + meta.cols[1]) / 2] : camino[n - 1]);

// Las fichas viven en su propia capa, encima de la cuadrícula. Cada una es un solo
// elemento: la capa la desliza de casilla en casilla (transition en el CSS) mientras el
// dibujo brinca hacia arriba y abajo. Las dos cosas juntas dibujan el arco.
function CapaFichas({ jugadores, turno }) {
  const porCasilla = {};
  jugadores.forEach((j, i) => { (porCasilla[j.pos] ||= []).push(i); });
  return (
    <div className="capa-fichas" aria-hidden="true">
      {jugadores.map((j, i) => {
        const [f, c] = celdaDe(j.pos);
        const juntas = porCasilla[j.pos], m = juntas.length;
        const col = colorDe(i);
        const activa = i === turno;
        return (
          <span
            key={i}
            className={`viajera${m > 1 ? ' varias' : ''}${activa ? ' activa' : ''}`}
            style={{ '--cx': (c + 0.5) / 9, '--cy': (f + 0.5) / 7, '--k': juntas.indexOf(i) - (m - 1) / 2, '--c': col.c, '--tc': col.tc }}
          >
            {/* key={j.pos}: el dibujo y el polvito se vuelven a montar en cada paso, y repiten su animación. */}
            <span key={`p${j.pos}`} className="polvo-f" />
            <span key={j.pos} className={`ficha f-${j.ficha || 'corcholata'}${activa ? ' activa' : ''}`} title={j.nombre}>
              {activa && <span className="gafete">{j.nombre}</span>}
              <svg viewBox="0 0 40 56"><FichaDibujo tipo={j.ficha} inicial={(j.nombre || '?')[0].toUpperCase()} /></svg>
            </span>
          </span>
        );
      })}
    </div>
  );
}

export default function Tablero({ jugadores, turno, resaltada, onVer }) {
  return (
    <div className="tablero-caja">
      <div className="tablero" aria-label="Tablero de 60 casillas">
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
            conFichas={false}
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
        </button>

        <svg className="flechas" viewBox={`0 0 ${AN} ${AL}`} preserveAspectRatio="none" aria-hidden="true">
          {FLECHAS.map((f, i) => (
            <path key={i} d="M-9 -7 L9 0 L-9 7 Z" transform={`translate(${f.x.toFixed(1)} ${f.y.toFixed(1)}) rotate(${f.ang.toFixed(0)})`} />
          ))}
        </svg>

        <CapaFichas jugadores={jugadores} turno={turno} />
      </div>
    </div>
  );
}
