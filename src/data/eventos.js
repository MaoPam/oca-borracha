// Eventos de la carrera: se los lleva solo el primer jugador que llega a una de estas
// casillas o la rebasa (son las marcas 15, 30 y 45 de la tira de arriba). Los demás ya no.
//
// tipo: 'premio' o 'castigo' (cambia el color de la etiqueta en la tarjeta).
// comodin: el id de una carta de comodines.js; quien gana la línea se la guarda.
// Cambia los textos a tu gusto; accion: 'reto' haría que el botón saque un reto misterioso.
export const EVENTOS = [
  {
    linea: 15,
    tipo: 'premio',
    titulo: 'Pase VIP',
    texto: 'Te salvas del próximo trago que te toque. Guárdalo para cuando más lo necesites.',
    comodin: 'pase-vip',
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
