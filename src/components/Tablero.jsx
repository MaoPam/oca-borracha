import { META } from '../data/casillas.js';
import { trazarEspiral } from '../game/reglas.js';
import Casilla, { Fichas } from './Casilla.jsx';
import { memeDe } from './lona.js';

const { camino, meta } = trazarEspiral();

const Gema = ({ className }) => <svg className={`gema ${className}`} aria-hidden="true"><use href="#i-gema" /></svg>;

export default function Tablero({ jugadores, turno, resaltada, onVer }) {
  return (
    <div className="tablero-caja">
      {/* El proscenio: cenefa arriba y dos cortinas a los lados. Ademas de ser el teatro,
          se comen el espacio negro que sobraba a izquierda y derecha. */}
      <span className="cenefa" aria-hidden="true" />
      <span className="cortina izq" aria-hidden="true" />
      <span className="cortina der" aria-hidden="true" />
      <svg className="ojo-teatro" viewBox="0 0 40 40" aria-hidden="true"><use href="#i-ojo" /></svg>
      <div className="tablero" aria-label="Tablero de 60 casillas">
        <Gema className="g1" /><Gema className="g2" /><Gema className="g3" /><Gema className="g4" />
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
      </div>
    </div>
  );
}
