// Utilidades de la lona impresa, separadas de los componentes para no romper
// el recargado en caliente de Vite (un archivo o exporta componentes, o exporta datos).

// Cada casilla va pegada chueca, como recorte puesto a mano.
// Es determinista (la misma casilla siempre queda igual) pero disperso:
// 58 angulos distintos entre -4.4 y +4 grados, no una rampa.
export const chueco = (n) => {
  const h = Math.abs(Math.sin(n * 127.1) * 43758.5453);
  return ((h - Math.floor(h)) * 9 - 4.5).toFixed(2);
};

// Las 60 fotos de la lona, extraidas del PDF original a public/lona/.
export const memeDe = (n) => `${import.meta.env.BASE_URL}lona/casilla-${String(n).padStart(2, '0')}.jpeg`;
