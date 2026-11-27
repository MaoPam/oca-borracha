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
import { colorDe, MAX_JUGADORES } from './components/colores.js';
import { CASILLAS, COMODINES, META, MOVIMIENTOS } from './data/casillas.js';
import { RETOS } from './data/retos.js';
import { pasos, efecto, siguienteTurno, tirarDado, barajar } from './game/reglas.js';
import { guardarPartida, cargarPartida, borrarPartida, nuevaJugada } from './game/guardado.js';
import { gritoDe } from './game/gritos.js';

const sinMovimiento = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const T_DADO = sinMovimiento ? 150 : 1000;
const T_PASO = sinMovimiento ? 60 : 220;
// Secuencia del turno: ver el dado -> se va la burbuja -> camina el muñeco -> letrero -> vuelve la burbuja.
const T_VER_DADO = sinMovimiento ? 100 : 560;
const T_CIERRE = sinMovimiento ? 0 : 340;
const T_LETRERO = sinMovimiento ? 700 : 3200;
const T_FRANJA = 1700;  // lo que dura la franja de cambio de turno (igual que su animación)
const esperar = (ms) => new Promise(r => setTimeout(r, ms));

const partidaVacia = () => ({
  fase: 'setup', jugadores: [], turno: 0, etapa: 'tirar', casilla: null, nota: '',
  numDados: 1, dados: [1], giros: 0, premios: [], bolsa: [], bitacora: [], lugares: 0, reto: null,
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
  const [seccion, setSeccion] = useState('turno');       // qué parte del panel muestra la perilla
  const [franja, setFranja] = useState(null);            // franja de cambio de turno: { i, k }
  const [portadaVista, setPortadaVista] = useState(0);   // hasta qué lugar ya se cerró la portada del ganador
  const [ficha, setFicha] = useState(FICHAS[0].id);
  const [telon, setTelon] = useState(false);
  const esCelular = useEsCelular();
  const [modalReto, setModalReto] = useState(null);
  const [modalDados, setModalDados] = useState(null);
  const [confirmarNueva, setConfirmarNueva] = useState(false);
  const [nombre, setNombre] = useState('');
  const [premio, setPremio] = useState('');
  const ruletaRef = useRef(null);
  const franjaN = useRef(0);   // cuenta las franjas, para que cada una sepa si sigue siendo la última

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
    actualizar(p => ({ ...p, jugadores: [...p.jugadores, { nombre: nom, premio: premio.trim(), ficha, pos: 1, pierde: 0, gano: 0, tiros: 0 }] }));
    setFicha(fichaLibre([...pRef.current.jugadores, { ficha }]));
    setNombre(''); setPremio('');
  };
  const quitarJugador = (i) => actualizar(p => ({ ...p, jugadores: p.jugadores.filter((_, k) => k !== i) }));
  const comenzar = () => {
    if (partida.jugadores.length < 2) return;
    setTelon(true);
    setTimeout(() => setTelon(false), sinMovimiento ? 300 : 2250);
    setTimeout(() => anunciaTurno(0), sinMovimiento ? 320 : 2300);
    actualizar(p => ({
      ...partidaVacia(), fase: 'jugando',
      jugadores: p.jugadores.map(j => ({ ...j, pos: 1, pierde: 0, gano: 0, tiros: 0 })),
      premios: p.jugadores.map(j => j.premio).filter(Boolean),
      bolsa: barajar(RETOS.map((_, i) => i)), casilla: 1,
      nota: `Todas las fichas en el inicio. Empieza ${p.jugadores[0].nombre}.`,
      bitacora: [nuevaJugada('', '¡Empieza la peda!')],
    }));
  };
  const continuar = () => { const g = partida.guardada; pRef.current = g; setPartida(g); };
  const nuevaPartida = () => {
    borrarPartida();
    const jugadores = pRef.current.jugadores.map(j => ({ ...j, pos: 1, pierde: 0, gano: 0, tiros: 0 }));
    const p = { ...partidaVacia(), jugadores };
    pRef.current = p; setPartida(p); setConfirmarNueva(false); setVista(null);
  };

  // ---------- Movimiento ----------
  const caminar = async (i, cantidad, direccion) => {
    const { ruta, rebote } = pasos(pRef.current.jugadores[i].pos, cantidad, direccion);
    for (const pos of ruta) { cambiarJugador(i, { pos }); await esperar(T_PASO); }
    return rebote;
  };

  const rodar = async (cuantos) => {
    const dados = Array.from({ length: cuantos }, () => tirarDado());
    setBurbuja(true); setSeccion('turno'); setTirando(true);
    actualizar(p => ({ ...p, dados, giros: p.giros + 1 }));
    await esperar(T_DADO);
    setTirando(false);
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
    setSeccion('turno');
    setBurbuja(true);
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
      case 'reparte': {
        log(`${n}: reparte tragos`);
        const [w] = await rodar(1);
        anotar(i, `${j.nombre} reparte ${w} trago${w > 1 ? 's' : ''}.`, { casilla: n, dados: [w] });
        return terminarEn('listo', conPrevia(`Salió ${w}: reparte ${w} trago${w > 1 ? 's' : ''}.`));
      }
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
  const sacarReto = () => {
    let bolsa = [...pRef.current.bolsa];
    if (!bolsa.length) bolsa = barajar(RETOS.map((_, i) => i));
    const idx = bolsa.pop();
    actualizar(p => ({ ...p, bolsa }));
    return RETOS[idx];
  };
  const abrirReto = (desdeComodin) => {
    setModalReto({ girando: true, desdeComodin });
    setTimeout(() => setModalReto({ girando: false, desdeComodin, reto: sacarReto() }), sinMovimiento ? 200 : 1200);
  };
  const cerrarReto = () => {
    const m = modalReto;
    setModalReto(null);
    if (m?.reto) anotar(pRef.current.turno, `${m.desdeComodin ? 'Cambia la casilla por el reto' : 'Reto manual'}: ${m.reto.titulo}.`);
    if (m?.desdeComodin && pRef.current.etapa === 'comodin') terminarEn('listo', `Reto misterioso: ${m.reto.titulo}.`, { reto: m.reto });
  };
  const hacerLona = () => terminarEn('listo', 'Haces lo que dice la lona.');

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
  }[etapa];
  const alTirar = () => (etapa === 'retroceder' ? retroceder() : tirar());
  const grito = letrero ? gritoDe(letrero, CASILLAS[letrero]) : null;
  const verPortada = ganadorActual && portadaVista !== partida.lugares;

  return (
    <>
      <Simbolos />
      {telon && (
        <div className="telon-abre" aria-hidden="true">
          <i className="hoja izq" /><i className="hoja der" />
          <span className="volante" />
          <svg className="ojo-telon" viewBox="0 0 40 40"><use href="#i-ojo" /></svg>
          <b>¡Que empiece la peda!</b>
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
          inicial={(actual.nombre || '?')[0].toUpperCase()}
          ficha={actual.ficha}
          aviso={etapa === 'fin' ? 'Se acabó la partida' : `Turno de ${actual.nombre}`}
          alerta={etapa === 'tirar' || etapa === 'otraVez' || etapa === 'retroceder' || etapa === 'comodin'}
          girando={tirando}
          abierta={burbuja}
          onAbrir={setBurbuja}
          seccion={seccion}
          onSeccion={setSeccion}
          acciones={{
            reto: () => abrirReto(false),
            dados: () => setModalDados({ cuantos: 1, vals: [1], giros: 0, girando: false, res: null }),
          }}
          secciones={{
            turno: (
          <section className="tarjeta-sticker turno" aria-label="Turno">
            <div className={`dados${tirando ? ' tirando' : ''}`}>{partida.dados.map((v, k) => <Dado3D key={k} valor={v} giros={partida.giros} girando={tirando} tam={partida.dados.length > 1 ? 66 : 84} />)}</div>
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
          }}
        />

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
              <li><span><strong>Divide dolor:</strong> tienes derecho, 1 vez por juego, a dividir tus tragos con alguien más.</span></li>
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

      {modalReto && (
        <div className={`modal-fondo${modalReto.desdeComodin ? ' barrera' : ''}`} role="dialog" aria-modal="true" aria-label="Reto misterioso">
          <div className={`modal${modalReto.desdeComodin ? ' recorte' : ''}`}>
            {modalReto.desdeComodin && <svg className="ojo" aria-hidden="true"><use href="#i-ojo" /></svg>}
            {modalReto.girando ? (
              <div className="invocando"><Dado3D valor={1} giros={3} tam={72} conResultado={false} /><p>Invocando el caos…</p></div>
            ) : (
              <>
                <span className="pill">{modalReto.desdeComodin ? 'Tu destino' : 'Reto manual'}</span>
                <h2>{modalReto.reto.titulo}</h2>
                <p>{modalReto.reto.desc}</p>
                {modalReto.reto.requiereDados && <p className="aviso-dados">Este reto usa dados: toca la perilla y elige "Dados".</p>}
                <button type="button" className="btn-rosa grande" onClick={cerrarReto}>¡Aceptar destino!</button>
              </>
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
