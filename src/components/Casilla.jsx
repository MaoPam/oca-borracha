import { CASILLAS, COMODINES } from '../data/casillas.js';
import { colorDe } from './colores.js';
import { chueco, memeDe } from './lona.js';
import FichaDibujo from './FichaDibujo.jsx';
import Marco from './Marco.jsx';
import { barrioDe, tipoDe } from '../game/barrios.js';

// Una ficha en el tablero. El dibujo depende de lo que haya escogido el jugador.
function Ficha({ jugador, indice, activa }) {
  const col = colorDe(indice);
  return (
    <span
      className={`ficha f-${jugador.ficha || 'corcholata'}${activa ? ' activa' : ''}`}
      style={{ '--c': col.c, '--tc': col.tc }}
      title={jugador.nombre}
    >
      <svg viewBox="0 0 40 56" aria-hidden="true">
        <FichaDibujo tipo={jugador.ficha} inicial={(jugador.nombre || '?')[0].toUpperCase()} />
      </svg>
    </span>
  );
}

export function Fichas({ jugadores, turno, n }) {
  const aqui = jugadores.map((j, i) => ({ j, i })).filter(({ j }) => j.pos === n);
  if (!aqui.length) return null;
  return (
    <span className={`fichas${aqui.length > 3 ? ' muchas' : ''}`}>
      {aqui.map(({ j, i }) => <Ficha key={`${i}-${j.pos}`} jugador={j} indice={i} activa={i === turno} />)}
    </span>
  );
}

// Una casilla. La usan el tablero en espiral y el carril de celular,
// para que las dos vistas sean literalmente la misma pieza.
export default function Casilla({ n, jugadores, turno, resaltada, onVer, estilo }) {
  const cas = CASILLAS[n];
  const comodin = COMODINES.includes(n);
  const barrio = barrioDe(n);
  const tipo = tipoDe(cas, comodin);
  return (
    <button
      type="button"
      data-n={n}
      className={`casilla b-${barrio} t-${tipo} ${cas.tipo || ''}${comodin ? ' comodin' : ''}${n === resaltada ? ' resaltada' : ''}`}
      style={{ ...estilo, '--r': `${chueco(n)}deg` }}
      aria-label={`${n}. ${cas.mensaje}${comodin ? ' (comodín)' : ''}`}
      onClick={() => onVer(n)}
    >
      <img className="meme" src={memeDe(n)} alt="" loading="lazy" draggable="false" />
      <b>{n}</b>
      {cas.sello && <span className="sello">{cas.sello}</span>}
      <Marco tipo={tipo} />
      <span className="lab">{cas.corto}</span>
      <Fichas jugadores={jugadores} turno={turno} n={n} />
    </button>
  );
}
