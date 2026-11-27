import { tipoDe } from './tipos.js';

// Lo que se grita al caer en cada casilla. Algunas tienen grito propio; el resto
// sale de su tipo, y de las normales, las de beber gritan ¡SALUD!.
const PROPIOS = { 1: '¡ARRANCAMOS!', 3: '¡A REPARTIR!', 7: '¡OTRA VEZ!', 49: '¡QUIETO AHÍ!', 60: '¡A LA RULETA!' };
const POR_TIPO = { atras: "¡PA' ATRÁS!", avanza: "¡PA' DELANTE!", reto: '¡COMODÍN!', especial: '¡ESPECIAL!' };

// clase: el color del grito. Usa el mismo significado que el borde de la casilla.
export function gritoDe(n, cas) {
  const tipo = tipoDe(n, cas);
  const bebe = ['tarro', 'shot'].includes(cas.icono);
  return {
    texto: PROPIOS[n] || POR_TIPO[tipo] || (bebe ? '¡SALUD!' : '¡AHÍ TE VA!'),
    clase: tipo !== 'normal' ? tipo : bebe ? 'tragos' : 'normal',
  };
}
