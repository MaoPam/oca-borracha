// Eventos de la carrera: se disparan la primera vez que cada jugador llega a una de
// estas casillas o la rebasa (son las marcas 15, 30 y 45 de la tira de arriba).
//
// tipo: 'premio' o 'castigo' (cambia el color de la etiqueta en la tarjeta).
// Cambia los textos a tu gusto; accion: 'reto' haría que el botón saque un reto misterioso.
export const EVENTOS = [
  {
    linea: 15,
    tipo: 'premio',
    titulo: 'Pase VIP',
    texto: 'Te salvas del próximo trago que te toque. Guárdalo para cuando más lo necesites.',
  },
  {
    linea: 30,
    tipo: 'castigo',
    titulo: 'Peaje de medio camino',
    texto: 'Para seguir avanzando pagas el peaje: un shot o tres tragos, tú escoges.',
  },
  {
    linea: 45,
    tipo: 'premio',
    titulo: 'Dedazo',
    texto: 'Señala a alguien: se toma lo mismo que tú cada vez que bebas, hasta que llegues a la 60.',
  },
];
