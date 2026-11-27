// Eventos de la carrera: se disparan la primera vez que cada jugador llega a una de
// estas casillas o la rebasa. Las tres líneas caen justo donde cambia el barrio del
// recorrido (Tianguis → Metro → Perreo → Laberinto).
//
// Cambia los textos a tu gusto. accion: 'reto' hace que el botón saque un reto misterioso.
export const EVENTOS = [
  {
    linea: 15,
    titulo: 'Llegaste al Metro',
    texto: 'Hora pico: todos toman un trago. Quien cruzó la línea escoge con quién chocar el vaso.',
  },
  {
    linea: 30,
    titulo: 'Llegaste al Perreo',
    texto: 'Quien cruzó escoge pareja y bailan 15 segundos. Si no bailan, los dos toman doble.',
  },
  {
    linea: 45,
    titulo: 'Entraste al Laberinto',
    texto: 'Quien cruzó recibe un reto misterioso.',
    accion: 'reto',
  },
];
