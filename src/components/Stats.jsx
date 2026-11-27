import { useState } from 'react';
import FichaDibujo from './FichaDibujo.jsx';
import { colorDe } from './colores.js';
import { estadoDe, tipoCorazon, STATS_INICIO } from '../game/stats.js';

// Pestaña Stats del digivice: la pantalla rosa "coqueta" (opción A1).
// Arriba, la tarjeta del jugador elegido (empieza en quien tiene el turno); abajo, todo el grupo.
// Tocar a alguien del grupo enseña su tarjeta. Los botones registran tragos a mano.

// Dibujos de pixeles como listas de renglones: '#' es un pixel prendido.
const MASCARA = ['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...'];
const en = (x, y) => MASCARA[y]?.[x] === '#';
const PIXELES = MASCARA.flatMap((f, y) => [...f].flatMap((ch, x) => (ch === '#' ? [[x, y]] : [])));
const esBorde = (x, y) => !en(x - 1, y) || !en(x + 1, y) || !en(x, y - 1) || !en(x, y + 1);

// Corazón: borde vino, relleno rosa y un pixel de brillo. tipo: lleno, medio o vacio.
export function Corazon({ tipo, clase = '' }) {
  return (
    <svg className={clase} viewBox="0 0 7 6" shapeRendering="crispEdges" aria-hidden="true">
      {PIXELES.map(([x, y]) => {
        const relleno = tipo === 'lleno' || (tipo === 'medio' && x <= 3);
        const c = esBorde(x, y) ? 'b' : relleno ? (x === 1 && y === 1 ? 's' : 'r') : null;
        return c && <rect key={`${x}-${y}`} className={c} x={x} y={y} width="1" height="1" />;
      })}
    </svg>
  );
}

// Tarro de 9x12 pixeles que se llena un renglón por trago y se vacía cada 10.
function Tarro({ tragos }) {
  const nivel = tragos && tragos % 10 === 0 ? 10 : tragos % 10;
  const pix = [];
  for (let y = 0; y < 12; y++) for (let x = 0; x < 9; x++) {
    const pared = x === 0 || x === 8 || y === 11;
    const dentro = !pared && y >= 1;
    const lleno = dentro && 11 - y <= nivel;
    const espuma = lleno && 11 - y === nivel;
    const c = pared ? 'b' : espuma ? 's' : lleno ? 'cheve' : dentro ? 'vidrio' : null;
    if (c) pix.push(<rect key={`${x}-${y}`} className={c} x={x} y={y} width="1" height="1" />);
  }
  return (
    <svg className="st-tarro" viewBox="0 0 11 12" shapeRendering="crispEdges" aria-hidden="true">
      {pix}
      <rect className="b" x="9" y="3" width="2" height="1" /><rect className="b" x="10" y="3" width="1" height="5" /><rect className="b" x="9" y="7" width="2" height="1" />
    </svg>
  );
}

const REMOLINO = ['.####..', '#....#.', '#.##..#', '#.#.#.#', '#..#..#', '.#...#.', '..###..'];
const ARCOIRIS = ['#14b85a', '#14b85a', '#9bd400', '#e0a800', '#ffb000', '#ff7ac0', '#ff2e93', '#ff7a1a', '#e0002b', '#b5179e'];
const BOTONES = [['trago', '+1 trago'], ['shot', 'Shot'], ['fondo', 'Fondo'], ['agua', '💧 Agua']];
// La letra de pixeles no trae mayúsculas con acento: se los quitamos (á -> a) a lo que va en esa letra.
const px = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '');

export default function Stats({ jugadores, turno, onRegistrar }) {
  const [elegido, setElegido] = useState(null);   // null: sigue a quien tiene el turno
  const i = elegido ?? turno;
  const j = jugadores[i];
  if (!j) return null;
  const s = { ...STATS_INICIO, ...j.stats };
  const est = estadoDe(s);
  const m = s.mareo / 100;
  const ko = s.medios === 0;
  const llenos = Math.ceil(s.medios / 2);

  return (
    <section className={`stats-sec${ko ? ' esko' : ''}`} aria-label={`Stats de ${j.nombre}`}>
      {/* --m mueve el tambaleo de la ficha y --mece el bamboleo de toda la tarjeta (con mucho mareo). */}
      <div className="st-tarjeta" style={{ '--mece': s.mareo >= 55 ? ((s.mareo - 45) / 55).toFixed(2) : 0 }}>
        <div className="st-top">
          <span className="st-avatar" style={{ '--c': colorDe(i).c }}>
            <svg className="st-tambal" viewBox="0 0 40 56" style={{ '--m': (m * 0.9 + 0.04).toFixed(2), '--vel': `${(2.2 - m * 1.5).toFixed(2)}s` }} aria-hidden="true">
              <FichaDibujo tipo={j.ficha} inicial={(j.nombre || '?')[0].toUpperCase()} />
            </svg>
          </span>
          <div className="st-nom">
            <b>{px(j.nombre)}</b>
            <span className="st-cara" style={{ '--e': est.color }}>{est.cara} {px(est.nombre)}</span>
          </div>
        </div>
        <p className="st-globo" key={est.dice}>{px(est.dice)}</p>

        <div className="st-et"><span>Higado</span><em>{s.medios / 2}/10</em></div>
        <div className="st-hp">
          {Array.from({ length: 10 }, (_, k) => (
            <Corazon key={k} tipo={tipoCorazon(s.medios, k)} clase={k === llenos - 1 ? 'late' : ''} />
          ))}
        </div>

        <div className="st-fila">
          <Tarro tragos={s.tragos} />
          <div>
            <div className="st-et"><span>Tragos</span></div>
            <div className="st-num"><b key={s.tragos}>{String(s.tragos).padStart(2, '0')}</b><small>Shots {s.shots}<br />Aguas {s.aguas}</small></div>
          </div>
        </div>

        <div className="st-et"><span>Mareo</span><em style={{ color: est.color }}>{px(est.nombre)}</em></div>
        <div className="st-mareo">
          <svg className="st-remolino" viewBox="0 0 7 7" shapeRendering="crispEdges" style={{ '--giro': `${(4 - m * 3.4).toFixed(2)}s` }} aria-hidden="true">
            {REMOLINO.flatMap((f, y) => [...f].map((ch, x) => (ch === '#' ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" /> : null)))}
          </svg>
          <span className="st-arcoiris">
            {ARCOIRIS.map((c, k) => <i key={k} className={s.mareo > k * 10 ? 'on' : ''} style={{ '--k': c }} />)}
          </span>
        </div>

        {ko && <p className="st-ko">K.O. Se acabó el hígado: agüita y descansa un turno.</p>}

        <div className="st-botones" role="group" aria-label={`Registrar a ${j.nombre}`}>
          {BOTONES.map(([accion, txt]) => (
            <button key={accion} type="button" className={`st-bt ${accion}`} onClick={() => onRegistrar(i, accion)}>{txt}</button>
          ))}
        </div>
      </div>

      <h2>Todo el grupo</h2>
      <ul className="st-grupo">
        {jugadores.map((g, k) => {
          const gs = { ...STATS_INICIO, ...g.stats }, ge = estadoDe(gs);
          return (
            <li key={k}>
              <button type="button" className={`st-mini${k === i ? ' puesto' : ''}`} style={{ '--c': colorDe(k).c }} aria-pressed={k === i}
                onClick={() => setElegido(k === turno ? null : k)}>
                <b>{px(g.nombre)} {ge.cara}</b>
                <span className="st-mini-hp">{Array.from({ length: 10 }, (_, h) => <Corazon key={h} tipo={tipoCorazon(gs.medios, h)} />)}</span>
                <span className="st-mini-est" style={{ '--e': ge.color }}>{px(ge.nombre)}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
