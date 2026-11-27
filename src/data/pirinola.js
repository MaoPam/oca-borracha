// Caras de la pirinola de los retos: la que quede arriba es lo que te tomas si te rajas.
// Cámbialas a tu gusto (cortas, que quepan en la pirinola).
export const CARAS_PIRINOLA = ['1 trago', '2 tragos', '3 tragos', 'Shot', 'Shot doble', 'Fondo'];

// Lo que le hace cada cara a las stats de quien se raja: [acción, cuántas veces].
// Si cambias una cara de arriba, cámbiala también aquí (npm test te avisa si falta).
export const CASTIGO_CARA = {
  '1 trago': ['trago', 1],
  '2 tragos': ['trago', 2],
  '3 tragos': ['trago', 3],
  Shot: ['shot', 1],
  'Shot doble': ['shot', 2],
  Fondo: ['fondo', 1],
};

// Cuando el papelito es un comodín la pirinola cae en esta cara.
export const CARA_COMODIN = '★ Comodín';

// Una cara de castigo al azar (fuera del componente: React pide que dibujar no dependa del azar).
export const caraAlAzar = (rand = Math.random) => CARAS_PIRINOLA[Math.floor(rand() * CARAS_PIRINOLA.length)];
