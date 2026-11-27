// Utilidades de la lona impresa, separadas de los componentes para no romper
// el recargado en caliente de Vite (un archivo o exporta componentes, o exporta datos).

// Las casillas especiales van un poco chuecas, como sticker puesto a mano.
// Es determinista (la misma casilla siempre queda igual) pero disperso,
// entre -2 y +2 grados. Las normales no lo usan: van derechas.
export const chueco = (n) => {
  const h = Math.abs(Math.sin(n * 127.1) * 43758.5453);
  return ((h - Math.floor(h)) * 4 - 2).toFixed(2);
};

// Las 60 fotos de la lona, extraidas del PDF original a public/lona/.
export const memeDe = (n) => `${import.meta.env.BASE_URL}lona/casilla-${String(n).padStart(2, '0')}.jpeg`;
