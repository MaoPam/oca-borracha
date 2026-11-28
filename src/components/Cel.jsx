import { useEffect, useRef, useState } from 'react';
import '../App.css';
import Simbolos from './Simbolos.jsx';
import FichaDibujo from './FichaDibujo.jsx';
import Stats from './Stats.jsx';
import { colorDe } from './colores.js';
import { cartaDe } from '../data/comodines.js';
import { CASILLAS, META } from '../data/casillas.js';
import { agruparComodines } from '../game/reglas.js';
import * as nube from '../nube/firebase.js';

// Vista del cel (extra opcional): se abre con el link ?sala=CODIGO.
// El cel NO cambia la partida: la lee de Firebase y manda "pedidos" que la pantalla principal decide si aplica.
// Cada cel recuerda qué jugador es (localStorage), así al recargar no hay que volver a escoger.

const claveYo = (codigo) => `oca-borracha:asiento:${codigo}`;
const leerYo = (codigo) => { try { const v = localStorage.getItem(claveYo(codigo)); return v === null ? null : Number(v); } catch { return null; } };
const guardarYo = (codigo, v) => { try { if (v === null) localStorage.removeItem(claveYo(codigo)); else localStorage.setItem(claveYo(codigo), String(v)); } catch { /* modo privado */ } };
const limpiarCodigo = (t) => (t || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);
// "Todos beben" y "Todos beben." dicen lo mismo: se comparan sin puntos ni mayúsculas para no repetir.
const igual = (a, b) => { const n = (t) => (t || '').toLowerCase().replace(/[^a-z0-9áéíóúñü]+/g, ''); return n(a) === n(b); };

// Momentos del turno en que el botón grande del cel sirve para tirar.
const TIROS = { tirar: 'Tirar dado', otraVez: 'Tirar otra vez', retroceder: '¡Retroceder!', reparte: 'Tirar para repartir' };

function FichaMini({ j, i }) {
  return (
    <svg className="cel-ficha" viewBox="0 0 40 56" style={{ '--c': colorDe(i).c }} aria-hidden="true">
      <FichaDibujo tipo={j.ficha} inicial={(j.nombre || '?')[0].toUpperCase()} />
    </svg>
  );
}

// Para escribir el código a mano (si no llegaron por el QR o la sala se cerró).
function PedirCodigo({ onEntrar, texto }) {
  const [escrito, setEscrito] = useState('');
  return (
    <form className="cel-caja" onSubmit={e => { e.preventDefault(); if (escrito.length === 4) onEntrar(escrito); }}>
      {texto && <p>{texto}</p>}
      <label htmlFor="cel-codigo">Código de la sala</label>
      <input id="cel-codigo" className="cel-input" value={escrito} onChange={e => setEscrito(limpiarCodigo(e.target.value))}
        autoCapitalize="characters" autoComplete="off" placeholder="ABCD" />
      <button type="submit" className="btn-rosa" disabled={escrito.length !== 4}>Entrar</button>
    </form>
  );
}

export default function Cel({ codigo: inicial }) {
  const [codigo, setCodigo] = useState(() => limpiarCodigo(inicial));
  const [estado, setEstado] = useState(undefined);       // undefined: cargando · null: la sala no existe
  const [error, setError] = useState('');
  const [yo, setYo] = useState(() => leerYo(limpiarCodigo(inicial)));
  const [porUsar, setPorUsar] = useState(null);          // comodín armado para el segundo toque
  const [aviso, setAviso] = useState('');                // "Enviado ✓" o el error

  // Escucha la sala: cada vez que la pantalla principal publica, llega el estado nuevo.
  useEffect(() => {
    if (codigo.length !== 4) return;
    let vivo = true, quitar = null;
    nube.escucharSala(codigo, (e) => { if (vivo) setEstado(e); }, () => { if (vivo) setError('Se cortó la conexión con la sala.'); })
      .then(q => { if (vivo) quitar = q; else q(); })
      .catch(() => { if (vivo) setError('No me pude conectar. Revisa tu internet.'); });
    return () => { vivo = false; quitar?.(); };
  }, [codigo]);

  // Cuando te toca tirar, el cel vibra (Android; los iPhone no dejan vibrar desde una página)
  // y el título de la pestaña cambia, por si tienes otra app abierta encima.
  const tocaTirar = Boolean(estado && yo !== null && estado.turno === yo && TIROS[estado.etapa]);
  const yaAviso = useRef(false);
  useEffect(() => {
    if (tocaTirar && !yaAviso.current) navigator.vibrate?.([180, 90, 180]);
    yaAviso.current = tocaTirar;
    document.title = tocaTirar ? '¡Te toca! · Oca Borracha' : 'Oca Borracha';
  }, [tocaTirar]);

  const entrar = (c) => {
    setCodigo(c); setEstado(undefined); setError(''); setYo(leerYo(c));
    window.history.replaceState(null, '', `?sala=${c}`);
  };
  const elegir = (i) => {
    setYo(i); guardarYo(codigo, i);
    nube.tomarAsiento(codigo, i, estado.jugadores[i].nombre).catch(() => setAviso('No pude apartar tu lugar. Revisa tu internet.'));
  };
  const soltar = () => { setYo(null); guardarYo(codigo, null); };

  // Manda un pedido a la pantalla principal y avisa si llegó.
  const mandar = async (tipo, datos, listo) => {
    setAviso('Enviando…');
    try { await nube.pedir(codigo, tipo, datos); setAviso(listo); } catch { setAviso('No se mandó. Revisa tu internet.'); }
    setTimeout(() => setAviso(a => (a === listo ? '' : a)), 2500);
  };

  const encabezado = (
    <header className="cel-tope">
      <b>Oca Borracha</b>
      {codigo.length === 4 && <span>Sala {codigo}</span>}
    </header>
  );
  const envolver = (contenido) => <main className="cel"><Simbolos />{encabezado}{contenido}</main>;

  if (codigo.length !== 4) return envolver(<PedirCodigo onEntrar={entrar} />);
  if (error) return envolver(<div className="cel-caja"><p>{error}</p><button type="button" className="btn-rosa" onClick={() => window.location.reload()}>Reintentar</button></div>);
  if (estado === undefined) return envolver(<div className="cel-caja"><p>Conectando con la sala {codigo}…</p></div>);
  if (estado === null) return envolver(<PedirCodigo onEntrar={entrar} texto={`La sala ${codigo} no existe o ya se cerró. Pide el código nuevo.`} />);

  const { jugadores = [], turno = 0, etapa, nota, casilla: enCasilla, reto, bitacora = [] } = estado;
  const j = yo !== null ? jugadores[yo] : null;

  // Todavía no escoge quién es.
  if (!j) {
    return envolver(
      <div className="cel-caja">
        <p><b>¿Quién eres?</b> Toca tu ficha.</p>
        <ul className="cel-quien">
          {jugadores.map((g, i) => (
            <li key={i}><button type="button" className="btn-cromo" onClick={() => elegir(i)}><FichaMini j={g} i={i} />{g.nombre}</button></li>
          ))}
        </ul>
      </div>,
    );
  }

  const mio = turno === yo;
  const tiro = mio ? TIROS[etapa] : null;
  const casilla = CASILLAS[j.pos];
  // Lo que dice el cel según el momento del turno (cuando no hay botón de tirar).
  const caida = enCasilla && CASILLAS[enCasilla];
  const momento = etapa === 'moviendo' ? (mio ? 'Tu ficha va caminando…' : `${jugadores[turno]?.nombre} va caminando…`)
    : etapa === 'comodin' ? (mio ? 'Escoge en la pantalla qué hacer con tu casilla.' : null)
    : null;
  const grupos = agruparComodines(j.comodines);

  return envolver(
    <>
      <section className={`cel-turno${mio ? ' mio' : ''}`} style={{ '--c': colorDe(yo).c }}>
        <div className="cel-yo">
          <FichaMini j={j} i={yo} />
          <div>
            <b>{j.nombre}</b>
            <small>{j.gano ? `Llegaste en lugar ${j.gano}` : `Casilla ${j.pos}${casilla ? ` · ${casilla.corto}` : ''}`}</small>
          </div>
          <button type="button" className="cel-cambiar" onClick={soltar}>No soy yo</button>
        </div>
        <span className="cel-barra"><i style={{ width: `${((j.pos - 1) / (META - 1)) * 100}%` }} /></span>
        <strong className="cel-quien-tira">{etapa === 'fin' ? 'Se acabó la partida' : mio ? '¡Te toca!' : `Turno de ${jugadores[turno]?.nombre ?? '…'}`}</strong>
        {j.pierde > 0 && <p className="cel-nota">Pierdes tu próximo turno.</p>}
        {caida && (etapa === 'listo' || etapa === 'comodin') && (
          <p className="cel-caida"><b>{mio ? 'Caíste en' : 'Cayó en'} la {enCasilla}: {caida.corto}</b>{!igual(caida.mensaje, caida.corto) && <> · {caida.mensaje}</>}</p>
        )}
        {nota && <p className="cel-nota">{nota}</p>}
        {momento && <p className="cel-nota"><i>{momento}</i></p>}
        {reto && etapa === 'listo' && <p className="cel-caida"><b>Reto: {reto.titulo}</b> · {reto.desc}</p>}
        {tiro && (
          <button type="button" className={`btn-tirar${etapa === 'retroceder' ? ' trampa' : ''}`} disabled={aviso === 'Enviando…'}
            onClick={() => mandar('tirar', {}, 'Tirando en la pantalla…')}>{tiro}</button>
        )}
        {mio && etapa === 'listo' && (
          <button type="button" className="btn-rosa" disabled={aviso === 'Enviando…'}
            onClick={() => mandar('siguiente', {}, 'Turno pasado ✓')}>Ya quedó · Siguiente turno</button>
        )}
      </section>

      <div className="panel-lcd rosa cel-lcd">
        <div className="burbuja-cuerpo">
          <Stats jugadores={jugadores} turno={yo} onRegistrar={(i, accion) => mandar('stat', { jugador: i, accion }, 'Anotado ✓')} />
        </div>
      </div>

      <section className="cel-caja cel-comodines">
        <h2>Tus comodines</h2>
        {grupos.length ? (
          <div className="mano-cartas">
            {grupos.map(({ id, n }) => {
              const c = cartaDe(id);
              if (!c) return null;
              const armada = porUsar === id;
              return (
                <button key={id} type="button" className={`carta-com${armada ? ' armada' : ''}`} style={{ '--c': colorDe(yo).c }} title={c.desc}
                  onClick={() => {
                    if (!armada) { setPorUsar(id); return; }
                    setPorUsar(null); mandar('comodin', { id }, `Usaste ${c.titulo} ✓`);
                  }}>
                  <b>{c.titulo}{n > 1 ? ` ×${n}` : ''}</b>
                  <small>{armada ? '¿Seguro? Toca otra vez para usarlo.' : c.desc}</small>
                </button>
              );
            })}
          </div>
        ) : <p>No tienes comodines. Salen en los retos.</p>}
        <button type="button" className={`pareja-t${j.pareja ? ' si' : ''}`} aria-pressed={!!j.pareja}
          onClick={() => mandar('pareja', { valor: !j.pareja }, j.pareja ? 'Listo: sin pareja' : 'Listo: con pareja 💍')}>
          💍 {j.pareja ? 'Con pareja (ofrenda de paz activa)' : 'Sin pareja'}
        </button>
      </section>

      <section className="cel-caja">
        <h2>Lo que pasa</h2>
        <ul className="cel-log">
          {bitacora.slice(0, 6).map((b, k) => <li key={`${b.t}-${k}`}>{b.texto}</li>)}
        </ul>
      </section>

      {aviso && <p className="cel-aviso" role="status">{aviso}</p>}
    </>,
  );
}
