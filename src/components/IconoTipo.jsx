// Los únicos cuatro iconos del tablero, uno por tipo de casilla especial.
// Trazo blanco grueso para que se lean sobre la banda negra; el relleno toma
// el color del tipo (--k) que define la casilla.
const DIBUJOS = {
  avanza: <path d="M2 10 H15 V4 L26 14 L15 24 V18 H2 Z" fill="var(--k)" stroke="#fff" strokeWidth="2.6" strokeLinejoin="miter" />,
  atras: <path d="M26 10 H13 V4 L2 14 L13 24 V18 H26 Z" fill="var(--k)" stroke="#fff" strokeWidth="2.6" strokeLinejoin="miter" />,
  reto: <path d="M14 2 L17.5 10 L26 10.6 L19.5 16 L21.6 24.6 L14 20 L6.4 24.6 L8.5 16 L2 10.6 L10.5 10 Z" fill="var(--k)" stroke="#fff" strokeWidth="2.4" strokeLinejoin="miter" />,
  especial: (
    <>
      <path d="M14 2 L26 14 L14 26 L2 14 Z" fill="#f3f4f8" stroke="#fff" strokeWidth="2" />
      <path d="M14 7 L21 14 L14 21 L7 14 Z" fill="#8e95a7" />
      <path d="M14 11 L17 14 L14 17 L11 14 Z" fill="#fbfbfe" />
    </>
  ),
};

export default function IconoTipo({ tipo }) {
  if (!DIBUJOS[tipo]) return null;
  return <svg className="ico" viewBox="0 0 28 28" aria-hidden="true">{DIBUJOS[tipo]}</svg>;
}
