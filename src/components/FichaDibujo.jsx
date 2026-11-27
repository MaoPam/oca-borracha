// El dibujo de cada ficha. Todas caben en el mismo lienzo de 40x56 para que
// el tablero no tenga que saber cual escogio cada quien.
// --c es el color del jugador: va siempre en una pieza grande para que
// dos personas con la misma ficha se sigan distinguiendo de lejos.

const Marioneta = ({ inicial }) => (
  <>
    <g className="pierna i"><path d="M15 33 L11 53 L19 54 L22 34 Z" /></g>
    <g className="pierna d"><path d="M23 33 L27 54 L35 52 L30 33 Z" /></g>
    <g className="brazo i"><path d="M13 21 L6 37 L11 39 L17 23 Z" /></g>
    <g className="brazo d"><path d="M27 21 L34 37 L29 39 L23 23 Z" /></g>
    <path className="torso" d="M11 19 L29 18 L28 36 L12 35 Z" />
    <g className="cabeza">
      <path className="craneo" d="M12 2 L28 3 L27 18 L13 17 Z" />
      <text x="20" y="14">{inicial}</text>
    </g>
  </>
);

const Corcholata = ({ inicial }) => (
  <g className="menea">
    {/* El borde ondulado es un trazo grueso punteado: mas barato que 20 picos a mano. */}
    <circle cx="20" cy="34" r="17.5" fill="#000" />
    <circle cx="20" cy="34" r="15" className="pieza" strokeWidth="4.6" strokeDasharray="3.2 2.6" />
    <circle cx="20" cy="34" r="10" className="pieza" strokeWidth="2" />
    <text x="20" y="39">{inicial}</text>
  </g>
);

const Colilla = ({ inicial }) => (
  <g className="menea" transform="rotate(-16 20 32)">
    <path d="M14 8 L26 8 L26 12 L14 12 Z" fill="#555" stroke="#000" strokeWidth="2" />
    <path d="M14 12 L26 12 L26 32 L14 32 Z" fill="var(--papel)" stroke="#000" strokeWidth="2.2" />
    <path d="M14 32 L26 32 L26 52 L14 52 Z" className="pieza" strokeWidth="2.2" />
    <path d="M14 38 L26 38 M14 45 L26 45" stroke="#000" strokeWidth="1.6" />
    <text x="20" y="27">{inicial}</text>
  </g>
);

const Cheeto = ({ inicial }) => (
  <g className="menea">
    <path
      d="M12 48 C8 36 11 23 19 16 C26 10 34 13 34 20 C34 28 27 31 24 37 C22 42 24 49 19 52 C15 54 13 53 12 48 Z"
      className="pieza" strokeWidth="2.6"
    />
    <circle cx="19" cy="23" r="1.9" fill="#000" /><circle cx="26" cy="20" r="1.5" fill="#000" />
    <circle cx="17" cy="33" r="1.6" fill="#000" /><circle cx="20" cy="44" r="1.7" fill="#000" />
    <text x="27" y="48">{inicial}</text>
  </g>
);

const Murcielago = ({ inicial }) => (
  <g className="vuela">
    <g className="ala i"><path d="M19 26 L8 15 L10 25 L1 23 L6 33 L1 36 L13 41 L19 36 Z" fill="#1d1b2e" stroke="#000" strokeWidth="2.2" strokeLinejoin="miter" /></g>
    <g className="ala d"><path d="M21 26 L32 15 L30 25 L39 23 L34 33 L39 36 L27 41 L21 36 Z" fill="#1d1b2e" stroke="#000" strokeWidth="2.2" strokeLinejoin="miter" /></g>
    <path d="M14 17 L17 9 L20 14 L23 9 L26 17 L26 38 L14 38 Z" className="pieza" strokeWidth="2.4" />
    <path d="M17 36 L18 41 L20 37 L22 41 L23 36 Z" fill="var(--papel)" stroke="#000" strokeWidth="1.2" />
    <text x="20" y="29">{inicial}</text>
  </g>
);

const Encendedor = ({ inicial }) => (
  <g className="prende">
    <g className="llama"><path d="M20 1 L25 9 L22 12 L26 15 L20 21 L14 15 L18 12 L15 8 Z" fill="var(--amarillo)" stroke="#000" strokeWidth="2" strokeLinejoin="miter" /></g>
    <path d="M13 21 L27 21 L27 26 L13 26 Z" fill="#8a8a8a" stroke="#000" strokeWidth="2.2" />
    <path d="M12 26 L28 26 L28 54 L12 54 Z" className="pieza" strokeWidth="2.4" />
    <text x="20" y="44">{inicial}</text>
  </g>
);

const MAPA = {
  marioneta: Marioneta,
  corcholata: Corcholata,
  colilla: Colilla,
  cheeto: Cheeto,
  murcielago: Murcielago,
  encendedor: Encendedor,
};

export default function FichaDibujo({ tipo, inicial }) {
  const Dibujo = MAPA[tipo] || Corcholata;
  // .fd lleva los colores y contornos, para que la ficha se pinte igual en el tablero,
  // la burbuja, el registro o la carrera.
  return <g className="fd"><Dibujo inicial={inicial} /></g>;
}
