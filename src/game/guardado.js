// Guardado de la partida.
// Hoy se guarda en el navegador (localStorage) para no perderla si se recarga o se cierra la pestaña.
// La bitácora ya tiene la forma de un documento por jugada, así que pasarla a Firebase
// (una colección "partidas/{id}/jugadas") es reemplazar estas dos funciones.
const CLAVE = 'oca-borracha:partida';

export function guardarPartida(partida) {
  try { localStorage.setItem(CLAVE, JSON.stringify(partida)); } catch { /* sin espacio o modo privado */ }
}

export function cargarPartida() {
  try {
    const p = JSON.parse(localStorage.getItem(CLAVE) || 'null');
    return p && Array.isArray(p.jugadores) && p.jugadores.length ? p : null;
  } catch { return null; }
}

export function borrarPartida() {
  try { localStorage.removeItem(CLAVE); } catch { /* nada */ }
}

// Una jugada de la bitácora. Mantener los campos planos para que sirvan tal cual en Firestore.
export const nuevaJugada = (jugador, texto, datos = {}) => ({
  t: Date.now(),
  jugador,
  texto,
  ...datos,
});
