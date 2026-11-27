import { useState } from 'react';

const RELLENOS = ['#ff3d9a', '#0b0b0b', '#f4efe4', '#ffe500', '#e0001b', '#19c3ff'];
const TINTA = ['#000', '#f4efe4', '#000', '#000', '#fff', '#000'];
const corta = (t, n = 16) => (t.length > n ? t.slice(0, n - 1) + '…' : t);

function rebanada(i, n, r) {
  const ang = 360 / n, a0 = (i * ang - 90 - ang / 2) * Math.PI / 180, a1 = (i * ang - 90 + ang / 2) * Math.PI / 180;
  const x0 = r * Math.cos(a0), y0 = r * Math.sin(a0), x1 = r * Math.cos(a1), y1 = r * Math.sin(a1);
  return `M0 0 L${x0} ${y0} A${r} ${r} 0 ${ang > 180 ? 1 : 0} 1 ${x1} ${y1} Z`;
}

export default function Ruleta({ premios, onQuitar, onAgregar }) {
  const [rot, setRot] = useState(0);
  const [girando, setGirando] = useState(false);
  const [ganador, setGanador] = useState(null);
  const [nuevo, setNuevo] = useState('');
  const n = premios.length;

  const girar = () => {
    if (n < 2 || girando) return;
    const k = Math.floor(Math.random() * n), ang = 360 / n;
    const destino = ((-k * ang - rot) % 360 + 360) % 360;
    setGanador(null);
    setGirando(true);
    setRot(rot + 360 * 6 + destino);
    setTimeout(() => { setGirando(false); setGanador(premios[k]); }, 4300);
  };

  const agregar = (e) => {
    e.preventDefault();
    if (nuevo.trim()) { onAgregar(nuevo.trim()); setNuevo(''); }
  };

  return (
    <div className="ruleta">
      <div className="rueda-caja">
        <svg className="puntero" viewBox="0 0 30 34" aria-hidden="true"><path d="M15 33L2 6a13 13 0 0 1 26 0z" fill="#ffe500" stroke="#000" strokeWidth="2.5" strokeLinejoin="round" /><circle cx="15" cy="9" r="4" fill="#fff" /></svg>
        <svg className="rueda" viewBox="-110 -110 220 220" style={{ transform: `rotate(${rot}deg)` }} aria-label="Ruleta de premios">
          <circle r="108" fill="#000" />
          {n === 0 && <circle r="100" fill="#2a0f20" />}
          {n === 1 && <circle r="100" fill={RELLENOS[0]} />}
          {n > 1 && premios.map((p, i) => (
            <g key={i}>
              <path d={rebanada(i, n, 100)} fill={RELLENOS[i % RELLENOS.length]} stroke="#000" strokeWidth="1.5" />
              <text transform={`rotate(${i * (360 / n)}) translate(0 -60) rotate(-90)`} fill={TINTA[i % TINTA.length]} className="rueda-txt" textAnchor="middle" dominantBaseline="middle">{corta(p, n > 8 ? 10 : 16)}</text>
            </g>
          ))}
          {n === 1 && <text y="-40" textAnchor="middle" fill="#fff" className="rueda-txt">{corta(premios[0])}</text>}
          {Array.from({ length: 24 }, (_, i) => <circle key={i} cx={104 * Math.cos(i * Math.PI / 12)} cy={104 * Math.sin(i * Math.PI / 12)} r="2.4" fill={i % 2 ? '#f4efe4' : '#ff3d9a'} />)}
          <use href="#i-gema" x="-17" y="-17" width="34" height="34" />
        </svg>
      </div>

      <div className="ruleta-lado">
        <p className="ruleta-res" aria-live="polite">
          {ganador ? <>¡Te toca: <strong>{ganador}</strong>!</> : girando ? 'Girando…' : n < 2 ? 'Agrega al menos 2 premios para girar.' : 'Quien llegue a la 60 gira y cobra.'}
        </p>
        <button type="button" className="btn-rosa" onClick={girar} disabled={n < 2 || girando}>{girando ? 'Girando…' : 'Girar la ruleta'}</button>
        <form onSubmit={agregar} className="fila-form">
          <input className="campo" value={nuevo} onChange={e => setNuevo(e.target.value)} placeholder="Agregar premio extra…" maxLength={40} aria-label="Premio extra" />
          <button type="submit" className="btn-cromo">Agregar</button>
        </form>
        {n > 0 && (
          <ul className="premios">
            {premios.map((p, i) => (
              <li key={i}><span>{p}</span>{!girando && <button type="button" onClick={() => onQuitar(i)} aria-label={`Quitar ${p}`}>×</button>}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
