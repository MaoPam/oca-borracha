// La chapita que dice de qué va la casilla. Va por FORMA además de por color,
// para que se distinga sin depender de ver bien los colores.
//   tragos  -> corcholata        avanza -> flecha de combi (verde)
//   atras   -> marco tachado     estampa -> sello con estrellas (comodín)
//   meta    -> rombo cromado

const Corcholata = () => (
  <>
    <circle cx="20" cy="20" r="17" fill="#000" />
    <circle cx="20" cy="20" r="14.5" fill="var(--rotulo-am)" stroke="#000" strokeWidth="4.4" strokeDasharray="3 2.5" />
    <circle cx="20" cy="20" r="7.5" fill="none" stroke="#000" strokeWidth="2" />
  </>
);

const Flecha = () => (
  <>
    <path d="M3 13 H22 V4 L37 20 L22 36 V27 H3 Z" fill="var(--neon)" stroke="#000" strokeWidth="3" strokeLinejoin="miter" />
    <path d="M8 20 H20" stroke="#000" strokeWidth="2.6" />
  </>
);

const Tachado = () => (
  <>
    <path d="M4 4 H36 V36 H4 Z" fill="none" stroke="var(--laberinto)" strokeWidth="5" />
    <path d="M4 4 H36 V36 H4 Z" fill="none" stroke="#000" strokeWidth="1.6" />
    <path d="M6 6 L34 34 M34 6 L6 34" stroke="var(--laberinto)" strokeWidth="5.5" strokeLinecap="butt" />
    <path d="M6 6 L34 34 M34 6 L6 34" stroke="#000" strokeWidth="1.4" />
  </>
);

const Estampa = () => (
  <>
    <path d="M20 2 L28 10 L38 20 L28 30 L20 38 L12 30 L2 20 L12 10 Z" fill="#000" />
    <path d="M20 9 L26 20 L20 31 L14 20 Z" fill="var(--chicle)" />
    <circle cx="20" cy="20" r="3.2" fill="#000" />
    <path d="M20 2 V38 M2 20 H38" stroke="var(--papel)" strokeWidth="1.2" />
  </>
);

const Cromo = () => (
  <>
    <path d="M20 2 L38 20 L20 38 L2 20 Z" fill="#f3f4f8" stroke="#000" strokeWidth="3" strokeLinejoin="miter" />
    <path d="M20 6 L34 20 L20 34 L6 20 Z" fill="#9aa1b3" />
    <path d="M20 10 L30 20 L20 30 L10 20 Z" fill="#fbfbfe" />
    <path d="M20 15 L25 20 L20 25 L15 20 Z" fill="#5a6072" />
  </>
);

const MAPA = { tragos: Corcholata, avanza: Flecha, atras: Tachado, estampa: Estampa, meta: Cromo };

export default function Marco({ tipo }) {
  const Chapa = MAPA[tipo] || Corcholata;
  return (
    <svg className={`marco m-${tipo}`} viewBox="0 0 40 40" aria-hidden="true">
      <Chapa />
    </svg>
  );
}
