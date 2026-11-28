// Service worker: guarda el juego en el aparato para que abra aunque no haya internet.
// Solo se usa en la versión publicada (ver main.jsx), no mientras programas con `npm run dev`.
// Si cambias este archivo, sube el número de CACHE para que los aparatos tiren lo viejo.
const CACHE = 'oca-v1';

// Las 60 fotos de la lona y las de la ruleta (~1.7 MB): se guardan desde el principio
// para que el tablero salga completo aunque la primera partida sea sin internet.
const FOTOS = [
  ...Array.from({ length: 60 }, (_, k) => `/lona/casilla-${String(k + 1).padStart(2, '0')}.jpeg`),
  '/lona/ruleta-trofeo-1.jpeg', '/lona/ruleta-trofeo-2.jpeg',
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(async c => {
    await c.addAll(['/', '/manifest.webmanifest', '/icono-192.png']);
    await Promise.allSettled(FOTOS.map(f => c.add(f)));   // si una foto falla, las demás se guardan igual
  }));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const guardar = (req, res) => { if (res.ok) { const copia = res.clone(); caches.open(CACHE).then(c => c.put(req, copia)); } return res; };

self.addEventListener('fetch', (e) => {
  const req = e.request;
  // Firebase y todo lo de fuera va directo a internet: la sala tiene que estar al día.
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  // La página: primero internet (así llega la versión nueva); sin internet, la guardada.
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(res => guardar('/', res)).catch(() => caches.match('/')));
    return;
  }
  // Código, letras e imágenes: lo guardado primero (es más rápido); si no está, se baja y se guarda.
  e.respondWith(caches.match(req).then(g => g || fetch(req).then(res => guardar(req, res))));
});
