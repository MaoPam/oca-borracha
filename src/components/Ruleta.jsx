import { useState } from 'react';
import { PREMIOS_SUGERIDOS } from '../data/premios.js';

// Ruleta de la Victoria como tornamesa sonidera: los premios son las pistas de un
// disco. Baja la aguja, el disco gira y frena, y la pantallita dice qué pista tocó.
const RELLENOS = ['#161616', '#262626', '#303030'];
const TINTA = ['#ff2e93', '#ffd400'];
const LECTURA = 50;      // la aguja lee a 50° de las 12, en el sentido del reloj
const T_AGUJA = 650;     // lo que tarda en bajar el brazo
const T_GIRO = 4000;     // lo que gira el disco (igual que la transición en el CSS)
const corta = (t, n = 16) => (t.length > n ? t.slice(0, n - 1) + '…' : t);

function rebanada(i, n, r) {
  const ang = 360 / n, a0 = (i * ang - 90 - ang / 2) * Math.PI / 180, a1 = (i * ang - 90 + ang / 2) * Math.PI / 180;
  const x0 = r * Math.cos(a0), y0 = r * Math.sin(a0), x1 = r * Math.cos(a1), y1 = r * Math.sin(a1);
  return `M0 0 L${x0} ${y0} A${r} ${r} 0 ${ang > 180 ? 1 : 0} 1 ${x1} ${y1} Z`;
}

// Con un número impar de pistas, la última quedaría del mismo tono que la primera; esa va en un tercer gris.
const relleno = (i, n) => (n % 2 === 1 && i === n - 1 ? RELLENOS[2] : RELLENOS[i % 2]);

export default function Ruleta({ premios, onQuitar, onAgregar }) {
  const [rot, setRot] = useState(0);
  const [fase, setFase] = useState('quieto');   // quieto · aguja · girando
  const [pista, setPista] = useState(null);     // índice del premio que tocó
  const [nuevo, setNuevo] = useState('');
  const n = premios.length;
  const girando = fase !== 'quieto';
  const ganador = pista != null ? premios[pista] : null;

  const girar = () => {
    if (n < 2 || girando) return;
    const k = Math.floor(Math.random() * n), ang = 360 / n;
    // Cuánto falta para que el centro de la pista k quede bajo la aguja.
    const destino = ((LECTURA - k * ang - rot) % 360 + 360) % 360;
    setPista(null);
    setFase('aguja');
    setTimeout(() => { setFase('girando'); setRot(rot + 360 * 5 + destino); }, T_AGUJA);
    setTimeout(() => { setFase('quieto'); setPista(k); }, T_AGUJA + T_GIRO);
  };

  const agregar = (e) => {
    e.preventDefault();
    // Cambiar la lista reacomoda el disco: la pista ganadora anterior ya no aplica.
    if (nuevo.trim()) { setPista(null); onAgregar(nuevo.trim()); setNuevo(''); }
  };

  const pantalla = n < 2 ? 'AGREGA AL MENOS 2 PREMIOS'
    : fase === 'aguja' ? '▶ BAJANDO AGUJA'
    : fase === 'girando' ? '▶ GIRANDO…'
    : ganador ? `PISTA ${String(pista + 1).padStart(2, '0')} · ${corta(ganador, 18).toUpperCase()}`
    : `LISTO · ${n} PISTAS`;

  return (
    <div className="ruleta">
      <div className="tornamesa">
        <span className="tornillo t1" /><span className="tornillo t2" /><span className="tornillo t3" /><span className="tornillo t4" />
        <div className="vinil" style={{ transform: `rotate(${rot}deg)` }}>
          <svg viewBox="-110 -110 220 220" aria-label="Disco de premios">
            <circle r="108" fill="#000" />
            {n === 0 && <circle r="100" fill={RELLENOS[0]} />}
            {n === 1 && <circle r="100" fill={RELLENOS[0]} />}
            {n > 1 && premios.map((p, i) => (
              <g key={i}>
                <path d={rebanada(i, n, 100)} fill={relleno(i, n)} stroke="#000" strokeWidth="1.5" className={pista === i ? 'pista-ganadora' : ''} />
                <text transform={`rotate(${i * (360 / n)}) translate(0 -64) rotate(-90)`} fill={TINTA[i % 2]} className={`rueda-txt${pista === i ? ' txt-ganador' : ''}`} textAnchor="middle" dominantBaseline="middle">{corta(p, n > 8 ? 9 : 13)}</text>
              </g>
            ))}
            {n === 1 && <text y="-62" textAnchor="middle" fill={TINTA[0]} className="rueda-txt">{corta(premios[0])}</text>}
            <circle r="34" fill="#ff2e93" stroke="#000" strokeWidth="3" />
            <text className="vinil-etq" y="5" textAnchor="middle">OCA</text>
            <circle r="3.5" fill="#000" />
          </svg>
        </div>
        <span className={`brazo-td${girando || ganador ? ' puesta' : ''}`} />
        <div className="lcd-strip" aria-live="polite">{pantalla}</div>
      </div>

      <div className="ruleta-lado">
        <p className="ruleta-res">
          {ganador ? <>¡Te toca: <strong>{ganador}</strong>!</> : girando ? 'Girando…' : n < 2 ? 'Agrega al menos 2 premios para girar.' : 'Quien llegue a la 60 gira y cobra.'}
        </p>
        <button type="button" className="btn-rosa" onClick={girar} disabled={n < 2 || girando}>{girando ? 'Girando…' : 'Girar la ruleta'}</button>
        <form onSubmit={agregar} className="fila-form">
          <input className="campo" value={nuevo} onChange={e => setNuevo(e.target.value)} placeholder="Agregar premio extra…" maxLength={40} aria-label="Premio extra" />
          <button type="submit" className="btn-cromo">Agregar</button>
        </form>
        {/* Ideas que todavía no están en la ruleta: un toque y entran. */}
        {!girando && PREMIOS_SUGERIDOS.some(s => !premios.includes(s)) && (
          <div className="ideas-premio">
            <span>Ideas:</span>
            {PREMIOS_SUGERIDOS.filter(s => !premios.includes(s)).map(s => (
              <button key={s} type="button" className="idea" onClick={() => { setPista(null); onAgregar(s); }}>+ {s}</button>
            ))}
          </div>
        )}
        {n > 0 && (
          <ul className="premios">
            {premios.map((p, i) => (
              <li key={i}><span>{p}</span>{!girando && <button type="button" onClick={() => { setPista(null); onQuitar(i); }} aria-label={`Quitar ${p}`}>×</button>}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
