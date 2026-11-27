import { useEffect, useRef, useState } from 'react';
import './App.css';
import Simbolos from './components/Simbolos.jsx';
import Tablero from './components/Tablero.jsx';
import Dado3D from './components/Dado3D.jsx';
import Burbuja from './components/Burbuja.jsx';
import Carril from './components/Carril.jsx';
import Carrera from './components/Carrera.jsx';
import { memeDe } from './components/lona.js';
import FichaDibujo from './components/FichaDibujo.jsx';
import { FICHAS, fichaLibre } from './components/fichas.js';
import Ruleta from './components/Ruleta.jsx';
import Pirinola from './components/Pirinola.jsx';
import { CARAS_PIRINOLA, CARA_COMODIN, caraAlAzar } from './data/pirinola.js';
import { colorDe, MAX_JUGADORES } from './components/colores.js';
import { CASILLAS, COMODINES, META, MOVIMIENTOS } from './data/casillas.js';
import { RETOS } from './data/retos.js';
import { pasos, efecto, siguienteTurno, tirarDado, lineasCruzadas, armarBolsa } from './game/reglas.js';
import { CARTAS, PROPORCION_COMODINES, cartaDe } from './data/comodines.js';
import { guardarPartida, cargarPartida, borrarPartida, nuevaJugada } from './game/guardado.js';
import { gritoDe } from './game/gritos.js';
import { EVENTOS } from './data/eventos.js';

const sinMovimiento = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const T_DADO = sinMovimiento ? 150 : 1000;
const T_PASO = sinMovimiento ? 60 : 220;
// Secuencia del turno: ver el dado -> se va la burbuja -> camina el muñeco -> letrero -> vuelve la burbuja.
const T_VER_DADO = sinMovimiento ? 100 : 560;
const T_CIERRE = sinMovimiento ? 0 : 340;
const T_LETRERO = sinMovimiento ? 700 : 3200;
const T_FRANJA = 1700;  // lo que dura la franja de cambio de turno (igual que su animación)
const esperar = (ms) => new Promise(r => setTimeout(r, ms));
// Casillas que piden tirar el dado antes de seguir: en vez de tirarlo solo, sale un letrero.
const AVISO_TIRO = {
  reparte: 'Lo que salga son los tragos que repartes.',
  retroceder: 'Lo que salga son las casillas que retrocedes.',
};

// Bolsa de retos con 1 de cada 3 papelitos de comodín.
const nuevaBolsa = () => armarBolsa(RETOS.length, CARTAS.map(c => c.id), PROPORCION_COMODINES);
// Con lo que arranca cada quien: posición inicial y el comodín Divide dolor.
const alInicio = (j) => ({ ...j, pos: 1, tope: 1, pierde: 0, gano: 0, tiros: 0, comodines: ['divide-dolor'] });

const partidaVacia = () => ({
  fase: 'setup', jugadores: [], turno: 0, etapa: 'tirar', casilla: null, nota: '',
  numDados: 1, dados: [1], giros: 0, premios: [], bolsa: [], bitacora: [], lugares: 0, reto: null,
  lineas: [],   // líneas de la carrera que ya se ganó alguien: cada evento es solo para el primero
});

// En un celular el espiral de 9x7 deja casillas de unos 40px: ilegibles.
// Ahi se muestra el carril y la lona completa queda a un toque.
function useEsCelular() {
  const consulta = '(max-width: 760px)';
  const [es, setEs] = useState(() => typeof window !== 'undefined' && window.matchMedia(consulta).matches);
  useEffect(() => {
    const mq = window.matchMedia(consulta);
    const alCambiar = (e) => setEs(e.matches);
    mq.addEventListener('change', alCambiar);
    return () => mq.removeEventListener('change', alCambiar);
  }, []);
  return es;
}

function TarjetaCasilla({ n, nota, extra }) {
  const cas = CASILLAS[n];
  if (!cas) return null;
  const comodin = COMODINES.includes(n);
  return (
    <div className="tarjeta">
      <span className={`num ${cas.tipo || ''}`}>{n}</span>
      <div>
        <strong>{cas.corto}</strong>
        <p>{cas.mensaje}</p>
        {nota && <small>{nota}</small>}
        {cas.aclara && <div className="aclara"><i>Cómo se juega</i>{cas.aclara}</div>}
        {comodin && <div className="aviso-comodin"><svg aria-hidden="true"><use href="#i-sello" /></svg>Casilla comodín: puedes cambiarla por un reto misterioso.</div>}
        {extra}
      </div>
    </div>
  );
}

export default function App() {
  const [partida, setPartida] = useState(() => {
    const guardada = cargarPartida();
    return guardada?.fase === 'jugando' ? { ...partidaVacia(), guardada } : partidaVacia();
  });
  const pRef = useRef(partida);
  const [ocupado, setOcupado] = useState(false);
  const [vista, setVista] = useState(null);
  const [verLona, setVerLona] = useState(false);
  const [burbuja, setBurbuja] = useState(false);
  const [letrero, setLetrero] = useState(null);
  const [tirando, setTirando] = useState(false);
  const [tiro, setTiro] = useState(null);                // mesa de tiro al centro: { k, dados }
  const [eventos, setEventos] = useState([]);            // eventos de la carrera por mostrar, en fila
  const [seccion, setSeccion] = useState('turno');       // qué pestaña del panel del digivice se ve
  const [franja, setFranja] = useState(null);            // franja de cambio de turno: { i, k }
  const [portadaVista, setPortadaVista] = useState(0);   // hasta qué lugar ya se cerró la portada del ganador
  const [ficha, setFicha] = useState(FICHAS[0].id);
  const [telon, setTelon] = useState(false);
  const esCelular = useEsCelular();
  const [modalReto, setModalReto] = useState(null);
  const [usado, setUsado] = useState(null);              // aviso del comodín que alguien acaba de usar
  const [porUsar, setPorUsar] = useState(null);          // comodín al que ya se le dio "Usar" una vez: falta confirmar
  const [modalDados, setModalDados] = useState(null);
  const [confirmarNueva, setConfirmarNueva] = useState(false);
  const [nombre, setNombre] = useState('');
  const [premio, setPremio] = useState('');
  const ruletaRef = useRef(null);
  const franjaN = useRef(0);   // cuenta las franjas, para que cada una sepa si sigue siendo la última
  const tiroN = useRef(0);     // lo mismo, para la mesa de tiro
  const usadoN = useRef(0);    // y para el aviso de comodín usado

  const actualizar = (fn) => { const sig = fn(pRef.current); pRef.current = sig; setPartida(sig); };
  const cambiarJugador = (i, cambios) => actualizar(p => ({ ...p, jugadores: p.jugadores.map((j, k) => (k === i ? { ...j, ...cambios } : j)) }));
  // Franja de cambio de turno: se muestra un rato y se borra sola, salvo que ya haya otra encima.
  const anunciaTurno = (i) => {
    const k = ++franjaN.current;
    setFranja({ i, k });
    setTimeout(() => setFranja(f => (f?.k === k ? null : f)), sinMovimiento ? 900 : T_FRANJA);
  };
  const anotar = (i, texto, datos) => actualizar(p => ({ ...p, bitacora: [nuevaJugada(p.jugadores[i]?.nombre ?? '', texto, { color: i, ...datos }), ...p.bitacora].slice(0, 200) }));

  useEffect(() => { if (partida.fase === 'jugando') guardarPartida(partida); }, [partida]);

  // ---------- Preparación ----------
  const agregarJugador = (e) => {
    e.preventDefault();
    const nom = nombre.trim();
    if (!nom || partida.jugadores.length >= MAX_JUGADORES) return;
    actualizar(p => ({ ...p, jugadores: [...p.jugadores, { nombre: nom, premio: premio.trim(), ficha, pos: 1, tope: 1, pierde: 0, gano: 0, tiros: 0 }] }));
    setFicha(fichaLibre([...pRef.current.jugadores, { ficha }]));
    setNombre(''); setPremio('');
  };
  const quitarJugador = (i) => actualizar(p => ({ ...p, jugadores: p.jugadores.filter((_, k) => k !== i) }));
  const comenzar = () => {
    if (partida.jugadores.length < 2) return;
    setTelon(true);
    setTimeout(() => setTelon(false), sinMovimiento ? 300 : 2850);
    setTimeout(() => anunciaTurno(0), sinMovimiento ? 320 : 2900);
    actualizar(p => ({
      ...partidaVacia(), fase: 'jugando',
      jugadores: p.jugadores.map(alInicio),
      premios: p.jugadores.map(j => j.premio).filter(Boolean),
      bolsa: nuevaBolsa(), casilla: 1,
      nota: `Todas las fichas en el inicio. Empieza ${p.jugadores[0].nombre}.`,
      bitacora: [nuevaJugada('', '¡Empieza la peda!')],
    }));
  };
  const continuar = () => { const g = partida.guardada; pRef.current = g; setPartida(g); };
  const nuevaPartida = () => {
    borrarPartida();
    const jugadores = pRef.current.jugadores.map(alInicio);
    const p = { ...partidaVacia(), jugadores };
    pRef.current = p; setPartida(p); setConfirmarNueva(false); setVista(null);
  };

  // ---------- Movimiento ----------
  const caminar = async (i, cantidad, direccion) => {
    const { ruta, rebote } = pasos(pRef.current.jugadores[i].pos, cantidad, direccion);
    for (const pos of ruta) {
      cambiarJugador(i, { pos, tope: Math.max(pRef.current.jugadores[i].tope || 1, pos) });
      await esperar(T_PASO);
    }
    return rebote;
  };

  const rodar = async (cuantos) => {
    const dados = Array.from({ length: cuantos }, () => tirarDado());
    const k = ++tiroN.current;
    setBurbuja(true); setSeccion('turno'); setTirando(true);
    setTiro({ k, dados });
    actualizar(p => ({ ...p, dados, giros: p.giros + 1 }));
    await esperar(T_DADO);
    setTirando(false);
    // La mesa se queda un momento enseñando el total y se va sola.
    setTimeout(() => setTiro(t => (t?.k === k ? null : t)), T_VER_DADO);
    return dados;
  };

  // Deja ver el resultado del dado y quita la burbuja de enmedio para que el tablero se vea.
  const despejar = async () => {
    await esperar(T_VER_DADO);
    setBurbuja(false);
    await esperar(T_CIERRE);
  };

  // Al terminar el recorrido: letrero con la casilla donde cayo y de vuelta a la burbuja.
  const anunciar = async () => {
    setLetrero(pRef.current.jugadores[pRef.current.turno].pos);
    await esperar(T_LETRERO);
    setLetrero(null);
    if (!AVISO_TIRO[pRef.current.etapa]) { setSeccion('turno'); setBurbuja(true); }
  };

  // Eventos de la carrera: se los lleva solo el primero que llega a la línea o la rebasa.
  // Las líneas ganadas se guardan en la partida (no en cada jugador) y ya no salen para nadie más.
  const revisaLineas = (i) => {
    const j = pRef.current.jugadores[i], tomadas = pRef.current.lineas || [];
    const nuevas = lineasCruzadas(j.tope || j.pos, tomadas, EVENTOS.map(e => e.linea));
    if (!nuevas.length) return;
    actualizar(p => ({ ...p, lineas: [...tomadas, ...nuevas] }));
    const evs = nuevas.map(l => ({ ...EVENTOS.find(e => e.linea === l), i, nombre: j.nombre }));
    evs.forEach(e => anotar(i, `${j.nombre} cruza la línea ${e.linea}: ${e.titulo}.`));
    setEventos(cola => [...cola, ...evs]);
  };
  const cerrarEvento = (ev) => {
    setEventos(cola => cola.slice(1));
    if (ev.comodin) darComodin(ev.i, ev.comodin);
    if (ev.accion === 'reto') abrirReto(false);
  };

  // ---------- Comodines ----------
  // Cada jugador guarda los ids de sus cartas en jugador.comodines (puede tener repetidas).
  const darComodin = (i, id) => {
    const j = pRef.current.jugadores[i], carta = cartaDe(id);
    if (!j || !carta) return;
    cambiarJugador(i, { comodines: [...(j.comodines || []), id] });
    anotar(i, `${j.nombre} se guarda el comodín ${carta.titulo}.`);
  };
  // Usar pide dos toques: el primero arma el botón ("¿Seguro?") y el segundo lo gasta.
  const usarComodin = (i, k) => {
    const clave = `${i}-${k}`;
    if (porUsar !== clave) { setPorUsar(clave); return; }
    setPorUsar(null);
    const j = pRef.current.jugadores[i], carta = cartaDe(j.comodines[k]);
    cambiarJugador(i, { comodines: j.comodines.filter((_, x) => x !== k) });
    anotar(i, `${j.nombre} usa ${carta?.titulo ?? 'un comodín'}: ${carta?.desc ?? ''}`);
    const n = ++usadoN.current;
    setUsado({ i, carta, n });
    setTimeout(() => setUsado(u => (u?.n === n ? null : u)), sinMovimiento ? 1500 : 2600);
  };

  const terminarEn = (etapa, nota, cambios = {}) => actualizar(p => ({ ...p, etapa, nota, casilla: p.jugadores[p.turno].pos, ...cambios }));

  // Resuelve la casilla donde quedó la ficha. Las que mueven fichas encadenan la siguiente.
  const resolver = async (i, rastro, previa = '', prof = 0) => {
    const j = pRef.current.jugadores[i], n = j.pos, cas = CASILLAS[n], e = efecto(n);
    const log = (texto) => anotar(i, `${j.nombre} ${[...rastro, texto].join(' → ')}`, { casilla: n });
    const conPrevia = (t) => [previa, t].filter(Boolean).join(' ');

    if (e.tipo === 'meta') {
      const lugar = pRef.current.lugares + 1;
      cambiarJugador(i, { gano: lugar });
      actualizar(p => ({ ...p, lugares: lugar }));
      log(`60: ¡llega a la Ruleta de la Victoria! (lugar ${lugar})`);
      return terminarEn('ganador', conPrevia(`¡${j.nombre} llegó a la 60!`));
    }
    if (prof > 3) { log(`${n}: ${cas.corto}`); return terminarEn('listo', previa); }
    switch (e.tipo) {
      case 'reparte':
        log(`${n}: reparte tragos`);
        return terminarEn('reparte', conPrevia('Tira el dado: lo que salga son los tragos que repartes.'));
      case 'otraVez':
        log(`${n}: tira de nuevo y bebe`);
        return terminarEn('otraVez', conPrevia('Bebe y vuelve a tirar.'));
      case 'mover': {
        const accion = e.direccion > 0 ? `Avanza ${e.cantidad}` : `Retrocede ${e.cantidad}`;
        await esperar(sinMovimiento ? 0 : 300);
        await caminar(i, e.cantidad, e.direccion);
        return resolver(i, [...rastro, `${n}: ${accion.toLowerCase()}`], conPrevia(`${accion} desde la ${n}.`), prof + 1);
      }
      case 'pierdeTurno':
        cambiarJugador(i, { pierde: 1 });
        log(`${n}: Detente jochis, pierde un turno`);
        return terminarEn('listo', conPrevia('Pierdes tu siguiente turno.'));
      case 'retrocedeDado':
        log(`${n}: retrocede lo que salga en el dado`);
        return terminarEn('retroceder', conPrevia('Tira el dado para ver cuánto retrocedes.'));
      case 'comodin':
        log(`${n}: ${cas.corto} (comodín)`);
        return terminarEn('comodin', previa);
      default:
        log(`${n}: ${cas.corto}`);
        return terminarEn('listo', previa);
    }
  };

  const tirar = async () => {
    const p = pRef.current;
    if (ocupado || !['tirar', 'otraVez'].includes(p.etapa)) return;
    setOcupado(true); setVista(null);
    const i = p.turno;
    actualizar(q => ({ ...q, etapa: 'moviendo', nota: '' }));
    const dados = await rodar(p.numDados);
    const total = dados.reduce((a, b) => a + b, 0);
    cambiarJugador(i, { tiros: pRef.current.jugadores[i].tiros + 1 });
    await despejar();
    const rebote = await caminar(i, total, 1);
    const rastro = [`saca ${dados.join(' + ')}${rebote ? ' y rebota' : ''}`];
    await resolver(i, rastro, rebote ? 'Te pasaste de la 60 y rebotaste.' : '');
    await anunciar();
    revisaLineas(i);
    setOcupado(false);
  };

  // El tiro de la casilla 3: lo pide el letrero y se hace en la mesa de tiro.
  const tirarReparte = async () => {
    if (ocupado || pRef.current.etapa !== 'reparte') return;
    setOcupado(true);
    const i = pRef.current.turno, j = pRef.current.jugadores[i];
    const [w] = await rodar(1);
    anotar(i, `${j.nombre} reparte ${w} trago${w > 1 ? 's' : ''}.`, { casilla: j.pos, dados: [w] });
    terminarEn('listo', `Salió ${w}: reparte ${w} trago${w > 1 ? 's' : ''}.`);
    setOcupado(false);
  };

  const retroceder = async () => {
    if (ocupado || pRef.current.etapa !== 'retroceder') return;
    setOcupado(true);
    const i = pRef.current.turno;
    actualizar(q => ({ ...q, etapa: 'moviendo' }));
    const [w] = await rodar(1);
    await despejar();
    await caminar(i, w, -1);
    await resolver(i, [`retrocede ${w}`], `Salió ${w}: retrocedes ${w}.`, 1);
    await anunciar();
    revisaLineas(i);
    setOcupado(false);
  };

  const pasarTurno = () => {
    const p = pRef.current;
    const quedan = p.jugadores.filter(j => !j.gano).length;
    if (quedan <= 1) { actualizar(q => ({ ...q, etapa: 'fin' })); return; }
    const { indice, jugadores, avisos } = siguienteTurno(p.jugadores, p.turno);
    actualizar(q => ({ ...q, jugadores, turno: indice, etapa: 'tirar', nota: `Ahora tira ${jugadores[indice].nombre}.` }));
    avisos.forEach(a => anotar(p.turno, a));
    setVista(null);
    anunciaTurno(indice);
  };

  // ---------- Retos ----------
  // Saca un papelito de la bolsa: o un reto ({ reto }) o un comodín ({ comodin }).
  const sacarPapelito = () => {
    let bolsa = [...pRef.current.bolsa];
    if (!bolsa.length) bolsa = nuevaBolsa();
    const x = bolsa.pop();
    actualizar(p => ({ ...p, bolsa }));
    const carta = typeof x === 'string' && cartaDe(x);
    return carta ? { comodin: carta } : { reto: RETOS[x] ?? RETOS[0] };
  };
  // El papelito se saca antes de girar: así la pirinola ya sabe dónde caer
  // (en un castigo si es reto, en "★ Comodín" si es comodín).
  const abrirReto = (desdeComodin) => {
    const papel = sacarPapelito();
    const cara = papel.comodin ? CARA_COMODIN : caraAlAzar();
    setModalReto({ girando: true, desdeComodin, cara, ...papel });
  };
  const alCaerPirinola = () => setModalReto(m => (m ? { ...m, girando: false } : m));
  // seRaja: no hizo el reto y se toma lo que marcó la pirinola.
  const cerrarReto = (seRaja = false) => {
    const m = modalReto;
    setModalReto(null);
    if (m?.comodin) {
      darComodin(pRef.current.turno, m.comodin.id);
      if (m.desdeComodin && pRef.current.etapa === 'comodin') terminarEn('listo', `Sacaste el comodín ${m.comodin.titulo}: te salvas de la casilla.`);
      return;
    }
    if (!m?.reto) return;
    const raja = seRaja ? ` Se raja y toma: ${m.cara}.` : '';
    anotar(pRef.current.turno, `${m.desdeComodin ? 'Cambia la casilla por el reto' : 'Reto manual'}: ${m.reto.titulo}.${raja}`);
    if (m.desdeComodin && pRef.current.etapa === 'comodin') {
      terminarEn('listo', seRaja ? `Te rajaste del reto ${m.reto.titulo}: te toca ${m.cara}.` : `Reto misterioso: ${m.reto.titulo}.`, { reto: seRaja ? null : m.reto });
    }
  };
  const hacerLona = () => terminarEn('listo', 'Haces lo que dice la lona.');
  const tirarParaReto = async () => {
    const m = modalReto;
    if (!m?.reto?.dados || m.tirando) return;
    const dados = Array.from({ length: m.reto.dados }, () => tirarDado());
    const k = ++tiroN.current;
    setModalReto(x => ({ ...x, tirando: true }));
    setTiro({ k, dados });
    await esperar(T_DADO);
    setTimeout(() => setTiro(t => (t?.k === k ? null : t)), T_VER_DADO);
    setModalReto(x => (x ? { ...x, tirando: false, tiro: dados } : x));
    anotar(pRef.current.turno, `Reto ${m.reto.titulo}: salió ${dados.join(' y ')}.`);
  };

  // ---------- Dados extra ----------
  const tirarExtra = () => {
    if (!modalDados || modalDados.girando) return;
    const vals = Array.from({ length: modalDados.cuantos }, () => tirarDado());
    setModalDados(m => ({ ...m, vals, giros: m.giros + 1, girando: true, res: null }));
    setTimeout(() => {
      const suma = vals.reduce((a, b) => a + b, 0), mult = vals.reduce((a, b) => a * b, 1);
      setModalDados(m => ({ ...m, girando: false, res: { suma, mult: vals.length > 1 ? mult : null, par: suma % 2 === 0 } }));
    }, T_DADO);
  };

  const irARuleta = () => ruletaRef.current?.scrollIntoView({ behavior: sinMovimiento ? 'auto' : 'smooth', block: 'start' });

  // ======================= PANTALLAS =======================
  const encabezado = (
    <header className={`top${partida.fase === 'jugando' ? ' compacto' : ''}`}>
      <div>
        <h1>Oca Borracha</h1>
        <p className="lema"><span className="cinta">Hazifest Vol. 1</span>El juego más culero del momento</p>
      </div>
      {partida.fase === 'jugando' && <Carrera jugadores={partida.jugadores} turno={partida.turno} />}
      {partida.fase === 'jugando' && (
        <div className="ctl">
          <div className="dados-sel" role="group" aria-label="Cuántos dados">
            {[1, 2].map(n => (
              <button key={n} type="button" className="btn-cromo" aria-pressed={partida.numDados === n} onClick={() => actualizar(p => ({ ...p, numDados: n }))}>{n} dado{n > 1 ? 's' : ''}</button>
            ))}
          </div>
          {confirmarNueva ? (
            <span className="confirma">¿Borrar esta partida?
              <button type="button" className="btn-rosa chico" onClick={nuevaPartida}>Sí, nueva</button>
              <button type="button" className="btn-cromo" onClick={() => setConfirmarNueva(false)}>No</button>
            </span>
          ) : <button type="button" className="btn-cromo" onClick={() => setConfirmarNueva(true)}>Nueva partida</button>}
        </div>
      )}
    </header>
  );

  if (partida.fase === 'setup') {
    const g = partida.guardada;
    return (
      <>
        <Simbolos />
        {encabezado}
        <main className="setup">
          {g && (
            <section className="tarjeta-sticker continuar">
              <h2>Hay una partida a medias</h2>
              <p>{g.jugadores.length} jugadores. Iba en el turno de <strong>{g.jugadores[g.turno]?.nombre}</strong>.</p>
              <button type="button" className="btn-rosa" onClick={continuar}>Continuar la partida</button>
            </section>
          )}
          <section className="tarjeta-sticker">
            <h2>Registrar jugadores</h2>
            <p className="ayuda">Cada quien pone el premio que quiere ganar. Esos premios van a la Ruleta de la Victoria.</p>
            <form onSubmit={agregarJugador} className="registro">
              <label>Nombre<input className="campo" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre del compa…" maxLength={14} autoFocus /></label>
              <label>Premio si llega a la 60<input className="campo" value={premio} onChange={e => setPremio(e.target.value)} placeholder="Ej. que le inviten una chela" maxLength={40} /></label>
              <button type="submit" className="btn-cromo" disabled={!nombre.trim() || partida.jugadores.length >= MAX_JUGADORES}>Agregar</button>
              <fieldset className="pick-ficha">
                <legend>Con qué ficha juegas</legend>
                {FICHAS.map((f, k) => (
                  <button
                    key={f.id}
                    type="button"
                    className={`pick${ficha === f.id ? ' puesta' : ''}`}
                    style={{ '--c': colorDe(partida.jugadores.length).c, '--r': `${(k % 3) * 2.6 - 2.6}deg` }}
                    aria-pressed={ficha === f.id}
                    onClick={() => setFicha(f.id)}
                  >
                    <svg viewBox="0 0 40 56" aria-hidden="true"><FichaDibujo tipo={f.id} inicial="" /></svg>
                    <span>{f.nombre}</span>
                  </button>
                ))}
              </fieldset>
            </form>
            {partida.jugadores.length > 0 && (
              <ul className="registrados">
                {partida.jugadores.map((j, i) => (
                  <li key={i} style={{ '--c': colorDe(i).c }}>
                    <svg className="ficha-mini" viewBox="0 0 40 56" aria-hidden="true"><FichaDibujo tipo={j.ficha} inicial={(j.nombre || '?')[0].toUpperCase()} /></svg>
                    <span><strong>{j.nombre}</strong>{j.premio && <small>Premio: {j.premio}</small>}</span>
                    <button type="button" onClick={() => quitarJugador(i)} aria-label={`Quitar a ${j.nombre}`}>×</button>
                  </li>
                ))}
              </ul>
            )}
            <button type="button" className="btn-rosa grande" onClick={comenzar} disabled={partida.jugadores.length < 2}>
              {partida.jugadores.length < 2 ? `Faltan ${2 - partida.jugadores.length} jugador${partida.jugadores.length === 1 ? '' : 'es'}` : '¡Comenzar la peda!'}
            </button>
          </section>
        </main>
      </>
    );
  }

  const { jugadores, turno, etapa } = partida;
  const actual = jugadores[turno];
  const enVista = vista ?? partida.casilla;
  const ganadorActual = etapa === 'ganador' ? actual : null;
  const textoAccion = {
    tirar: `Tirar ${partida.numDados > 1 ? 'dados' : 'dado'}`,
    otraVez: 'Tirar otra vez',
    retroceder: '¡Retroceder!',
    moviendo: 'Tirando…',
    reparte: 'Tirar para repartir',
  }[etapa];
  const alTirar = () => (etapa === 'retroceder' ? retroceder() : etapa === 'reparte' ? tirarReparte() : tirar());
  // Lo que dice la pantallita del digivice y lo que hace su botón A en cada momento del turno.
  // Sin acentos: la tipografía de pixeles no los trae todos.
  const PISTAS = { tirar: 'TIRA!', otraVez: 'OTRA VEZ', retroceder: 'TIRA DADO', reparte: 'TIRA DADO', moviendo: 'TIRANDO', comodin: 'ELIGE', listo: 'SIGUE', ganador: 'GANO!', fin: 'FIN' };
  const accion = textoAccion ? { texto: textoAccion, fn: alTirar, listo: etapa !== 'moviendo' && !ocupado }
    : etapa === 'listo' ? { texto: 'Siguiente turno', fn: pasarTurno, listo: true }
    : etapa === 'fin' ? { texto: 'Jugar otra', fn: nuevaPartida, listo: true }
    : null;
  const grito = letrero ? gritoDe(letrero, CASILLAS[letrero]) : null;
  const verPortada = ganadorActual && portadaVista !== partida.lugares;

  return (
    <>
      <Simbolos />
      {telon && (
        <div className="telon-abre" aria-hidden="true">
          <span className="cajon-t" />
          <div className="marco-t">
            <div className="persiana-t"><span className="grafiti-t">Oca<br />Borracha</span><span className="tag-t">Hazifest vol. 1 · ¡que empiece la peda!</span></div>
          </div>
          <span className="candado-t"><i className="arco-t" /><i className="cuerpo-t" /></span>
        </div>
      )}
      {encabezado}
      <main className={`app${etapa === 'moviendo' ? ' rodando' : ''}${etapa === 'ganador' || etapa === 'fin' ? ' fiesta' : ''}`}>
        <div className="col-tablero">
          {esCelular && (
            <button type="button" className="btn-cromo cambia-vista" onClick={() => setVerLona(v => !v)}>
              {verLona ? 'Volver al carril' : 'Ver la lona completa'}
            </button>
          )}
          {esCelular && !verLona
            ? <Carril jugadores={jugadores} turno={turno} resaltada={enVista} onVer={(n) => setVista(n === vista ? null : n)} />
            : <Tablero jugadores={jugadores} turno={turno} resaltada={enVista} onVer={(n) => setVista(n === vista ? null : n)} />}
        </div>

        <Burbuja
          color={colorDe(turno).c}
          nombre={actual.nombre}
          ficha={actual.ficha}
          aviso={etapa === 'fin' ? 'Se acabó la partida' : `Turno de ${actual.nombre}`}
          alerta={etapa === 'tirar' || etapa === 'otraVez' || etapa === 'retroceder' || etapa === 'reparte' || etapa === 'comodin'}
          girando={tirando}
          abierta={burbuja}
          onAbrir={setBurbuja}
          seccion={seccion}
          onSeccion={setSeccion}
          pista={PISTAS[etapa] || ''}
          accion={accion}
          secciones={{
            turno: (
          <section className="tarjeta-sticker turno" aria-label="Turno">
            <div className="dados quietos">{partida.dados.map((v, k) => <Dado3D key={k} valor={v} giros={partida.giros} tam={partida.dados.length > 1 ? 66 : 84} conResultado={false} />)}</div>
            {textoAccion && <button type="button" className={`btn-tirar${etapa === 'retroceder' ? ' trampa' : ''}`} onClick={alTirar} disabled={etapa === 'moviendo' || ocupado}>{textoAccion}</button>}
            {(etapa === 'listo') && <button type="button" className="btn-tirar" onClick={pasarTurno}>Siguiente turno</button>}
            {etapa === 'fin' && <button type="button" className="btn-tirar" onClick={nuevaPartida}>Jugar otra</button>}

            {vista && vista !== partida.casilla ? (
              <div className="vista">
                <TarjetaCasilla n={vista} />
                <button type="button" className="link" onClick={() => setVista(null)}>Solo estabas leyendo. Volver al turno</button>
              </div>
            ) : partida.casilla && (
              <TarjetaCasilla
                n={partida.casilla}
                nota={partida.nota}
                extra={etapa === 'comodin' && (
                  <div className="eleccion">
                    <button type="button" className="btn-cromo" onClick={hacerLona}>Hacer el de la lona</button>
                    <button type="button" className="btn-dorado" onClick={() => abrirReto(true)}>¡Reto misterioso!</button>
                  </div>
                )}
              />
            )}
            {partida.reto && etapa === 'listo' && (
              <div className="reto-actual"><i>Reto misterioso</i><strong>{partida.reto.titulo}</strong>{partida.reto.desc}</div>
            )}
            {ganadorActual && (
              <div className="ganador">
                <strong>¡{ganadorActual.nombre} llegó a la 60!</strong>
                {ganadorActual.premio && <span>Su premio: {ganadorActual.premio}</span>}
                <div className="eleccion">
                  <button type="button" className="btn-dorado" onClick={irARuleta}>Girar la ruleta</button>
                  <button type="button" className="btn-cromo" onClick={pasarTurno}>Seguir jugando</button>
                </div>
              </div>
            )}
          </section>
            ),
            lugares: (
          <section className="tarjeta-sticker">
            <h2>Posiciones</h2>
            <ul className="jugadores">
              {jugadores.map((j, i) => ({ j, i })).sort((a, b) => (a.j.gano || 99) - (b.j.gano || 99) || b.j.pos - a.j.pos).map(({ j, i }) => (
                <li key={i} className={i === turno && etapa !== 'fin' ? 'ahora' : ''} style={{ '--c': colorDe(i).c }}>
                  <span className="chip" />
                  <strong>{j.nombre}</strong>
                  <em>{j.gano ? `Lugar ${j.gano}` : j.pos === 1 ? 'Inicio' : `Casilla ${j.pos}`}</em>
                  {j.pierde > 0 && <span className="etiqueta">Pierde su turno</span>}
                  <span className="barra"><i style={{ width: `${((j.pos - 1) / (META - 1)) * 100}%` }} /></span>
                </li>
              ))}
            </ul>
          </section>
            ),
            lista: (
          <section className="tarjeta-sticker">
            <details open><summary>Lo que va pasando</summary>
              <ul className="bitacora">
                {partida.bitacora.slice(0, 60).map((b, k) => (
                  <li key={`${b.t}-${k}`}><span className="chip mini" style={{ '--c': b.color != null ? colorDe(b.color).c : '#999' }} />{b.texto}</li>
                ))}
              </ul>
            </details>
          </section>
            ),
            comodines: (
          <section className="tarjeta-sticker comodines">
            <h2>Comodines</h2>
            <p className="ayuda">Se usan cuando quieras, aunque no sea tu turno. Toca dos veces para gastarlo.</p>
            <ul className="mano">
              {jugadores.map((j, i) => (
                <li key={i} style={{ '--c': colorDe(i).c }}>
                  <span className="mano-quien"><span className="chip" /><strong>{j.nombre}</strong></span>
                  {(j.comodines || []).length ? (
                    <span className="mano-cartas">
                      {j.comodines.map((id, k) => {
                        const c = cartaDe(id);
                        return c && (
                          <button key={`${id}-${k}`} type="button" className={`carta-com${porUsar === `${i}-${k}` ? ' armada' : ''}`} onClick={() => usarComodin(i, k)} title={c.desc}>
                            <b>{c.titulo}</b><small>{porUsar === `${i}-${k}` ? '¿Seguro? Toca otra vez' : c.desc}</small>
                          </button>
                        );
                      })}
                    </span>
                  ) : <em>Sin comodines</em>}
                </li>
              ))}
            </ul>
          </section>
            ),
            extras: (
          <section className="tarjeta-sticker extras">
            <h2>Extras</h2>
            <button type="button" className="btn-cromo extra" onClick={() => abrirReto(false)}>
              <strong>Reto manual</strong><span>¿Alguien rompió una regla?</span>
            </button>
            <button type="button" className="btn-cromo extra" onClick={() => setModalDados({ cuantos: 1, vals: [1], giros: 0, girando: false, res: null })}>
              <strong>Dados extra</strong><span>Para los retos que usan dados</span>
            </button>
          </section>
            ),
          }}
        />

        {/* giros={1}: en la mesa el dado siempre da las mismas vueltas, no unas por cada tirada de la partida. */}
        {tiro && (
          <div className="mesa-tiro" key={tiro.k} aria-live="polite">
            <div className="dados-tiro">
              {tiro.dados.map((v, k) => <Dado3D key={k} valor={v} giros={1} girando tam={tiro.dados.length > 1 ? 96 : 116} conResultado={false} />)}
            </div>
            <span className="total-pop">¡{tiro.dados.reduce((a, b) => a + b, 0)}!</span>
          </div>
        )}

        {letrero && (
          <div className="aterrizaje">
            <span className={`grito g-${grito.clase}`}>{grito.texto}</span>
            <button type="button" className="letrero" onClick={() => { setLetrero(null); setBurbuja(true); }}>
              <img className="letrero-meme" src={memeDe(letrero)} alt="" />
              <span className="letrero-caja">
                <span className="letrero-num">{letrero}</span>
                <strong>{CASILLAS[letrero].corto}</strong>
                <span className="letrero-txt">{CASILLAS[letrero].mensaje}</span>
                {CASILLAS[letrero].aclara && <small>{CASILLAS[letrero].aclara}</small>}
              </span>
            </button>
          </div>
        )}

        {AVISO_TIRO[etapa] && !letrero && !burbuja && !ocupado && (
          <div className="aviso-tiro" role="status">
            <span className="aviso-dado" aria-hidden="true">{[0, 2, 4, 6, 8].map(k => <i key={k} style={{ gridArea: `${Math.floor(k / 3) + 1} / ${(k % 3) + 1}` }} />)}</span>
            <span className="aviso-txt"><b>¡Tira el dado!</b>{AVISO_TIRO[etapa]}</span>
            <button type="button" className="btn-tirar" onClick={alTirar}>Tirar</button>
          </div>
        )}

        {usado && jugadores[usado.i] && (
          <div className="usado" key={usado.n} role="status" style={{ '--c': colorDe(usado.i).c }}>
            <small>{jugadores[usado.i].nombre} usa</small>
            <b>{usado.carta?.titulo}</b>
            <span>{usado.carta?.desc}</span>
          </div>
        )}

        {franja && jugadores[franja.i] && (
          <div className="franja-turno" key={franja.k} aria-live="polite">
            <div className="franja-in">
              <svg className="franja-ficha" viewBox="0 0 40 56" style={{ '--c': colorDe(franja.i).c }} aria-hidden="true">
                <FichaDibujo tipo={jugadores[franja.i].ficha} inicial={(jugadores[franja.i].nombre || '?')[0].toUpperCase()} />
              </svg>
              <span><b>Turno de {jugadores[franja.i].nombre}</b><small>tira el dado</small></span>
            </div>
          </div>
        )}

        <section className="tarjeta-sticker ancho" ref={ruletaRef}>
          <h2>Ruleta de la Victoria</h2>
          <Ruleta
            premios={partida.premios}
            onAgregar={(t) => actualizar(p => ({ ...p, premios: [...p.premios, t] }))}
            onQuitar={(i) => actualizar(p => ({ ...p, premios: p.premios.filter((_, k) => k !== i) }))}
          />
        </section>

        <section className="tarjeta-sticker ancho reglas">
          <div>
            <h2>Casillas que mueven fichas</h2>
            <ul className="lista-reglas">
              {MOVIMIENTOS.map(([n, txt]) => (
                <li key={n}><span className={`sello-mini ${CASILLAS[n].tipo || ''}`}>{CASILLAS[n].sello || n}</span><span><strong>{n}. {CASILLAS[n].corto}.</strong> {txt}</span></li>
              ))}
              <li><svg className="bruja-mini" aria-hidden="true"><use href="#i-sello" /></svg><span><strong>Comodines ({COMODINES.join(', ')}).</strong> Puedes hacer lo de la lona o cambiarlo por un reto misterioso.</span></li>
            </ul>
          </div>
          <div>
            <h2>Reglas de supervivencia</h2>
            <ul className="lista-reglas texto">
              <li><span><strong>Ofrenda de paz:</strong> te salvas de un reto pero tomas 1 shot. (Solo para personas en pareja)</span></li>
              <li><span><strong>Qlo si no:</strong> si no lo haces, te tomas lo que el otro prepare. (Solteros)</span></li>
              <li><span><strong>Divide dolor:</strong> todos empiezan con este comodín: úsalo 1 vez para dividir tus tragos con alguien más.</span></li>
              <li><span><strong>Comodines:</strong> 1 de cada 3 papelitos de la bolsa de retos es un comodín. Te lo guardas y lo usas cuando quieras desde el digivice.</span></li>
            </ul>
          </div>
        </section>

        <section className="tarjeta-sticker ancho">
          <details><summary>Las 60 casillas</summary>
            <ol className="todas">
              {Object.keys(CASILLAS).map(n => (
                <li key={n}><b>{n}</b><span>{CASILLAS[n].mensaje}{COMODINES.includes(+n) && ' ⭐'}{CASILLAS[n].aclara && <small>{CASILLAS[n].aclara}</small>}</span></li>
              ))}
            </ol>
          </details>
        </section>
      </main>

      {verPortada && (
        <div className="portada-fondo" role="dialog" aria-modal="true" aria-label={`${ganadorActual.nombre} llegó a la 60`}>
          <i className="chispa-p c1" /><i className="chispa-p c2" /><i className="chispa-p c3" /><i className="chispa-p c4" /><i className="chispa-p c5" />
          <div className="portada">
            <span className="p-vol">Hazifest Vol. 1</span>
            <span className="p-aro" style={{ '--c': colorDe(turno).c }}>
              <svg viewBox="0 0 40 56" aria-hidden="true"><FichaDibujo tipo={ganadorActual.ficha} inicial={(ganadorActual.nombre || '?')[0].toUpperCase()} /></svg>
            </span>
            <b className="p-nom" style={{ '--largo': Math.max(ganadorActual.nombre.length, 1) }}>{ganadorActual.nombre}</b>
            <span className="p-sub">llegó a la 60</span>
            <span className="p-lista">
              Lugar {ganadorActual.gano} de {jugadores.length} · {ganadorActual.tiros} tiro{ganadorActual.tiros === 1 ? '' : 's'}
              {ganadorActual.premio && <> · premio: {ganadorActual.premio}</>}
            </span>
          </div>
          <div className="portada-acc">
            <button type="button" className="btn-dorado" onClick={() => { setPortadaVista(partida.lugares); irARuleta(); }}>Girar la ruleta</button>
            <button type="button" className="btn-cromo" onClick={() => { setPortadaVista(partida.lugares); pasarTurno(); }}>Seguir jugando</button>
          </div>
        </div>
      )}

      {eventos[0] && (
        <div className="evento-fondo" role="dialog" aria-modal="true" aria-label={`Línea ${eventos[0].linea}: ${eventos[0].titulo}`}>
          <div className="evento" style={{ '--c': colorDe(eventos[0].i).c }}>
            <span className="evento-linea"><small>Línea</small>{eventos[0].linea}</span>
            {eventos[0].tipo && <span className={`evento-tipo ${eventos[0].tipo}`}>{eventos[0].tipo === 'castigo' ? 'Castigo' : 'Premio'}</span>}
            <strong>{eventos[0].titulo}</strong>
            <p>{eventos[0].texto}</p>
            {eventos[0].comodin && <span className="evento-guarda">★ Se guarda en tus comodines</span>}
            <small className="evento-quien">{eventos[0].nombre} llegó primero: es solo suyo</small>
            <button type="button" className="btn-rosa grande" onClick={() => cerrarEvento(eventos[0])}>{eventos[0].accion === 'reto' ? 'Sacar el reto' : eventos[0].comodin ? '¡Guardarlo!' : '¡Hecho!'}</button>
          </div>
        </div>
      )}

      {modalReto && (
        <div className={`modal-fondo${modalReto.desdeComodin ? ' barrera' : ''}`} role="dialog" aria-modal="true" aria-label="Reto misterioso">
          <div className={`modal${modalReto.desdeComodin ? ' recorte' : ''}`}>
            {modalReto.desdeComodin && <svg className="ojo" aria-hidden="true"><use href="#i-ojo" /></svg>}
            {modalReto.girando ? (
              <div className="invocando">
                <Pirinola caras={CARAS_PIRINOLA} final={modalReto.cara} onFin={alCaerPirinola} />
                <p>Girando la pirinola…</p>
              </div>
            ) : (
              <div className="reto-sale">
                <span className="pill">{modalReto.comodin ? '¡Comodín!' : modalReto.desdeComodin ? 'Tu destino' : 'Reto manual'}</span>
                <h2>{(modalReto.comodin || modalReto.reto).titulo}</h2>
                <p>{(modalReto.comodin || modalReto.reto).desc}</p>
                {modalReto.comodin && <p className="guarda-nota">Te lo guardas. Úsalo cuando quieras desde la pestaña Comodines del digivice.{modalReto.desdeComodin && ' Y te salvas de la casilla.'}</p>}
                {modalReto.reto?.dados && (modalReto.tiro ? (
                  <div className="tiro-reto">
                    <b>Salió {modalReto.tiro.join(' y ')}</b>
                    {modalReto.tiro.length > 1 && <span>Suma {modalReto.tiro.reduce((a, b) => a + b, 0)} · Producto {modalReto.tiro.reduce((a, b) => a * b, 1)}</span>}
                    <span>{modalReto.tiro.reduce((a, b) => a + b, 0) % 2 ? 'Impar' : 'Par'}</span>
                  </div>
                ) : (
                  <button type="button" className="btn-cromo tirar-reto" onClick={tirarParaReto} disabled={modalReto.tirando}>
                    {modalReto.tirando ? 'Tirando…' : `Tirar ${modalReto.reto.dados} dado${modalReto.reto.dados > 1 ? 's' : ''} para el reto`}
                  </button>
                ))}
                {modalReto.comodin ? (
                  <button type="button" className="btn-rosa grande" onClick={() => cerrarReto()}>¡Guardarlo!</button>
                ) : (
                  <>
                    <span className="piri-cara"><span className="piri-mini" aria-hidden="true" />Si te rajas: <b>{modalReto.cara}</b></span>
                    <div className="reto-botones">
                      <button type="button" className="btn-rosa grande" onClick={() => cerrarReto()}>¡Lo hago!</button>
                      <button type="button" className="btn-cromo" onClick={() => cerrarReto(true)}>Me rajo · {modalReto.cara}</button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {modalDados && (
        <div className="modal-fondo" role="dialog" aria-modal="true" aria-label="Dados extra" onClick={() => setModalDados(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-tope"><span className="pill">Dados extra</span><button type="button" className="cerrar" onClick={() => setModalDados(null)} aria-label="Cerrar">×</button></div>
            <div className="dados-sel centro">
              {[1, 2].map(n => <button key={n} type="button" className="btn-cromo" aria-pressed={modalDados.cuantos === n} onClick={() => setModalDados({ cuantos: n, vals: Array(n).fill(1), giros: 0, girando: false, res: null })}>{n} dado{n > 1 ? 's' : ''}</button>)}
            </div>
            <div className="dados centro">{modalDados.vals.map((v, k) => <Dado3D key={k} valor={v} giros={modalDados.giros} tam={80} />)}</div>
            {modalDados.res && (
              <div className="res-dados">
                <strong>Suma: {modalDados.res.suma}</strong>
                <span className={modalDados.res.par ? 'par' : 'impar'}>{modalDados.res.par ? 'Par' : 'Impar'}</span>
                {modalDados.res.mult && <span>Multiplicación: {modalDados.res.mult}</span>}
              </div>
            )}
            <button type="button" className="btn-rosa grande" onClick={tirarExtra} disabled={modalDados.girando}>{modalDados.girando ? 'Rodando…' : 'Tirar ahora'}</button>
          </div>
        </div>
      )}
    </>
  );
}
