import { useEffect, useRef, useState } from 'react';
import FichaDibujo from './FichaDibujo.jsx';

// Perilla giratoria. Se arrastra a donde no estorbe y guarda dónde la dejaste.
// Al tocarla, las acciones salen en abanico hacia el centro de la pantalla:
// Tirar, Lugares y Lista abren el panel en esa sección; Reto y Dados abren su
// herramienta directo. Mientras rueda el dado, la perilla da vueltas.
const CLAVE = 'oca-borracha:burbuja';
const MARGEN = 10;
const TAM = 74;       // diámetro de la perilla, el mismo que en el CSS
const RADIO = 98;     // a qué distancia de la perilla salen las cuñas
const ABRE = 25;      // grados entre una cuña y la siguiente
const CUNAS = [
  { id: 'turno', txt: 'Tirar' },
  { id: 'lugares', txt: 'Lugares' },
  { id: 'reto', txt: 'Reto' },
  { id: 'dados', txt: 'Dados' },
  { id: 'lista', txt: 'Lista' },
];
const PESTANAS = [['turno', 'Turno'], ['lugares', 'Lugares'], ['lista', 'Lo que pasa']];

const leerPos = () => {
  try {
    const p = JSON.parse(localStorage.getItem(CLAVE) || 'null');
    return p && typeof p.x === 'number' && typeof p.y === 'number' ? p : null;
  } catch { return null; }
};

const topar = (v, max) => Math.min(Math.max(v, MARGEN), Math.max(MARGEN, max));

export default function Burbuja({ color, inicial, ficha, aviso, alerta, girando, abierta, onAbrir, seccion, onSeccion, acciones, secciones }) {
  const [pos, setPos] = useState(leerPos);
  const [menu, setMenu] = useState(false);
  const bolaRef = useRef(null);
  const arrastre = useRef(null);

  // Recordar donde la dejó el jugador.
  useEffect(() => {
    if (!pos) return;
    try { localStorage.setItem(CLAVE, JSON.stringify(pos)); } catch { /* modo privado */ }
  }, [pos]);

  // Si cambia el tamaño de la ventana, que no se quede fuera de la pantalla.
  useEffect(() => {
    if (!pos) return;
    const alRedimensionar = () => setPos(p => (p ? {
      x: topar(p.x, window.innerWidth - TAM - MARGEN),
      y: topar(p.y, window.innerHeight - TAM - MARGEN),
    } : p));
    window.addEventListener('resize', alRedimensionar);
    return () => window.removeEventListener('resize', alRedimensionar);
  }, [pos]);

  // Escape cierra el abanico y el panel.
  useEffect(() => {
    if (!abierta && !menu) return;
    const alTeclear = (e) => { if (e.key === 'Escape') { setMenu(false); onAbrir(false); } };
    window.addEventListener('keydown', alTeclear);
    return () => window.removeEventListener('keydown', alTeclear);
  }, [abierta, menu, onAbrir]);

  const alBajar = (e) => {
    const r = bolaRef.current.getBoundingClientRect();
    arrastre.current = { dx: e.clientX - r.left, dy: e.clientY - r.top, x0: e.clientX, y0: e.clientY, movio: false };
    bolaRef.current.setPointerCapture?.(e.pointerId);
  };

  const alMover = (e) => {
    const a = arrastre.current;
    if (!a) return;
    // Menos de 6px de recorrido todavía cuenta como toque, no como arrastre.
    if (!a.movio && Math.abs(e.clientX - a.x0) + Math.abs(e.clientY - a.y0) < 6) return;
    a.movio = true;
    setMenu(false);
    setPos({
      x: topar(e.clientX - a.dx, window.innerWidth - TAM - MARGEN),
      y: topar(e.clientY - a.dy, window.innerHeight - TAM - MARGEN),
    });
  };

  // Un toque: si el panel está abierto lo cierra; si no, abre o cierra el abanico.
  const alSoltar = (e) => {
    const a = arrastre.current;
    arrastre.current = null;
    bolaRef.current?.releasePointerCapture?.(e.pointerId);
    if (!a || a.movio) return;
    if (abierta) { onAbrir(false); setMenu(false); } else setMenu(m => !m);
  };

  const elegir = (id) => {
    setMenu(false);
    if (acciones[id]) { acciones[id](); return; }
    onSeccion(id);
    onAbrir(true);
  };

  const estiloBola = pos
    ? { left: `${pos.x}px`, top: `${pos.y}px` }
    : { right: 'max(14px, env(safe-area-inset-right, 0px))', bottom: 'max(14px, env(safe-area-inset-bottom, 0px))' };

  // El abanico apunta al centro de la pantalla, esté donde esté la perilla.
  const ancho = window.innerWidth, alto = window.innerHeight;
  const cx = pos ? pos.x + TAM / 2 : ancho - 14 - TAM / 2;
  const cy = pos ? pos.y + TAM / 2 : alto - 14 - TAM / 2;
  const base = Math.atan2(alto / 2 - cy, ancho / 2 - cx);
  const enAbanico = (i) => {
    const a = base + ((i - (CUNAS.length - 1) / 2) * ABRE * Math.PI) / 180;
    return { '--dx': `${(RADIO * Math.cos(a)).toFixed(1)}px`, '--dy': `${(RADIO * Math.sin(a)).toFixed(1)}px`, '--i': i };
  };

  // El panel se abre del lado donde esté la perilla, para no taparla.
  const aLaDerecha = cx > ancho / 2;

  return (
    <>
      {menu && <button type="button" className="cunas-velo" aria-label="Cerrar las opciones" onClick={() => setMenu(false)} />}
      <div className={`cunas${menu ? ' abierto' : ''}`} style={{ left: `${cx}px`, top: `${cy}px` }}>
        {CUNAS.map((c, i) => (
          <button
            key={c.id}
            type="button"
            className={`cuna c-${c.id}${c.id === 'turno' && alerta ? ' urge' : ''}`}
            style={enAbanico(i)}
            tabIndex={menu ? 0 : -1}
            aria-hidden={!menu}
            onClick={() => elegir(c.id)}
          >
            {c.txt}
          </button>
        ))}
      </div>

      <button
        type="button"
        ref={bolaRef}
        className={`burbuja${abierta || menu ? ' activa' : ''}${alerta && !abierta && !menu ? ' alerta' : ''}${girando ? ' girando' : ''}`}
        style={{ ...estiloBola, '--c': color }}
        onPointerDown={alBajar}
        onPointerMove={alMover}
        onPointerUp={alSoltar}
        onPointerCancel={alSoltar}
        aria-expanded={abierta || menu}
        aria-label={abierta ? 'Cerrar el panel de la partida' : `Opciones de la partida. ${aviso}`}
        title="Tócala para ver las opciones · arrástrala para moverla"
      >
        <span className="aro" aria-hidden="true" />
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
            <svg className="tope-ficha" viewBox="0 0 40 56" style={{ '--c': color }} aria-hidden="true"><FichaDibujo tipo={ficha} inicial={inicial} /></svg>
            <strong>{aviso}</strong>
            <button type="button" className="cerrar" onClick={() => onAbrir(false)} aria-label="Cerrar">×</button>
          </div>
          <div className="pestanas" role="tablist">
            {PESTANAS.map(([id, txt]) => (
              <button key={id} type="button" role="tab" aria-selected={seccion === id} className={`pestana${seccion === id ? ' puesta' : ''}`} onClick={() => onSeccion(id)}>{txt}</button>
            ))}
          </div>
          <div className="burbuja-cuerpo">{secciones[seccion]}</div>
        </div>
      )}
    </>
  );
}
