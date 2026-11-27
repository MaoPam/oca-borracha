import { COMODINES } from '../data/casillas.js';
import { efecto } from './reglas.js';

// Qué tipo es cada casilla, para pintarla. Opción A: en un juego de beber,
// beber es lo normal, así que "tragos" NO es una categoría con color.
// Resultado: 24 de 60 casillas con color (40%); el resto, todas iguales.
//   especial -> cromo     (3 reparte tragos con otro dado, 60 la Ruleta)
//   avanza   -> verde     (7, 31)
//   atras    -> rojo      (45, 49, 58)
//   reto     -> amarillo  (los 17 comodines)
export const tipoDe = (n, cas) =>
  n === 60 || efecto(n).tipo === 'reparte' ? 'especial'
  : cas.tipo === 'bonus' ? 'avanza'
  : cas.tipo === 'trampa' ? 'atras'
  : COMODINES.includes(n) ? 'reto'
  : 'normal';
