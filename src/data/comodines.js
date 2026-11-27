// Comodines: cartas que cada quien se guarda y usa cuando quiera, desde la pestaña
// Comodines del digivice. Todos empiezan con "Divide dolor".
//
// Salen en la bolsa de retos: se agregan comodines (repitiendo esta lista en orden) hasta que
// sean 1 de cada 3 papelitos. No se quita ningún reto: si agregas retos, salen más comodines.
// Cambia, quita o agrega cartas a tu gusto; el id no debe repetirse.
export const PROPORCION_COMODINES = 1 / 3;

export const CARTAS = [
  { id: 'divide-dolor', titulo: 'Divide dolor', desc: 'Divide tus tragos con alguien más.' },
  { id: 'pase-vip', titulo: 'Pase VIP', desc: 'Te salvas del próximo trago que te toque.' },
  { id: 'espejo', titulo: 'Espejo', desc: 'Lo que te manden a tomar se lo regresas a quien te lo mandó.' },
  { id: 'heredero', titulo: 'Heredero', desc: 'Escoge a alguien: se toma la mitad de lo que te toque.' },
  { id: 'salvavidas', titulo: 'Salvavidas', desc: 'Te zafas de un reto sin pagar la ofrenda de paz.' },
  { id: 'repartidor', titulo: 'Repartidor', desc: 'Reparte 3 tragos entre quien quieras.' },
  { id: 'brindis', titulo: 'Brindis', desc: 'Todos brindan y toman un trago contigo.' },
  { id: 'inmunidad', titulo: 'Inmunidad', desc: 'Por una ronda nadie te puede mandar a tomar.' },
];

export const cartaDe = (id) => CARTAS.find(c => c.id === id);
