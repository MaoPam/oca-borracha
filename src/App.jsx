import React, { useState, useEffect } from 'react';

// --- ICONOS SVG ---
const Iconos = {
  Fuego: ({ size = 20 }) => <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" /></svg>,
  Trofeo: ({ size = 20 }) => <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
  Usuarios: ({ size = 20 }) => <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Reglas: ({ size = 20 }) => <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  Estrella: ({ size = 20 }) => <svg width={size} height={size} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>,
  Alerta: ({ size = 20 }) => <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  Cerrar: ({ size = 20 }) => <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  Dado: ({ size = 20 }) => <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3" strokeWidth={2}/><circle cx="8" cy="8" r="1.5" fill="currentColor"/><circle cx="16" cy="16" r="1.5" fill="currentColor"/><circle cx="16" cy="8" r="1.5" fill="currentColor"/><circle cx="8" cy="16" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>,
  Regalo: ({ size = 20 }) => <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12v10H4V12M2 7h20v5H2zM12 22V7m0-5a2.5 2.5 0 10-5 0 2.5 2.5 0 005 0zm0-5a2.5 2.5 0 105 0 2.5 2.5 0 00-5 0z"/></svg>,
  Rayo: ({ size = 20 }) => <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>,
  Trash: ({ size = 16 }) => <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>,
};

// --- COMPONENTE DADO VISUAL (Principal) ---
const DadoVisual = ({ valor, isRolling }) => {
  const dots = {
    1: [[50, 50]],
    2: [[25, 25], [75, 75]],
    3: [[25, 25], [50, 50], [75, 75]],
    4: [[25, 25], [25, 75], [75, 25], [75, 75]],
    5: [[25, 25], [25, 75], [50, 50], [75, 25], [75, 75]],
    6: [[25, 25], [25, 50], [25, 75], [75, 25], [75, 50], [75, 75]]
  };
  const currentDots = isRolling ? dots[Math.floor(Math.random() * 6) + 1] : (dots[valor] || dots[1]);

  return (
    <div style={{
      width: 100, height: 100,
      background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
      borderRadius: 20,
      boxShadow: isRolling
        ? '0 0 30px rgba(236,72,153,0.6), 0 10px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.8)'
        : '0 10px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transform: isRolling ? 'rotate(15deg) scale(1.1)' : 'rotate(0deg) scale(1)',
      transition: 'all 0.15s ease',
    }}>
      <svg viewBox="0 0 100 100" style={{ width: '80%', height: '80%' }}>
        {currentDots.map((pos, i) => (
          <circle key={i} cx={pos[0]} cy={pos[1]} r="8" fill="#1a1a2e" />
        ))}
      </svg>
    </div>
  );
};

// --- DADO PEQUEÑO para la herramienta Modal ---
const DadoModal = ({ valor, isRolling, size = 64 }) => {
  const dots = {
    1: [[50,50]],
    2: [[28,28],[72,72]],
    3: [[28,28],[50,50],[72,72]],
    4: [[28,28],[28,72],[72,28],[72,72]],
    5: [[28,28],[28,72],[50,50],[72,28],[72,72]],
    6: [[28,28],[28,50],[28,72],[72,28],[72,50],[72,72]],
  };
  const d = isRolling ? dots[Math.floor(Math.random()*6)+1] : (dots[valor]||dots[1]);
  return (
    <div style={{
      width: size, height: size,
      background: 'linear-gradient(145deg,#fff,#e8e8e8)',
      borderRadius: size*0.2,
      boxShadow: isRolling
        ? '0 0 20px rgba(139,92,246,0.7), 0 6px 16px rgba(0,0,0,0.5)'
        : '0 6px 16px rgba(0,0,0,0.4)',
      display:'flex', alignItems:'center', justifyContent:'center',
      transform: isRolling ? `rotate(${Math.random()*30-15}deg) scale(1.08)` : 'rotate(0deg) scale(1)',
      transition:'all 0.1s ease', flexShrink: 0,
    }}>
      <svg viewBox="0 0 100 100" style={{width:'82%',height:'82%'}}>
        {d.map((p,i)=><circle key={i} cx={p[0]} cy={p[1]} r="9" fill="#1a1a2e"/>)}
      </svg>
    </div>
  );
};

// --- RETOS ---
const TODOS_LOS_RETOS = [
  { titulo: "Lucha de Ego", desc: "Retas a quien quieras a fuercitas, si te gana te tomas un shot." },
  { titulo: "Nuzlocke", desc: "Escoge 3 personas para tomar contigo. Cada persona que se niegue a tomar es un x2 a los que debes tomar tú. Toman el producto de lo que salga de tirar los dos dados" },
  { titulo: "Flashback", desc: "Tienes que mostrar la última imagen de la carpeta de borrados." },
  { titulo: "Trago de confianza", desc: "Escoges a alguien para que te prepare un trago misterioso con lo que haya." },
  { titulo: "Tatuaje callejero", desc: "El de enfrente tiene derecho a dibujarte lo que quiera (cara o brazo)." },
  { titulo: "Miradas", desc: "Duelo de miradas. El primero que ría o parpadee toma un shot. Si se niega, toma dos." },
  { titulo: "Manco", desc: "Por una ronda no puedes usar tus manos para sostener tu vaso. Tomas sin manos o te dan de beber." },
  { titulo: "Confesión de ayer", desc: "Cuenta lo más cagado que te ha pasado en una peda. Si es aburrido, tomas." },
  { titulo: "Planchados", desc: "Reta a alguien a hacer planchitas. El primero en tocar el piso toma 5 segundos." },
  { titulo: "Mismo destino", desc: "Escoge a quien quieras, tiene que tomar lo mismo que tú hasta acabar el juego. (No aplica en retos donde tomen la mayoria)" },
  { titulo: "Vende humo", desc: "Tienes 1 minuto para intentar vender algo absurdo." },
  { titulo: "Chismógrafo", desc: "Cada equipo te hace una pregunta incómoda de 'sí o no'. Si te tardas o ríes, bebes." },
  { titulo: "Caseta", desc: "Cada que alguien vaya al baño tiene que brindar contigo (chocar su vaso). Si se te pasa bebes; si aguien se dan cuenta, shot." },
  { titulo: "Conjuro", desc: "Lee el primer párrafo de una canción en latín." },
  { titulo: "Detector de Mentiras", desc: "Pregúntale algo al de enfrente y descubre si dice la verdad o no." },
  { titulo: "Consenso", desc: "Di algo como 'Tiene cara de...', cuentan 3 y todos señalan. El más señalado bebe." },
  { titulo: "Prejuzgón", desc: "Asume algo del que menos conozcas. Si aciertas bebe él, si fallas bebes tú." },
  { titulo: "Locutor", desc: "Habla con una voz distinta por 1 ronda." },
  { titulo: "Mixólogo experto", desc: "Inventa un trago y explícalo como mamador. Si te lo compran decides quién toma, si no, fondo." },
    { titulo: "Fotooo", desc: "Tomas una sola foto, si no salen todos los jugadores bebes" },
  { titulo: "Cultura general", desc: "Dices una categoría. El primero en no responder o repetir bebe." },
      { titulo: "2 de 3 caidas", desc: "Duelo de pulgares con el de la derecha, 2 shots al perdedor" },
  { titulo: "Proliferación", desc: "Tira 2 dados — el producto de los números es la cantidad de shots para tu equipo. ¡Suerte!", requiereDados: true },
  { titulo: "Francotirador", desc: "Avienta una tapa al vaso de alguien, si atinas, se lo fondea." },
  { titulo: "Dominó", desc: "Los tragos van en cadena (1, 2, 3...). El primero en romperla toma 3 shots." },
  { titulo: "Amnesia", desc: "Prohibido decir 'sí' o 'no' por 5 min. Quien falle, shot." },
  { titulo: "Tiro de gracia", desc: "Tira 1 dado — si es par tú repartes los shots, si es impar tú te los tomas todos.", requiereDados: true },
  { titulo: "Examen de vista", desc: "Mira al de tu izquierda 10 seg, cierra los ojos y describe su outfit. Cada error es un trago." },
  { titulo: "Incógnito", desc: "Dale like a la foto más vieja de alguien. Si adivinan de quién es, shot. Si no, te salvas." },
  { titulo: "Debugger", desc: "Fixea al más sobrio: sírvele un trago y se lo tiene que tomar." },
  { titulo: "Critico", desc: "Escoge a alguien, despues tira el dado, 5 o 6 bebe él, si sale 1  bebes tú" },
      { titulo: "Ruleta rusa", desc: "El que saque el numero mas bajo recibe un zape o shot de los todos los demas jugadores (1 shot x equipo)" },
  { titulo: "Sommelier", desc: "A ciegas prueba la bebida de un compa. Si atinas se salvan, si no, tu equipo fondea." },
    { titulo: "Equilibrio", desc: "10 pasos con tu bebida en la cabeza, si se te cae lo llenas y fondeatelo" },
  { titulo: "Bautizo", desc: "Cámbiale el nombre a alguien por el juego. Quien use su nombre real bebe." },
      { titulo: "Por las precarias", desc: "Felicidades te salvas de un castigo o puedes regresarle los tragos x2 a alguien cuando quiera que bebas" },
  { titulo: "Impuesto rubio", desc: "Shot al que se vea mas whitexican" },
  { titulo: "Anfitrion", desc: "Si eres el anfitrion todos brindan por ti, sino lo eres dale tu vaso a este él le tomara lo que quiera y tu te fondeas el resto" },
  { titulo: "Bala Perdida", desc: "Apunta al techo. A la cuenta de 3 apunta a quien sea. Si se apuntan mutuamente, ambos toman shot doble." },
  { titulo: "El Heredero", desc: "Si en tu próximo turno te toca beber, designa un heredero para tomar la mitad. Si se niega, él toma todo." },
  { titulo: "Cobrador de Impuestos", desc: "Durante 1 ronda, cada que alguien tire un número impar, tiene que darte un trago a ti antes de avanzar." },
  { titulo: "Campo Minado", desc: "Coloca 3 tapas en la mesa. El próximo jugador que mueva una por accidente, toma un shot." },
   { titulo: "Apagon", desc: "Por una ronda estas a ciegas" },
  { titulo: "El Interrogatorio", desc: "Hazle preguntas rápidas a alguien por 30 seg. Si responde 'sí' o 'no', bebe. Si sobrevive, bebes tú." },
  { titulo: "¿Qué trae en el bolso?", desc: "Muestra tu bolsa/cartera y explica de forma chistosa lo que traes. Si no da risa, shot." },
  { titulo: "Cámara Lenta", desc: "Haz todas tus acciones en cámara lenta hasta tu próximo turno. Si te mueves normal, shot." },
  { titulo: "Telepatía", desc: "A la cuenta de 3 tú y el de enfrente dicen una palabra. Si no tienen nada que ver, ambos toman." },
  { titulo: "El Tester", desc: "Elige a alguien. Por 10 min, antes de que tú tomes un castigo, él tiene que probarlo dándole un sorbo." },
  { titulo: "Anarquía", desc: "Comodines e inmunidades cancelados por 1 ronda. Todos brindan y toman 1 trago." }
];

const CASILLAS_COMODIN = [6, 10, 18, 21, 28, 30, 33, 35, 39, 41, 42, 47, 50, 52, 54, 56, 59];
const shuffleArray = (arr) => { let a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

const PLAYER_COLORS = [
  { bg: 'rgba(236,72,153,0.15)', border: '#ec4899', text: '#f9a8d4', accent: '#ec4899' },
  { bg: 'rgba(139,92,246,0.15)', border: '#8b5cf6', text: '#c4b5fd', accent: '#8b5cf6' },
  { bg: 'rgba(20,184,166,0.15)', border: '#14b8a6', text: '#5eead4', accent: '#14b8a6' },
  { bg: 'rgba(245,158,11,0.15)', border: '#f59e0b', text: '#fcd34d', accent: '#f59e0b' },
  { bg: 'rgba(239,68,68,0.15)', border: '#ef4444', text: '#fca5a5', accent: '#ef4444' },
  { bg: 'rgba(34,197,94,0.15)', border: '#22c55e', text: '#86efac', accent: '#22c55e' },
];

// --- ESTILOS GLOBALES ---
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0a0a14; }
  .oca-app { min-height: 100vh; background: #0a0a14; color: #e2e8f0; font-family: 'DM Sans', sans-serif; padding: 16px; padding-bottom: 80px; }
  .oca-app * { font-family: 'DM Sans', sans-serif; }
  .syne { font-family: 'Syne', sans-serif !important; }
  .oca-app::before {
    content: ''; position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: radial-gradient(ellipse at 20% 20%, rgba(139,92,246,0.08) 0%, transparent 60%),
                radial-gradient(ellipse at 80% 80%, rgba(236,72,153,0.08) 0%, transparent 60%),
                radial-gradient(ellipse at 50% 50%, rgba(20,184,166,0.04) 0%, transparent 70%);
    pointer-events: none; z-index: 0;
  }
  .content-wrap { position: relative; z-index: 1; max-width: 700px; margin: 0 auto; }
  .card { background: rgba(15,15,30,0.8); border: 1px solid rgba(255,255,255,0.07); border-radius: 24px; backdrop-filter: blur(20px); overflow: hidden; }
  .card-inner { padding: 24px; }
  .gradient-text { background: linear-gradient(135deg, #c084fc 0%, #ec4899 50%, #f97316 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .btn-primary { width: 100%; padding: 18px; background: linear-gradient(135deg, #7c3aed, #ec4899); border: none; border-radius: 16px; color: white; font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; cursor: pointer; letter-spacing: 1px; text-transform: uppercase; transition: all 0.2s ease; box-shadow: 0 8px 32px rgba(124,58,237,0.4); }
  .btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(124,58,237,0.5); }
  .btn-primary:active:not(:disabled) { transform: translateY(0); }
  .btn-primary:disabled { opacity: 0.3; cursor: not-allowed; }
  .btn-secondary { padding: 14px 20px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: #e2e8f0; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s ease; }
  .btn-secondary:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2); }
  .input-field { flex: 1; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 14px 18px; color: #e2e8f0; font-size: 15px; outline: none; transition: all 0.2s ease; }
  .input-field:focus { border-color: rgba(139,92,246,0.5); background: rgba(139,92,246,0.05); box-shadow: 0 0 0 3px rgba(139,92,246,0.1); }
  .badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
  @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-6px); } }
  @keyframes spin-fast { 0% { transform: rotate(0deg) scale(1.1); } 100% { transform: rotate(360deg) scale(1.1); } }
  @keyframes reveal { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
  @keyframes winner-glow { 0%, 100% { box-shadow: 0 0 20px rgba(234,179,8,0.4), 0 0 40px rgba(234,179,8,0.2); } 50% { box-shadow: 0 0 30px rgba(234,179,8,0.6), 0 0 60px rgba(234,179,8,0.3); } }
  .animate-reveal { animation: reveal 0.4s ease forwards; }
  .animate-float { animation: float 3s ease-in-out infinite; }
  .animate-winner { animation: winner-glow 1.5s ease-in-out infinite; }
  .progress-bar { height: 6px; background: rgba(255,255,255,0.06); border-radius: 999px; overflow: hidden; }
  .progress-fill { height: 100%; border-radius: 999px; transition: width 0.8s cubic-bezier(0.34,1.56,0.64,1); }
  .section-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; color: rgba(255,255,255,0.3); margin-bottom: 12px; }
  .modal-overlay { position: fixed; inset: 0; z-index: 100; background: rgba(0,0,0,0.85); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; padding: 16px; }
  .modal-box { background: linear-gradient(145deg, #0f0f2a, #1a0a2e); border: 1px solid rgba(236,72,153,0.3); border-radius: 28px; padding: 32px; max-width: 480px; width: 100%; box-shadow: 0 0 80px rgba(139,92,246,0.2), 0 0 40px rgba(236,72,153,0.15); animation: reveal 0.3s ease forwards; }
  .number-badge { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; flex-shrink: 0; }
`;

export default function OcaBorrachaApp() {
  const [faseJuego, setFaseJuego] = useState('setup');
  const [equipos, setEquipos] = useState([]);
  const [inputNombre, setInputNombre] = useState('');
  const [inputPremio, setInputPremio] = useState('');
  const [turnoIndex, setTurnoIndex] = useState(0);
  
  // Modales
  const [mostrarModalReto, setMostrarModalReto] = useState(false);
  const [mostrarModalDados, setMostrarModalDados] = useState(false);
  const [isSpinningRetoModal, setIsSpinningRetoModal] = useState(false);
  
  // Turno
  const [estadoTurno, setEstadoTurno] = useState('esperando_tiro');
  const [numDados, setNumDados] = useState(1);
  const [resultadoDados, setResultadoDados] = useState([1]);
  const [isRolling, setIsRolling] = useState(false);
  
  const [bolsaRetos, setBolsaRetos] = useState([]);
  const [retoActual, setRetoActual] = useState(null);
  
  // Dados Extra (Herramienta)
  const [modalNumDados, setModalNumDados] = useState(1);
  const [modalVals, setModalVals] = useState([1]);
  const [modalRolling, setModalRolling] = useState(false);
  const [modalResultado, setModalResultado] = useState(null);
  
  // Ruleta
  const [premiosRuleta, setPremiosRuleta] = useState([]);
  const [nuevoPremio, setNuevoPremio] = useState('');
  const [premioGanador, setPremioGanador] = useState(null);
  const [isSpinningRoulette, setIsSpinningRoulette] = useState(false);
  const [premioResaltado, setPremioResaltado] = useState(null);
  const [ganadorPartida, setGanadorPartida] = useState(null);
  const [setupStep, setSetupStep] = useState('nombre'); 
  const [pendingNombre, setPendingNombre] = useState('');

  useEffect(() => {
    setBolsaRetos(shuffleArray(TODOS_LOS_RETOS));
  }, []);

  const iniciarJuego = () => {
    if (equipos.length >= 2) {
      const premiosJugadores = equipos.map(e => e.premio).filter(Boolean);
      setPremiosRuleta(premiosJugadores);
      setFaseJuego('jugando');
    }
  };

  const handleAgregarNombre = (e) => {
    e.preventDefault();
    if (inputNombre.trim()) {
      setPendingNombre(inputNombre.trim());
      setInputNombre('');
      setSetupStep('premio');
    }
  };

  const handleAgregarPremio = (e) => {
    e.preventDefault();
    const color = PLAYER_COLORS[equipos.length % PLAYER_COLORS.length];
    setEquipos([...equipos, { nombre: pendingNombre, premio: inputPremio.trim(), posicion: 1, color }]);
    setInputPremio('');
    setPendingNombre('');
    setSetupStep('nombre');
  };

  const eliminarJugador = (idx) => {
    setEquipos(equipos.filter((_, i) => i !== idx));
  };

  const obtenerRetoAleatorio = () => {
    let bag = [...bolsaRetos];
    if (bag.length === 0) bag = shuffleArray(TODOS_LOS_RETOS);
    const reto = bag.pop();
    setBolsaRetos(bag);
    return reto;
  };

  const tirarDados = () => {
    setIsRolling(true);
    const interval = setInterval(() => {
      setResultadoDados(Array(numDados).fill(0).map(() => Math.floor(Math.random() * 6) + 1));
    }, 80);
    setTimeout(() => {
      clearInterval(interval);
      const finalRoll = Array(numDados).fill(0).map(() => Math.floor(Math.random() * 6) + 1);
      setResultadoDados(finalRoll);
      setIsRolling(false);
      setEstadoTurno('mostrando_dados');
      setTimeout(() => evaluarTiro(finalRoll.reduce((a, b) => a + b, 0)), 1400);
    }, 800);
  };

  const evaluarTiro = (avance) => {
    let nuevos = [...equipos];
    let eq = nuevos[turnoIndex];
    if (estadoTurno !== 'retrocediendo_58') {
      eq.posicion = Math.min(eq.posicion + avance, 60);
      setEquipos(nuevos);
      if (eq.posicion >= 60) {
        setGanadorPartida(eq);
        setEstadoTurno('fin_turno');
      } else if (eq.posicion === 58) {
        setEstadoTurno('retrocediendo_58');
      } else if (CASILLAS_COMODIN.includes(eq.posicion)) {
        setEstadoTurno('decision_comodin');
      } else {
        setEstadoTurno('fin_turno');
      }
    } else {
      eq.posicion = Math.max(eq.posicion - avance, 1);
      setEquipos(nuevos);
      if (CASILLAS_COMODIN.includes(eq.posicion)) setEstadoTurno('decision_comodin');
      else setEstadoTurno('fin_turno');
    }
  };

  // --- LOGICA MODAL RETO ---
  const abrirModalReto = () => {
    setMostrarModalReto(true);
    setIsSpinningRetoModal(true);
    setRetoActual(null);
    setTimeout(() => {
      const reto = obtenerRetoAleatorio();
      setRetoActual(reto);
      setIsSpinningRetoModal(false);
    }, 1200);
  };

  const cerrarModalReto = () => {
    setMostrarModalReto(false);
    if (estadoTurno === 'decision_comodin') setEstadoTurno('fin_turno');
  };

  // --- LOGICA MODAL DADOS EXTRA ---
  const abrirModalDados = () => {
    setMostrarModalDados(true);
    setModalResultado(null);
    setModalVals(Array(modalNumDados).fill(1));
  };

  const tirarDadosExtra = () => {
    if (modalRolling) return;
    setModalRolling(true);
    setModalResultado(null);
    const interval = setInterval(() => {
      setModalVals(Array(modalNumDados).fill(0).map(() => Math.floor(Math.random()*6)+1));
    }, 80);
    setTimeout(() => {
      clearInterval(interval);
      const final = Array(modalNumDados).fill(0).map(() => Math.floor(Math.random()*6)+1);
      setModalVals(final);
      setModalRolling(false);
      
      const sum = final.reduce((a,b)=>a+b,0);
      const mult = final.reduce((a,b)=>a*b,1);
      const esPar = sum % 2 === 0;
      
      setModalResultado({ 
        sum, 
        mult: final.length > 1 ? mult : null, 
        esPar,
        color: esPar ? '#22c55e' : '#ef4444' 
      });
    }, 800);
  };

  const siguienteTurno = () => {
    setEstadoTurno('esperando_tiro');
    setGanadorPartida(null);
    setTurnoIndex((turnoIndex + 1) % equipos.length);
  };

  const girarRuleta = () => {
    if (premiosRuleta.length < 2) return;
    setIsSpinningRoulette(true);
    setPremioGanador(null);
    let c = 0;
    const si = setInterval(() => { setPremioResaltado(premiosRuleta[c++ % premiosRuleta.length]); }, 120);
    setTimeout(() => {
      clearInterval(si);
      setPremioResaltado(null);
      setPremioGanador(premiosRuleta[Math.floor(Math.random() * premiosRuleta.length)]);
      setIsSpinningRoulette(false);
    }, 2800);
  };

  const addPremioRuleta = (e) => {
    e.preventDefault();
    if (nuevoPremio.trim()) { setPremiosRuleta([...premiosRuleta, nuevoPremio.trim()]); setNuevoPremio(''); }
  };

  const equipoActual = equipos[turnoIndex];
  const colorActual = equipoActual?.color || PLAYER_COLORS[0];

  return (
    <>
      <style>{globalStyles}</style>
      <div className="oca-app">

        {/* --- MODAL RETO MISTERIOSO --- */}
        {mostrarModalReto && (
          <div className="modal-overlay">
            <div className="modal-box">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <span className="badge" style={{ background: 'rgba(236,72,153,0.15)', color: '#f9a8d4', border: '1px solid rgba(236,72,153,0.3)' }}>
                  <Iconos.Rayo size={12} /> Tu destino
                </span>
                {estadoTurno !== 'decision_comodin' && (
                  <button onClick={() => setMostrarModalReto(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>
                    <Iconos.Cerrar size={20} />
                  </button>
                )}
              </div>

              {isSpinningRetoModal ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <div style={{ fontSize: 64, marginBottom: 16, display: 'inline-block', animation: 'spin-fast 0.4s linear infinite' }}>🎲</div>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16, fontWeight: 500 }}>Invocando el caos...</p>
                </div>
              ) : retoActual ? (
                <div style={{ animation: 'reveal 0.4s ease forwards' }}>
                  <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{
                      fontSize: 34, fontFamily: 'Syne', fontWeight: 800,
                      marginBottom: 14, lineHeight: 1.1,
                      background: 'linear-gradient(135deg, #c084fc, #ec4899)',
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>{retoActual.titulo}</div>
                    <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6 }}>{retoActual.desc}</p>
                    
                    {/* HINT SI REQUIERE DADOS */}
                    {retoActual.requiereDados && (
                      <div style={{ marginTop: 24, padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: 12, border: '1px dashed rgba(255,255,255,0.2)'}}>
                        <p style={{ fontSize: 13, color: '#c4b5fd', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                          <Iconos.Dado size={16} /> Este reto requiere dados
                        </p>
                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Usa la herramienta "Tirar Dados" abajo</p>
                      </div>
                    )}
                  </div>

                  <button onClick={cerrarModalReto} style={{
                    width:'100%', padding:'17px', borderRadius:16, border:'none',
                    background:'linear-gradient(135deg,#7c3aed,#ec4899)',
                    color:'white', fontFamily:'Syne', fontSize:16, fontWeight:700,
                    textTransform:'uppercase', letterSpacing:1, cursor:'pointer',
                    boxShadow:'0 8px 32px rgba(124,58,237,0.5)', transition:'all 0.2s',
                  }}>
                    ¡Aceptar Destino!
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* --- MODAL HERRAMIENTA DE DADOS --- */}
        {mostrarModalDados && (
          <div className="modal-overlay" onClick={() => setMostrarModalDados(false)}>
            <div className="modal-box" onClick={e => e.stopPropagation()} style={{ borderColor: 'rgba(139,92,246,0.3)', boxShadow: '0 0 80px rgba(139,92,246,0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <span className="badge" style={{ background: 'rgba(139,92,246,0.15)', color: '#c4b5fd', border: '1px solid rgba(139,92,246,0.3)' }}>
                  <Iconos.Dado size={12} /> Dados Extra
                </span>
                <button onClick={() => setMostrarModalDados(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>
                  <Iconos.Cerrar size={20} />
                </button>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ display:'flex', justifyContent:'center', gap:6, marginBottom:24 }}>
                  {[1,2].map(n => (
                    <button key={n} onClick={()=>{ setModalNumDados(n); setModalResultado(null); setModalVals(Array(n).fill(1)); }}
                      style={{
                        padding:'8px 24px', borderRadius:10, border:'none', cursor:'pointer',
                        background: modalNumDados===n ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.05)',
                        color: modalNumDados===n ? '#c4b5fd' : 'rgba(255,255,255,0.28)',
                        fontWeight:600, fontSize:14,
                        outline: modalNumDados===n ? '1px solid rgba(139,92,246,0.5)' : '1px solid rgba(255,255,255,0.07)',
                        transition:'all 0.15s',
                      }}
                    >{n} dado{n>1?'s':''}</button>
                  ))}
                </div>

                <div style={{ display:'flex', justifyContent:'center', gap:24, marginBottom:24 }}>
                  {modalVals.slice(0, modalNumDados).map((v,i) => (
                    <DadoModal key={i} valor={v} isRolling={modalRolling} size={80} />
                  ))}
                </div>

                {/* RESULTADOS GENÉRICOS */}
                {modalResultado && !modalRolling && (
                  <div style={{
                    textAlign:'center', padding:'16px', borderRadius:16, marginBottom:20,
                    background:'rgba(0,0,0,0.25)', border:`1px solid ${modalResultado.color}35`,
                    animation:'reveal 0.3s ease forwards',
                  }}>
                    <div style={{ fontFamily:'Syne', fontSize:28, fontWeight:800, color: '#fff', marginBottom: 4 }}>
                      Suma: <span style={{ color: '#c084fc' }}>{modalResultado.sum}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 12, fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                      <span style={{ color: modalResultado.color }}>({modalResultado.esPar ? 'PAR' : 'IMPAR'})</span>
                      {modalResultado.mult && <span>• Mult: <span style={{ color: '#f97316'}}>{modalResultado.mult}</span></span>}
                    </div>
                  </div>
                )}

                <button onClick={tirarDadosExtra} disabled={modalRolling} style={{
                  width:'100%', padding:'16px', borderRadius:14, border:'none',
                  background: modalRolling ? 'rgba(255,255,255,0.05)' : 'rgba(139,92,246,0.15)',
                  color: modalRolling ? 'rgba(255,255,255,0.2)' : '#c4b5fd',
                  border: modalRolling ? '1px solid transparent' : '1px solid rgba(139,92,246,0.4)',
                  fontFamily:'Syne', fontSize:16, fontWeight:700,
                  textTransform:'uppercase', letterSpacing:1, cursor: modalRolling ? 'not-allowed' : 'pointer',
                  transition:'all 0.2s', display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                }}>
                  <Iconos.Dado size={18} /> {modalRolling ? 'Rodando...' : 'Tirar Ahora'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="content-wrap" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* HEADER */}
          <div style={{ textAlign: 'center', padding: '24px 0 8px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 12,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 999, padding: '6px 16px',
            }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase' }}>Hazifest Vol. 1</span>
            </div>
            <h1 className="syne" style={{ fontSize: 'clamp(40px, 10vw, 64px)', fontWeight: 800, lineHeight: 1, marginBottom: 8 }}>
              <span className="gradient-text">OCA</span>
              <br />
              <span style={{ color: 'rgba(255,255,255,0.9)' }}>BORRACHA</span>
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>
              <Iconos.Fuego size={14} />
              <span style={{ letterSpacing: 3, textTransform: 'uppercase', fontWeight: 600, fontSize: 11 }}>El juego mas culero del momento</span>
              <Iconos.Fuego size={14} />
            </div>
          </div>

          {/* ====== SETUP ====== */}
          {faseJuego === 'setup' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="card">
                <div style={{
                  padding: '16px 24px',
                  background: 'linear-gradient(90deg, rgba(139,92,246,0.12), rgba(236,72,153,0.12))',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  display: 'flex', alignItems: 'center', gap: 10
                }}>
                  <Iconos.Usuarios size={16} />
                  <span className="syne" style={{ fontSize: 15, fontWeight: 700, color: '#c4b5fd' }}>
                    {setupStep === 'nombre' ? 'Registrar Jugadores' : `Premio de ${pendingNombre}`}
                  </span>
                </div>
                <div className="card-inner">
                  {setupStep === 'nombre' ? (
                    <form onSubmit={handleAgregarNombre} style={{ display: 'flex', gap: 10 }}>
                      <input className="input-field" type="text" value={inputNombre} onChange={e => setInputNombre(e.target.value)} placeholder="Nombre del compa..." autoFocus />
                      <button type="submit" style={{ padding: '14px 20px', background: 'linear-gradient(135deg, #7c3aed, #ec4899)', border: 'none', borderRadius: 12, color: 'white', fontWeight: 700, fontSize: 18, cursor: 'pointer' }}>+</button>
                    </form>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, padding: '12px 16px', background: 'rgba(139,92,246,0.08)', borderRadius: 12, border: '1px solid rgba(139,92,246,0.15)' }}>
                        <Iconos.Regalo size={16} />
                        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.4 }}>
                          <strong style={{ color: '#c4b5fd' }}>{pendingNombre}</strong>, ¿qué te gustaria ganar?
                        </p>
                      </div>
                      <form onSubmit={handleAgregarPremio} style={{ display: 'flex', gap: 10 }}>
                        <input className="input-field" type="text" value={inputPremio} onChange={e => setInputPremio(e.target.value)} placeholder="Su premio si llega a la 60..." autoFocus />
                        <button type="submit" style={{ padding: '14px 20px', background: 'linear-gradient(135deg, #7c3aed, #ec4899)', border: 'none', borderRadius: 12, color: 'white', fontWeight: 700, fontSize: 18, cursor: 'pointer' }}>✓</button>
                      </form>
                      <button onClick={() => { setSetupStep('nombre'); setPendingNombre(''); }} style={{ marginTop: 10, background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>Cancelar</button>
                    </div>
                  )}
                </div>
              </div>

              {equipos.length > 0 && (
                <div className="card">
                  <div className="card-inner" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <p className="section-label">Jugadores registrados</p>
                    {equipos.map((eq, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: eq.color.bg, border: `1px solid ${eq.color.border}30`, borderRadius: 14, animation: 'slide-up 0.3s ease forwards' }}>
                        <div className="number-badge" style={{ background: eq.color.bg, color: eq.color.text, border: `1px solid ${eq.color.border}50` }}>{idx + 1}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 15, fontWeight: 600, color: '#f1f5f9' }}>{eq.nombre}</div>
                          {eq.premio && <div style={{ fontSize: 12, color: eq.color.text, display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}><Iconos.Regalo size={11} /> {eq.premio}</div>}
                        </div>
                        <button onClick={() => eliminarJugador(idx)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer', padding: 4 }}><Iconos.Trash size={14} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button className="btn-primary" onClick={iniciarJuego} disabled={equipos.length < 2}>
                {equipos.length < 2 ? `Falta ${2 - equipos.length} jugador${equipos.length === 0 ? 'es' : ''}` : '¡Comenzar la peda! 🍻'}
              </button>
            </div>
          )}

          {/* ====== JUGANDO ====== */}
          {faseJuego === 'jugando' && equipoActual && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* POSICIONES */}
              <div className="card">
                <div className="card-inner">
                  <p className="section-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Iconos.Trofeo size={12} /> Posiciones
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[...equipos].map((eq, idx) => ({ ...eq, idx })).sort((a, b) => b.posicion - a.posicion).map((eq) => (
                      <div key={eq.idx} style={{ padding: '10px 14px', background: eq.idx === turnoIndex ? eq.color.bg : 'rgba(255,255,255,0.02)', border: `1px solid ${eq.idx === turnoIndex ? eq.color.border + '50' : 'rgba(255,255,255,0.04)'}`, borderRadius: 12, transition: 'all 0.3s ease' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {eq.idx === turnoIndex && <span style={{ width: 6, height: 6, borderRadius: '50%', background: eq.color.accent, display: 'inline-block', boxShadow: `0 0 8px ${eq.color.accent}` }} />}
                            <span style={{ fontSize: 14, fontWeight: 600, color: eq.idx === turnoIndex ? '#f1f5f9' : 'rgba(255,255,255,0.5)' }}>{eq.nombre}</span>
                          </div>
                          <span style={{ fontSize: 13, fontFamily: 'monospace', color: 'rgba(255,255,255,0.3)' }}>{eq.posicion}/60</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${(eq.posicion / 60) * 100}%`, background: eq.idx === turnoIndex ? `linear-gradient(90deg, ${eq.color.border}, ${eq.color.accent})` : 'rgba(255,255,255,0.12)' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ZONA DE TURNO PRINCIPAL */}
              <div className="card" style={{ border: `1px solid ${estadoTurno === 'retrocediendo_58' ? 'rgba(239,68,68,0.4)' : estadoTurno === 'decision_comodin' ? 'rgba(234,179,8,0.4)' : colorActual.border + '50'}`, boxShadow: `0 0 40px ${estadoTurno === 'retrocediendo_58' ? 'rgba(239,68,68,0.08)' : estadoTurno === 'decision_comodin' ? 'rgba(234,179,8,0.08)' : colorActual.accent + '15'}` }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: colorActual.bg, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>Turno de</p>
                    <h2 className="syne" style={{ fontSize: 32, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{equipoActual.nombre}</h2>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Casilla</div>
                    <div className="syne" style={{ fontSize: 36, fontWeight: 800, color: colorActual.text, lineHeight: 1 }}>{equipoActual.posicion}</div>
                  </div>
                </div>

                <div className="card-inner">
                  {(estadoTurno === 'esperando_tiro' || estadoTurno === 'retrocediendo_58' || estadoTurno === 'mostrando_dados') && (
                    <div>
                      {estadoTurno === 'retrocediendo_58' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '12px 16px', marginBottom: 20 }}>
                          <Iconos.Alerta size={18} />
                          <div><div style={{ fontSize: 14, fontWeight: 700, color: '#fca5a5' }}>¡Caíste en la 58!</div><div style={{ fontSize: 12, color: 'rgba(252,165,165,0.7)' }}>Tira para retroceder ese número</div></div>
                        </div>
                      )}

                      {estadoTurno !== 'mostrando_dados' && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 20 }}>
                          {[1, 2].map(n => (
                            <button key={n} onClick={() => setNumDados(n)} style={{ padding: '8px 20px', borderRadius: 10, border: 'none', background: numDados === n ? colorActual.bg : 'rgba(255,255,255,0.04)', color: numDados === n ? colorActual.text : 'rgba(255,255,255,0.3)', fontWeight: 600, fontSize: 14, cursor: 'pointer', outline: numDados === n ? `1px solid ${colorActual.border}50` : 'none', transition: 'all 0.2s' }}>{n} dado{n > 1 ? 's' : ''}</button>
                          ))}
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 24 }}>
                        {resultadoDados.map((val, idx) => <div key={idx} className={isRolling ? '' : 'animate-float'}><DadoVisual valor={val} isRolling={isRolling} /></div>)}
                      </div>

                      {estadoTurno === 'mostrando_dados' ? (
                        <div style={{ textAlign: 'center', padding: '12px 0' }}>
                          <div className="syne" style={{ fontSize: 48, fontWeight: 800, background: `linear-gradient(135deg, ${colorActual.border}, ${colorActual.accent})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{resultadoDados.reduce((a, b) => a + b, 0)}</div>
                          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginTop: 4, textTransform: 'uppercase', letterSpacing: 2 }}>casillas</p>
                        </div>
                      ) : (
                        <button onClick={tirarDados} disabled={isRolling} className="btn-primary" style={{ background: estadoTurno === 'retrocediendo_58' ? 'linear-gradient(135deg, #dc2626, #b91c1c)' : `linear-gradient(135deg, ${colorActual.border}, ${colorActual.accent})`, boxShadow: `0 8px 32px ${colorActual.accent}40` }}>
                          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}><Iconos.Dado size={20} />{isRolling ? 'Tirando...' : estadoTurno === 'retrocediendo_58' ? '¡Retroceder!' : '¡Tirar Dados!'}</span>
                        </button>
                      )}
                    </div>
                  )}

                  {estadoTurno === 'decision_comodin' && (
                    <div style={{ animation: 'reveal 0.3s ease forwards' }}>
                      <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.25)', borderRadius: 16, marginBottom: 20 }}>
                        <div style={{ color: '#fbbf24', marginBottom: 10 }}><Iconos.Estrella size={32} /></div>
                        <h3 className="syne" style={{ fontSize: 26, fontWeight: 800, color: '#fde68a', marginBottom: 8 }}>¡Casilla Comodín!</h3>
                        <p style={{ fontSize: 14, color: 'rgba(253,230,138,0.7)', lineHeight: 1.5 }}>Estás en la <strong>{equipoActual.posicion}</strong>. ¿Te avientas el reto o haces el de la lona?</p>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <button onClick={() => setEstadoTurno('fin_turno')} className="btn-secondary" style={{ textAlign: 'center' }}>Hacer el de la Lona</button>
                        <button onClick={abrirModalReto} style={{ padding: '14px', background: 'linear-gradient(135deg, #d97706, #f59e0b)', border: 'none', borderRadius: 12, color: '#fff', fontFamily: 'Syne', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 24px rgba(245,158,11,0.4)', textTransform: 'uppercase', letterSpacing: 1 }}>¡Reto Misterioso!</button>
                      </div>
                    </div>
                  )}

                  {estadoTurno === 'fin_turno' && (
                    <div style={{ animation: 'reveal 0.3s ease forwards' }}>
                      {ganadorPartida ? (
                        <div style={{ textAlign: 'center', padding: '24px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 16, marginBottom: 16 }} className="animate-winner">
                          <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
                          <h3 className="syne" style={{ fontSize: 28, fontWeight: 800, color: '#86efac', marginBottom: 8 }}>¡{ganadorPartida.nombre} llegó a la 60!</h3>
                          {ganadorPartida.premio && (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 999, padding: '6px 16px' }}>
                              <Iconos.Regalo size={14} /><span style={{ fontSize: 14, color: '#86efac', fontWeight: 600 }}>{ganadorPartida.premio}</span>
                            </div>
                          )}
                          <p style={{ marginTop: 12, fontSize: 14, color: 'rgba(134,239,172,0.6)' }}>Cobra tu premio y gira la Ruleta 👇</p>
                        </div>
                      ) : null}
                      <button onClick={siguienteTurno} className="btn-primary" style={{ background: ganadorPartida ? 'linear-gradient(135deg, #16a34a, #22c55e)' : `linear-gradient(135deg, ${colorActual.border}, ${colorActual.accent})`, boxShadow: ganadorPartida ? '0 8px 32px rgba(34,197,94,0.4)' : `0 8px 32px ${colorActual.accent}40` }}>
                        {ganadorPartida ? 'Siguiente turno ▶' : 'Terminar turno ⏭'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* GRID INFERIOR (2 columnas arriba, reglas completas abajo) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

                {/* RETO MANUAL */}
                <div className="card" style={{ cursor: 'pointer' }} onClick={abrirModalReto}>
                  <div className="card-inner" style={{ textAlign: 'center' }}>
                    <div style={{ color: '#ec4899', marginBottom: 10, display: 'flex', justifyContent: 'center' }}><Iconos.Rayo size={26} /></div>
                    <div className="syne" style={{ fontSize: 14, fontWeight: 700, color: '#f9a8d4', textTransform: 'uppercase', letterSpacing: 1 }}>Reto Manual</div>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 6, lineHeight: 1.4 }}>¿Alguien rompió <br/>una regla?</p>
                  </div>
                </div>

                {/* DADOS EXTRA */}
                <div className="card" style={{ cursor: 'pointer' }} onClick={abrirModalDados}>
                  <div className="card-inner" style={{ textAlign: 'center' }}>
                    <div style={{ color: '#a855f7', marginBottom: 10, display: 'flex', justifyContent: 'center' }}><Iconos.Dado size={26} /></div>
                    <div className="syne" style={{ fontSize: 14, fontWeight: 700, color: '#d8b4fe', textTransform: 'uppercase', letterSpacing: 1 }}>Tirar Dados</div>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 6, lineHeight: 1.4 }}>Herramienta<br/>extra</p>
                  </div>
                </div>

                {/* REGLAS (Ocupa todo el ancho) */}
                <div className="card" style={{ gridColumn: 'span 2' }}>
                  <div className="card-inner">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: '#c4b5fd' }}>
                      <Iconos.Reglas size={16} />
                      <span className="syne" style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Reglas de supervivencia</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.4 }}>
                      <p><strong style={{ color: '#f9a8d4' }}>🕊️ Ofrenda de paz:</strong> Te salvas de un reto pero tomas 1 shot. (Solo para personas en pareja)</p>
                      <p><strong style={{ color: '#f9a8d4' }}>🍑 Qlo si no:</strong> Si no lo haces, te tomas lo que el otro prepare. (Solteros)</p>
                      <p style={{ gridColumn: 'span 2' }}><strong style={{ color: '#f9a8d4' }}>➗ Divide dolor:</strong> Tienes derecho a 1 vez por juego a dividir tus tragos con alguien más.</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* RULETA */}
              <div className="card">
                <div style={{ padding: '16px 24px', background: 'linear-gradient(90deg, rgba(234,179,8,0.1), rgba(245,158,11,0.08))', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Iconos.Trofeo size={16} />
                  <span className="syne" style={{ fontSize: 15, fontWeight: 700, color: '#fcd34d' }}>RULETA DE LA VICTORIA</span>
                </div>
                <div className="card-inner">
                  <form onSubmit={addPremioRuleta} style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                    <input className="input-field" type="text" value={nuevoPremio} onChange={e => setNuevoPremio(e.target.value)} placeholder="Agregar premio extra..." />
                    <button type="submit" style={{ padding: '12px 16px', background: 'rgba(234,179,8,0.15)', border: '1px solid rgba(234,179,8,0.3)', borderRadius: 12, color: '#fcd34d', fontWeight: 700, fontSize: 18, cursor: 'pointer' }}>+</button>
                  </form>

                  <div style={{ minHeight: 80, background: 'rgba(0,0,0,0.2)', borderRadius: 14, padding: 14, marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                    {premiosRuleta.length === 0 ? <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)', width: '100%', textAlign: 'center' }}>Los premios de los jugadores aparecerán aquí</p> : premiosRuleta.map((p, i) => {
                      const isRes = isSpinningRoulette && premioResaltado === p;
                      const isWin = !isSpinningRoulette && premioGanador === p;
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600, transition: 'all 0.1s ease', transform: isWin ? 'scale(1.08)' : isRes ? 'scale(1.04)' : 'scale(1)', background: isWin ? '#f59e0b' : isRes ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.07)', color: isWin ? '#1a0a00' : isRes ? '#1a0a00' : 'rgba(255,255,255,0.6)', border: isWin ? 'none' : '1px solid rgba(255,255,255,0.1)', boxShadow: isWin ? '0 0 20px rgba(245,158,11,0.5)' : 'none' }}>
                          {isWin && '🏆 '}{p}
                          {!isSpinningRoulette && !isWin && <span onClick={() => setPremiosRuleta(premiosRuleta.filter((_, j) => j !== i))} style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.2)', marginLeft: 2, fontSize: 16 }}>×</span>}
                        </div>
                      );
                    })}
                  </div>

                  {premioGanador && !isSpinningRoulette && (
                    <div style={{ textAlign: 'center', marginBottom: 12 }}>
                      <span className="syne" style={{ fontSize: 20, fontWeight: 800, color: '#fcd34d', textTransform: 'uppercase' }}>¡{premioGanador}!</span>
                    </div>
                  )}

                  <button onClick={girarRuleta} disabled={premiosRuleta.length < 2 || isSpinningRoulette} style={{ width: '100%', padding: '16px', border: 'none', borderRadius: 14, background: premiosRuleta.length < 2 ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #d97706, #f59e0b)', color: premiosRuleta.length < 2 ? 'rgba(255,255,255,0.2)' : '#fff', fontFamily: 'Syne', fontSize: 16, fontWeight: 700, cursor: premiosRuleta.length < 2 ? 'not-allowed' : 'pointer', textTransform: 'uppercase', letterSpacing: 1, boxShadow: premiosRuleta.length >= 2 ? '0 8px 24px rgba(245,158,11,0.3)' : 'none' }}>
                    {isSpinningRoulette ? 'Girando...' : '🎰 Girar Ruleta'}
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </>
  );
}