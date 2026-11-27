import { useEffect, useRef, useState } from 'react';
import FichaDibujo from './FichaDibujo.jsx';

// Digivice: aparatito Y2K que se arrastra a donde no estorbe y recuerda dónde lo dejaste.
// En la pantalla LCD sale la ficha de quien tiene el turno, en pixeles, y qué le toca.
//   Botón A: la acción del turno (tirar, retroceder, siguiente turno…).
//   Botón B o tocar la pantalla: abre y cierra el panel.
const CLAVE = 'oca-borracha:burbuja';
const MARGEN = 10;
const ANCHO = 112, ALTO = 118;   // tamaño del aparato, el mismo que en el CSS
const PESTANAS = [['turno', 'Turno'], ['lugares', 'Lugares'], ['lista', 'Lo que pasa'], ['comodines', 'Comodines'], ['extras', 'Extras']];

const leerPos = () => {
  try {
    const p = JSON.parse(localStorage.getItem(CLAVE) || 'null');
    return p && typeof p.x === 'number' && typeof p.y === 'number' ? p : null;
  } catch { return null; }
};

const topar = (v, max) => Math.min(Math.max(v, MARGEN), Math.max(MARGEN, max));

export default function Burbuja({ color, ficha, nombre, aviso, pista, alerta, girando, accion, abierta, onAbrir, seccion, onSeccion, secciones }) {
  const [pos, setPos] = useState(leerPos);
  const aparatoRef = useRef(null);
  const arrastre = useRef(null);

  // Recordar donde lo dejó el jugador.
  useEffect(() => {
    if (!pos) return;
    try { localStorage.setItem(CLAVE, JSON.stringify(pos)); } catch { /* modo privado */ }
  }, [pos]);

  // Si cambia el tamaño de la ventana, que no se quede fuera de la pantalla.
  useEffect(() => {
    if (!pos) return;
    const alRedimensionar = () => setPos(p => (p ? {
      x: topar(p.x, window.innerWidth - ANCHO - MARGEN),
      y: topar(p.y, window.innerHeight - ALTO - MARGEN),
    } : p));
    window.addEventListener('resize', alRedimensionar);
    return () => window.removeEventListener('resize', alRedimensionar);
  }, [pos]);

  // Escape cierra el panel.
  useEffect(() => {
    if (!abierta) return;
    const alTeclear = (e) => { if (e.key === 'Escape') onAbrir(false); };
    window.addEventListener('keydown', alTeclear);
    return () => window.removeEventListener('keydown', alTeclear);
  }, [abierta, onAbrir]);

  // Lo que hace cada tecla. A sin acción posible (hay que elegir algo) abre el panel.
  const pulsar = (tecla) => {
    if (tecla === 'a') {
      if (accion?.listo) accion.fn();
      else if (!accion) { onSeccion('turno'); onAbrir(true); }
      return;
    }
    onAbrir(!abierta);
  };

  // Al arrastrar, el aparato captura el puntero y el clic ya no llega a la tecla tocada.
  // Por eso se anota qué tecla estaba bajo el dedo al bajar y se ejecuta al soltar.
  const alBajar = (e) => {
    const r = aparatoRef.current.getBoundingClientRect();
    const tecla = e.target.closest('[data-tecla]')?.dataset.tecla || 'pantalla';
    arrastre.current = { dx: e.clientX - r.left, dy: e.clientY - r.top, x0: e.clientX, y0: e.clientY, movio: false, tecla };
    aparatoRef.current.setPointerCapture?.(e.pointerId);
  };

  const alMover = (e) => {
    const a = arrastre.current;
    if (!a) return;
    // Menos de 6px de recorrido todavía cuenta como toque, no como arrastre.
    if (!a.movio && Math.abs(e.clientX - a.x0) + Math.abs(e.clientY - a.y0) < 6) return;
    a.movio = true;
    setPos({
      x: topar(e.clientX - a.dx, window.innerWidth - ANCHO - MARGEN),
      y: topar(e.clientY - a.dy, window.innerHeight - ALTO - MARGEN),
    });
  };

  const alSoltar = (e) => {
    const a = arrastre.current;
    arrastre.current = null;
    aparatoRef.current?.releasePointerCapture?.(e.pointerId);
    if (a && !a.movio) pulsar(a.tecla);
  };

  // Con teclado (Enter o espacio) el clic sí llega a la tecla: detail === 0 lo distingue del dedo.
  const conTeclado = (tecla) => (e) => { if (e.detail === 0) pulsar(tecla); };

  const estilo = pos
    ? { left: `${pos.x}px`, top: `${pos.y}px` }
    : { right: 'max(14px, env(safe-area-inset-right, 0px))', bottom: 'max(14px, env(safe-area-inset-bottom, 0px))' };

  // El panel se abre del lado donde esté el aparato, para no taparlo.
  const aLaDerecha = pos ? pos.x + ANCHO / 2 > window.innerWidth / 2 : true;

  return (
    <>
      <div
        ref={aparatoRef}
        className={`digi${abierta ? ' activa' : ''}${alerta && !abierta ? ' alerta' : ''}${girando ? ' girando' : ''}`}
        style={{ ...estilo, '--c': color }}
        onPointerDown={alBajar}
        onPointerMove={alMover}
        onPointerUp={alSoltar}
        onPointerCancel={alSoltar}
        title="Arrástralo para moverlo · A: jugar · B: abrir el panel"
      >
        <span className="digi-antena" aria-hidden="true" />
        <button
          type="button"
          className="digi-pantalla"
          data-tecla="pantalla"
          aria-expanded={abierta}
          aria-label={abierta ? 'Cerrar el panel de la partida' : `Abrir el panel de la partida. ${aviso}`}
          onClick={conTeclado('pantalla')}
        >
          <svg className="lcd-ficha" viewBox="0 0 40 56" aria-hidden="true"><FichaDibujo tipo={ficha} inicial="" /></svg>
          <span className="lcd-txt"><b>{nombre}</b><i>{girando ? 'TIRANDO' : pista}</i></span>
        </button>
        <span className="digi-teclas">
          <button type="button" className="digi-a" data-tecla="a" aria-label={accion ? accion.texto : 'Elegir en el panel'} onClick={conTeclado('a')}>A</button>
          <button type="button" className="digi-b" data-tecla="b" aria-label="Abrir el panel" onClick={conTeclado('b')}>B</button>
        </span>
      </div>

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
            <svg className="tope-ficha" viewBox="0 0 40 56" style={{ '--c': color }} aria-hidden="true"><FichaDibujo tipo={ficha} inicial={(nombre || '?')[0].toUpperCase()} /></svg>
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
