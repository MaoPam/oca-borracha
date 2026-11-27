import { useEffect, useRef, useState } from 'react';
import FichaDibujo from './FichaDibujo.jsx';

// Burbuja flotante tipo Messenger: se arrastra a donde no estorbe y al tocarla
// se despliega con el turno, los dados, las posiciones y la bitacora.
// Guarda donde la dejaste para que no se te mueva sola entre partidas.
const CLAVE = 'oca-borracha:burbuja';
const MARGEN = 10;

const leerPos = () => {
  try {
    const p = JSON.parse(localStorage.getItem(CLAVE) || 'null');
    return p && typeof p.x === 'number' && typeof p.y === 'number' ? p : null;
  } catch { return null; }
};

const topar = (v, max) => Math.min(Math.max(v, MARGEN), Math.max(MARGEN, max));

export default function Burbuja({ color, inicial, ficha, aviso, alerta, abierta, onAbrir, children }) {
  const setAbierta = (v) => onAbrir(typeof v === 'function' ? v(abierta) : v);
  const [pos, setPos] = useState(leerPos);
  const bolaRef = useRef(null);
  const arrastre = useRef(null);

  // Recordar donde la dejo el jugador.
  useEffect(() => {
    if (!pos) return;
    try { localStorage.setItem(CLAVE, JSON.stringify(pos)); } catch { /* modo privado */ }
  }, [pos]);

  // Si cambia el tamaño de la ventana, que no se quede fuera de la pantalla.
  useEffect(() => {
    if (!pos) return;
    const alRedimensionar = () => setPos(p => (p ? {
      x: topar(p.x, window.innerWidth - 64),
      y: topar(p.y, window.innerHeight - 64),
    } : p));
    window.addEventListener('resize', alRedimensionar);
    return () => window.removeEventListener('resize', alRedimensionar);
  }, [pos]);

  // Cerrar con Escape.
  useEffect(() => {
    if (!abierta) return;
    const alTeclear = (e) => { if (e.key === 'Escape') onAbrir(false); };
    window.addEventListener('keydown', alTeclear);
    return () => window.removeEventListener('keydown', alTeclear);
  }, [abierta, onAbrir]);

  const alBajar = (e) => {
    const r = bolaRef.current.getBoundingClientRect();
    arrastre.current = { dx: e.clientX - r.left, dy: e.clientY - r.top, x0: e.clientX, y0: e.clientY, movio: false };
    bolaRef.current.setPointerCapture?.(e.pointerId);
  };

  const alMover = (e) => {
    const a = arrastre.current;
    if (!a) return;
    // Menos de 6px de recorrido todavia cuenta como toque, no como arrastre.
    if (!a.movio && Math.abs(e.clientX - a.x0) + Math.abs(e.clientY - a.y0) < 6) return;
    a.movio = true;
    const r = bolaRef.current.getBoundingClientRect();
    setPos({
      x: topar(e.clientX - a.dx, window.innerWidth - r.width - MARGEN),
      y: topar(e.clientY - a.dy, window.innerHeight - r.height - MARGEN),
    });
  };

  const alSoltar = (e) => {
    const a = arrastre.current;
    arrastre.current = null;
    bolaRef.current?.releasePointerCapture?.(e.pointerId);
    if (a && !a.movio) setAbierta(v => !v);
  };

  const estiloBola = pos
    ? { left: `${pos.x}px`, top: `${pos.y}px` }
    : { right: 'max(14px, env(safe-area-inset-right, 0px))', bottom: 'max(14px, env(safe-area-inset-bottom, 0px))' };

  // El panel se abre del lado donde este la burbuja, para no taparla.
  const aLaDerecha = pos ? pos.x > window.innerWidth / 2 : true;

  return (
    <>
      <button
        type="button"
        ref={bolaRef}
        className={`burbuja${abierta ? ' activa' : ''}${alerta && !abierta ? ' alerta' : ''}`}
        style={{ ...estiloBola, '--c': color }}
        onPointerDown={alBajar}
        onPointerMove={alMover}
        onPointerUp={alSoltar}
        onPointerCancel={alSoltar}
        aria-expanded={abierta}
        aria-label={abierta ? 'Cerrar el panel de la partida' : `Abrir el panel de la partida. ${aviso}`}
        title="Tócala para abrir · arrástrala para moverla"
      >
        <svg className="burbuja-ficha" viewBox="0 0 40 56" aria-hidden="true"><FichaDibujo tipo={ficha} inicial={inicial} /></svg>
      </button>

      {abierta && (
        <div
          className="burbuja-panel"
          style={aLaDerecha
            ? { right: 'max(10px, env(safe-area-inset-right, 0px))' }
            : { left: 'max(10px, env(safe-area-inset-left, 0px))' }}
          role="dialog"
          aria-label="Panel de la partida"
        >
          <div className="burbuja-tope">
            <svg className="tope-ficha" viewBox="0 0 40 56" aria-hidden="true"><FichaDibujo tipo={ficha} inicial={inicial} /></svg>
            <strong>{aviso}</strong>
            <button type="button" className="cerrar" onClick={() => setAbierta(false)} aria-label="Cerrar">×</button>
          </div>
          <div className="burbuja-cuerpo">{children}</div>
        </div>
      )}
    </>
  );
}
