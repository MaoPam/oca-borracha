import { useRef, useState } from 'react';
import FichaDibujo from './FichaDibujo.jsx';
import { colorDe } from './colores.js';
import { resumen } from '../game/resumen.js';

// Resumen de la peda: podio, premios sacados de las stats y el total del grupo.
// "Guardar imagen" le toma foto a la tarjeta (html-to-image, se descarga solo al usarlo).
// Va en dos pasos: armar la imagen tarda unos segundos y el navegador solo deja abrir "Compartir"
// justo después de un toque, así que primero se arma y luego se toca Compartir o Descargar.

const MEDALLAS = ['🥇', '🥈', '🥉'];
const hoy = () => new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });

function Ficha({ j, i, clase }) {
  return (
    <svg className={clase} viewBox="0 0 40 56" style={{ '--c': colorDe(i).c }} aria-hidden="true">
      <FichaDibujo tipo={j.ficha} inicial={(j.nombre || '?')[0].toUpperCase()} />
    </svg>
  );
}

export default function Resumen({ jugadores, onCerrar }) {
  const tarjeta = useRef(null);
  const [fecha] = useState(hoy);
  const [estado, setEstado] = useState('');
  const [imagen, setImagen] = useState(null);            // { url, archivo } ya armada
  const { podio, premios, total } = resumen(jugadores);
  const top = podio.slice(0, 3);
  // Orden del escalón: 2.º a la izquierda, 1.º al centro, 3.º a la derecha.
  const escalones = top.length === 3 ? [top[1], top[0], top[2]] : top;

  const guardar = async () => {
    setEstado('Armando la imagen…');
    try {
      const { toPng } = await import('html-to-image');
      const url = await toPng(tarjeta.current, { pixelRatio: 2, backgroundColor: '#f4eee2' });
      const archivo = new File([await (await fetch(url)).blob()], 'oca-borracha.png', { type: 'image/png' });
      setImagen({ url, archivo }); setEstado('');
    } catch (e) {
      console.warn('Resumen: no se pudo armar la imagen', e);
      setEstado('No se pudo armar la imagen. Toma captura de pantalla.');
    }
  };
  const sePuedeCompartir = imagen && navigator.canShare?.({ files: [imagen.archivo] });
  const compartir = () => navigator.share({ files: [imagen.archivo], title: 'Oca Borracha' }).catch(e => {
    if (e?.name !== 'AbortError') setEstado('No se pudo compartir: usa Descargar.');
  });

  return (
    <div className="modal-fondo" role="dialog" aria-modal="true" aria-label="Resumen de la peda" onClick={onCerrar}>
      <div className="modal resumen" onClick={e => e.stopPropagation()}>
        <div className="modal-tope"><span className="pill">Se acabó</span><button type="button" className="cerrar" onClick={onCerrar} aria-label="Cerrar">×</button></div>

        <div className="res-tarjeta" ref={tarjeta}>
          <h2 className="res-titulo">Resumen de la peda</h2>
          <p className="res-fecha">Oca Borracha · {fecha}</p>

          <ol className="res-podio" aria-label="Podio">
            {escalones.map(i => {
              const lugar = podio.indexOf(i);
              return (
                <li key={i} className={`escalon l${lugar + 1}`} style={{ '--c': colorDe(i).c }}>
                  <Ficha j={jugadores[i]} i={i} clase="res-ficha" />
                  <b>{jugadores[i].nombre}</b>
                  <span className="res-base"><i>{MEDALLAS[lugar]}</i>{lugar + 1}</span>
                </li>
              );
            })}
          </ol>
          {podio.length > 3 && (
            <p className="res-resto">{podio.slice(3).map((i, k) => `${k + 4}. ${jugadores[i].nombre}`).join(' · ')}</p>
          )}

          {premios.length > 0 && (
            <ul className="res-premios">
              {premios.map(p => (
                <li key={p.id} style={{ '--c': colorDe(p.i).c }}>
                  <span className="res-ico" aria-hidden="true">{p.icono}</span>
                  <span><small>{p.titulo}</small><b>{jugadores[p.i].nombre}</b><em>{p.texto}</em></span>
                </li>
              ))}
            </ul>
          )}

          <p className="res-total">Entre todos: <b>{total.tragos}</b> tragos · <b>{total.shots}</b> shots · <b>{total.aguas}</b> agüitas</p>
        </div>

        {estado && <p className="res-estado" role="status">{estado}</p>}
        {imagen ? (
          <div className="res-lista">
            <img className="res-img" src={imagen.url} alt="El resumen como imagen" />
            <p className="res-estado">¡Lista! En el cel también puedes dejarla apretada para guardarla.</p>
            <div className="eleccion">
              {sePuedeCompartir && <button type="button" className="btn-rosa" onClick={compartir}>Compartir</button>}
              <a className="btn-cromo res-descargar" href={imagen.url} download="oca-borracha.png">Descargar</a>
              <button type="button" className="btn-cromo" onClick={onCerrar}>Cerrar</button>
            </div>
          </div>
        ) : (
          <div className="eleccion">
            <button type="button" className="btn-rosa" onClick={guardar} disabled={estado === 'Armando la imagen…'}>Guardar imagen</button>
            <button type="button" className="btn-cromo" onClick={onCerrar}>Cerrar</button>
          </div>
        )}
      </div>
    </div>
  );
}
