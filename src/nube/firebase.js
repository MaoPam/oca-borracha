// Conexión con Firebase para la sala de cels (extra opcional).
// Este archivo se carga solo cuando alguien abre o se une a una sala (import dinámico en App.jsx):
// si nadie abre sala, el juego nunca toca internet ni descarga Firebase.
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, collection, getDoc, setDoc, addDoc, deleteDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';

// Los datos salen de .env.local (ver .env.example). Sin ellos no hay sala.
const config = {
  apiKey: import.meta.env.VITE_FB_API_KEY,
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FB_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FB_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FB_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FB_APP_ID,
};

// Se conecta una sola vez y entra de forma anónima (cada aparato recibe un uid sin hacer cuenta).
let conexion = null;
export function conectar() {
  if (!conexion) {
    conexion = (async () => {
      const app = initializeApp(config);
      const { user } = await signInAnonymously(getAuth(app));
      return { db: getFirestore(app), uid: user.uid };
    })();
    conexion.catch(() => { conexion = null; });   // si falló (sin internet), el siguiente intento vuelve a probar
  }
  return conexion;
}

// Firestore no acepta valores undefined: pasar por JSON los quita.
const limpio = (x) => JSON.parse(JSON.stringify(x));

// Códigos de 4 letras sin las que se confunden (O/0, I/1).
const LETRAS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const codigoNuevo = () => Array.from({ length: 4 }, () => LETRAS[Math.floor(Math.random() * LETRAS.length)]).join('');

// Abre una sala con un código libre y publica el estado inicial. Devuelve el código.
export async function abrirSala(estado) {
  const { db, uid } = await conectar();
  for (let intento = 0; intento < 5; intento++) {
    const codigo = codigoNuevo();
    const ref = doc(db, 'salas', codigo);
    if ((await getDoc(ref)).exists()) continue;
    await setDoc(ref, { anfitrion: uid, estado: limpio(estado), creada: serverTimestamp(), actualizada: serverTimestamp() });
    return codigo;
  }
  throw new Error('No encontré un código libre, intenta otra vez.');
}

// El anfitrión vuelve a publicar la partida cada vez que cambia.
export async function publicar(codigo, estado) {
  const { db, uid } = await conectar();
  await setDoc(doc(db, 'salas', codigo), { anfitrion: uid, estado: limpio(estado), actualizada: serverTimestamp() }, { merge: true });
}

export async function cerrarSala(codigo) {
  const { db } = await conectar();
  await deleteDoc(doc(db, 'salas', codigo));
}

// Los cels escuchan la sala: cada cambio llama a alCambiar con el estado (o null si se cerró).
export async function escucharSala(codigo, alCambiar, alError) {
  const { db } = await conectar();
  return onSnapshot(doc(db, 'salas', codigo), (s) => alCambiar(s.exists() ? s.data().estado : null), (e) => alError?.(e));
}

// ---------- Asientos: qué cel es qué jugador ----------
// Cada cel escribe solo su propio asiento (salas/CODIGO/asientos/SU_UID).
export async function tomarAsiento(codigo, jugador, nombre) {
  const { db, uid } = await conectar();
  await setDoc(doc(db, 'salas', codigo, 'asientos', uid), { jugador, nombre, hora: serverTimestamp() });
}

// El anfitrión escucha los asientos: alCambiar recibe { uid: número de jugador }.
export async function escucharAsientos(codigo, alCambiar) {
  const { db } = await conectar();
  return onSnapshot(collection(db, 'salas', codigo, 'asientos'), (q) => {
    const mapa = {};
    q.forEach(d => { mapa[d.id] = d.data().jugador; });
    alCambiar(mapa);
  });
}

// ---------- Pedidos: lo que el cel le pide a la pantalla principal ----------
// El cel no cambia la partida: deja un pedido ("tirar", "usar comodín"...) y el anfitrión decide.
export async function pedir(codigo, tipo, datos = {}) {
  const { db, uid } = await conectar();
  await addDoc(collection(db, 'salas', codigo, 'pedidos'), { ...limpio(datos), tipo, uid, hora: serverTimestamp() });
}

// El anfitrión recibe cada pedido nuevo una sola vez y lo borra para que no se repita.
export async function escucharPedidos(codigo, alPedido) {
  const { db } = await conectar();
  return onSnapshot(collection(db, 'salas', codigo, 'pedidos'), (q) => {
    q.docChanges().forEach(c => {
      if (c.type !== 'added') return;
      alPedido(c.doc.data());
      deleteDoc(c.doc.ref).catch(() => {});
    });
  });
}
