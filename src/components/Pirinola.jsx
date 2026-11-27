import { useEffect, useRef } from 'react';

// Pirinola de los retos, en 3D: un prisma de 6 caras (una por castigo) que gira de verdad sobre
// su eje, da vuelta y media a la mesa, se tambalea cada vez más mientras frena y cae de lado.
// Al caer: sacudida, polvo, estrellitas y un sello grande con la cara que quedó arriba.
//
// Capas (de afuera hacia adentro), cada una con su propia animación para que no se estorben:
//   piri-ruta      -> el recorrido sobre la mesa (translate)
//   piri-tambalea  -> el bamboleo y la caída (rotate desde la punta)
//   piri-borrosa   -> desenfoque mientras va rápido (filter; afuera del 3D para no aplanarlo)
//   piri-prisma    -> el giro sobre su eje (rotateY), con las 6 caras alrededor
const DURA = 3400;
const VUELTAS = 9;                 // vueltas sobre su eje antes de frenar
const esperar = (ms) => new Promise(r => setTimeout(r, ms));
// Espera a que acabe una animación, o a que pase su duración (lo que llegue primero): si la pestaña
// casi no dibuja cuadros, el aviso de "terminé" (.finished) puede tardar y la pirinola se quedaría trabada.
const acabe = (a, ms) => Promise.race([a.finished, esperar(ms + 60)]);
const sinMovimiento = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const COLORES = ['var(--rotulo-am)', 'var(--chicle)', 'var(--cielo)', 'var(--neon)', 'var(--papel)', '#ff7a1a'];

// Vuelta y media a la mesa en elipse, cerrándose un poco hacia el centro. Sale de la derecha y
// termina a la izquierda: así al caer de lado (hacia la derecha) queda en medio de la mesa.
const ruta = () => Array.from({ length: 19 }, (_, s) => {
  const t = s / 18, a = t * Math.PI * 3, rx = 78 * (1 - t * .45), ry = 16 * (1 - t * .3);
  return { transform: `translate(${(Math.cos(a) * rx).toFixed(1)}px, ${(Math.sin(a) * ry).toFixed(1)}px)`, offset: t };
});
// Bamboleo: casi derecha al principio y cada vez más chueca y más lenta al frenar.
const bamboleo = () => Array.from({ length: 25 }, (_, s) => {
  const t = s / 24, amp = 2 + 17 * t * t, fase = 14 * Math.sqrt(t) * Math.PI;
  return { transform: `rotate(${(amp * Math.sin(fase)).toFixed(1)}deg)`, offset: t };
});

export default function Pirinola({ caras, final, onFin }) {
  const escenaRef = useRef(null), rutaRef = useRef(null), tambRef = useRef(null), borrosaRef = useRef(null), prismaRef = useRef(null), selloRef = useRef(null);
  const finRef = useRef(onFin);
  useEffect(() => { finRef.current = onFin; });

  // Si la cara final no está entre las 6 (por ejemplo "★ Comodín"), toma el lugar de la primera.
  const lados = caras.includes(final) ? caras.slice(0, 6) : [final, ...caras.slice(1, 6)];
  const k = lados.indexOf(final);

  useEffect(() => {
    let vivo = true;
    const anims = [];
    const anima = (el, kf, op) => { const a = el.animate(kf, op); anims.push(a); return a; };
    (async () => {
      if (sinMovimiento) {
        prismaRef.current.style.transform = `rotateY(${-k * 60}deg)`;
        selloRef.current.style.opacity = '1';
        await esperar(600);
        if (vivo) finRef.current();
        return;
      }
      // Gira rapidísimo y frena suave hasta dejar la cara final de frente.
      const giro = -(VUELTAS * 360 + k * 60);
      anima(prismaRef.current, [{ transform: 'rotateY(0deg)' }, { transform: `rotateY(${giro}deg)` }], { duration: DURA, easing: 'cubic-bezier(.12, .7, .22, 1)', fill: 'forwards' });
      anima(borrosaRef.current, [{ filter: 'blur(1.6px)' }, { filter: 'blur(0px)', offset: .55 }, { filter: 'blur(0px)' }], { duration: DURA, fill: 'forwards' });
      anima(rutaRef.current, ruta(), { duration: DURA, easing: 'cubic-bezier(.3, .55, .45, 1)', fill: 'forwards' });
      await acabe(anima(tambRef.current, bamboleo(), { duration: DURA, easing: 'linear', fill: 'forwards' }), DURA);
      if (!vivo) return;
      // Cae de lado con rebote.
      const ultimo = bamboleo().at(-1).transform;
      await acabe(anima(tambRef.current, [
        { transform: ultimo },
        { transform: 'rotate(92deg)', offset: .5, easing: 'ease-out' },
        { transform: 'rotate(74deg)', offset: .7, easing: 'ease-in' },
        { transform: 'rotate(86deg)', offset: .86 },
        { transform: 'rotate(82deg)' },
      ], { duration: 620, easing: 'cubic-bezier(.5, 0, .9, .5)', fill: 'forwards' }), 620);
      if (!vivo) return;
      // Golpe contra la mesa: se sacude todo, sale polvo y estrellitas, y cae el sello.
      anima(escenaRef.current, [0, -5, 6, -4, 3, 0].map((x, s) => ({ transform: `translate(${x}px, ${s % 2 ? 2 : -1}px)` })), { duration: 320 });
      escenaRef.current.querySelectorAll('.piri-polvo, .piri-chispa').forEach((p, s) => {
        const a = (s / 7) * Math.PI * 2;
        anima(p, [
          { opacity: 1, transform: 'translate(0, 0) scale(.3)' },
          { opacity: 0, transform: `translate(${(Math.cos(a) * 70).toFixed(0)}px, ${(Math.sin(a) * 34 - 18).toFixed(0)}px) scale(${p.classList.contains('piri-polvo') ? 1.8 : 1.1}) rotate(${s * 70}deg)` },
        ], { duration: 650, easing: 'cubic-bezier(.2, .8, .3, 1)', fill: 'forwards' });
      });
      await esperar(140);
      selloRef.current.style.opacity = '1';
      await acabe(anima(selloRef.current, [
        { transform: 'translate(-50%, -50%) scale(3) rotate(-24deg)', opacity: 0 },
        { transform: 'translate(-50%, -50%) scale(.92) rotate(-9deg)', opacity: 1, offset: .6 },
        { transform: 'translate(-50%, -50%) scale(1) rotate(-8deg)', opacity: 1 },
      ], { duration: 380, easing: 'cubic-bezier(.3, 1.3, .5, 1)', fill: 'forwards' }), 380);
      await esperar(900);
      if (vivo) finRef.current();
    })().catch((e) => {
      // Cerrar la ventana a media animación cancela las animaciones (AbortError): eso es normal.
      if (e?.name !== 'AbortError') console.warn('Pirinola:', e);
    });
    return () => { vivo = false; anims.forEach(a => a.cancel()); };
  }, [k]);

  return (
    <div className="piri-escena" ref={escenaRef} aria-hidden="true">
      <span className="piri-mesa" />
      <div className="piri-ruta" ref={rutaRef}>
        <span className="piri-sombra" />
        <div className="piri-tambalea" ref={tambRef}>
          <span className="piri-tallo" />
          <div className="piri-borrosa" ref={borrosaRef}>
            <div className="piri-prisma" ref={prismaRef}>
              {lados.map((txt, i) => (
                <span key={i} className="piri-cara-3d" style={{ '--i': i, background: COLORES[i % COLORES.length] }}>{txt}</span>
              ))}
            </div>
          </div>
          <span className="piri-punta" />
        </div>
      </div>
      {[0, 1, 2, 3].map(i => <span key={`p${i}`} className="piri-polvo" />)}
      {[0, 1, 2].map(i => <span key={`c${i}`} className="piri-chispa" />)}
      <span className="piri-sello" ref={selloRef}>{final}</span>
    </div>
  );
}
