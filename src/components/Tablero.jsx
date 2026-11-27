import { CASILLAS, COMODINES, META } from '../data/casillas.js';
import { trazarEspiral } from '../game/reglas.js';
import { colorDe } from './colores.js';

const { camino, meta } = trazarEspiral();

// Cada casilla va pegada un poquito chueca, como sticker puesto a mano.
// Es determinista: la misma casilla siempre queda igual.
const chueco = (n) => (((n * 37) % 7) - 3) * 0.42;

function Ficha({ jugador, indice, activa }) {
  const col = colorDe(indice);
  return (
    <span className={`ficha${activa ? ' activa' : ''}`} style={{ '--c': col.c, '--tc': col.tc }} title={jugador.nombre}>
      <svg viewBox="0 0 40 37" aria-hidden="true">
        <use href="#i-heart" />
        <text x="20" y="24">{(jugador.nombre || '?')[0].toUpperCase()}</text>
      </svg>
    </span>
  );
}

function Fichas({ jugadores, turno, n }) {
  const aqui = jugadores.map((j, i) => ({ j, i })).filter(({ j }) => j.pos === n);
  if (!aqui.length) return null;
  return (
    <span className={`fichas${aqui.length > 3 ? ' muchas' : ''}`}>
      {aqui.map(({ j, i }) => <Ficha key={`${i}-${j.pos}`} jugador={j} indice={i} activa={i === turno} />)}
    </span>
  );
}

const Gema = ({ className }) => <svg className={`gema ${className}`} aria-hidden="true"><use href="#i-gema" /></svg>;

export default function Tablero({ jugadores, turno, resaltada, onVer }) {
  return (
    <div className="tablero-caja">
      <div className="tablero" aria-label="Tablero de 60 casillas">
        <Gema className="g1" /><Gema className="g2" /><Gema className="g3" /><Gema className="g4" />
        {camino.map(([fila, col], k) => {
          const n = k + 1, cas = CASILLAS[n], comodin = COMODINES.includes(n);
          return (
            <button
              key={n}
              type="button"
              className={`casilla ${cas.tipo || ''}${comodin ? ' comodin' : ''}${n === resaltada ? ' resaltada' : ''}`}
              style={{ gridRow: fila + 1, gridColumn: col + 1, '--r': `${chueco(n)}deg` }}
              aria-label={`${n}. ${cas.mensaje}${comodin ? ' (comodín)' : ''}`}
              onClick={() => onVer(n)}
            >
              <b>{n === 1 ? 'Salida' : n}</b>
              {cas.sello && <span className="sello">{cas.sello}</span>}
              {comodin && <svg className="estrella" aria-hidden="true"><use href="#i-estrella" /></svg>}
              <span className="lab">{n === 1 ? '' : cas.corto}</span>
              <Fichas jugadores={jugadores} turno={turno} n={n} />
            </button>
          );
        })}
        <button
          type="button"
          className="meta"
          style={{ gridRow: `${meta.filas[0] + 1} / ${meta.filas[1] + 2}`, gridColumn: `${meta.cols[0] + 1} / ${meta.cols[1] + 2}` }}
          aria-label="60. Ruleta de la victoria"
          onClick={() => onVer(META)}
        >
          <span className="meta-letrero"><small>60</small>Ruleta de la Victoria</span>
          <Fichas jugadores={jugadores} turno={turno} n={META} />
        </button>
      </div>
    </div>
  );
}
