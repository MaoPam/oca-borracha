import { CASILLAS } from '../data/casillas.js';
import { colorDe } from './colores.js';
import { chueco, memeDe } from './lona.js';
import FichaDibujo from './FichaDibujo.jsx';
import IconoTipo from './IconoTipo.jsx';
import { tipoDe } from '../game/tipos.js';

// Una ficha en el tablero. El dibujo depende de lo que haya escogido el jugador.
function Ficha({ jugador, indice, activa }) {
  const col = colorDe(indice);
  return (
    <span
      className={`ficha f-${jugador.ficha || 'corcholata'}${activa ? ' activa' : ''}`}
      style={{ '--c': col.c, '--tc': col.tc }}
      title={jugador.nombre}
    >
      {activa && <span className="gafete">{jugador.nombre}</span>}
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
    <span className={`fichas${aqui.length > 1 ? ' varias' : ''}${aqui.length > 3 ? ' muchas' : ''}`}>
      {aqui.map(({ j, i }) => <Ficha key={`${i}-${j.pos}`} jugador={j} indice={i} activa={i === turno} />)}
    </span>
  );
}

const NOMBRE_TIPO = { avanza: 'avanzar', atras: 'retroceder', reto: 'comodín', especial: 'especial' };

// Una casilla: la foto de la lona a sangre, el número en sticker y el título
// en una banda negra abajo. Las normales son todas iguales y van derechas;
// solo las especiales cambian el color del borde y del número, llevan un icono
// y se pegan un poco chuecas. La usan el espiral y el carril de celular.
export default function Casilla({ n, jugadores, turno, resaltada, onVer, estilo, conFichas = true }) {
  const cas = CASILLAS[n];
  const tipo = tipoDe(n, cas);
  const especial = tipo !== 'normal';
  return (
    <button
      type="button"
      data-n={n}
      className={`casilla t-${tipo}${n === resaltada ? ' resaltada' : ''}`}
      style={{ ...estilo, '--r': especial ? `${chueco(n)}deg` : '0deg' }}
      aria-label={`${n}. ${cas.mensaje}${especial ? ` (${NOMBRE_TIPO[tipo]})` : ''}`}
      onClick={() => onVer(n)}
    >
      <img className="meme" src={memeDe(n)} alt="" loading="lazy" draggable="false" />
      <span className="num">{n}</span>
      <span className="banda">
        {especial && <IconoTipo tipo={tipo} />}
        <span className="lab">{cas.corto}</span>
      </span>
      {conFichas && <Fichas jugadores={jugadores} turno={turno} n={n} />}
    </button>
  );
}
