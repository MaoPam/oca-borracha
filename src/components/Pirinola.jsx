import { useEffect, useRef } from 'react';

// Pirinola de los retos: recorre la mesa girando, se tambalea cada vez más y cae.
// La cara final ya viene decidida (final); al terminar de caer avisa con onFin.
//
// Las caras cambian escribiendo directo en el texto del cuerpo (ref) y no con estado de React:
// cambian unas 25 veces en 2.6 segundos y así no se vuelve a dibujar toda la App cada vez.
const DURA = 2600;
const esperar = (ms) => new Promise(r => setTimeout(r, ms));
const sinMovimiento = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export default function Pirinola({ caras, final, onFin }) {
  const mueveRef = useRef(null), giraRef = useRef(null), caraRef = useRef(null);
  const finRef = useRef(onFin);
  useEffect(() => { finRef.current = onFin; });

  useEffect(() => {
    let vivo = true;
    const anims = [];
    const cara = caraRef.current;
    (async () => {
      if (sinMovimiento) {
        cara.textContent = final;
        await esperar(500);
        if (vivo) finRef.current();
        return;
      }
      // Recorre la mesa en curva mientras se tambalea más y más. piri-mueve mide lo mismo que el
      // carril, así que translate(100%) es llegar al otro lado de la mesa.
      anims.push(mueveRef.current.animate(
        [{ transform: 'translate(0, 0)' }, { transform: 'translate(28%, -10px)', offset: .25 }, { transform: 'translate(64%, 4px)', offset: .55 }, { transform: 'translate(86%, -6px)', offset: .8 }, { transform: 'translate(94%, 0)' }],
        { duration: DURA, easing: 'cubic-bezier(.25, .6, .4, 1)', fill: 'forwards' },
      ));
      anims.push(giraRef.current.animate(
        [-4, 5, -6, 8, -11, 14, -18, 22].map(g => ({ transform: `rotate(${g}deg)` })),
        { duration: DURA, easing: 'linear', fill: 'forwards' },
      ));
      // Las caras pasan cada vez más lento: así se nota que va frenando.
      let t = 0, k = 0;
      while (vivo && t < DURA - 150) {
        const paso = 45 + (t / DURA) * 230;
        cara.textContent = caras[k++ % caras.length];
        await esperar(paso);
        t += paso;
      }
      if (!vivo) return;
      cara.textContent = final;
      const cae = giraRef.current.animate(
        [{ transform: 'rotate(22deg)' }, { transform: 'rotate(80deg)', offset: .7 }, { transform: 'rotate(70deg)', offset: .85 }, { transform: 'rotate(76deg)' }],
        { duration: 520, easing: 'ease-in', fill: 'forwards' },
      );
      anims.push(cae);
      await cae.finished;
      await esperar(450);
      if (vivo) finRef.current();
    })().catch(() => { /* se cerró la ventana a media animación */ });
    return () => { vivo = false; anims.forEach(a => a.cancel()); };
  }, [caras, final]);

  return (
    <div className="piri-escena" aria-hidden="true">
      <span className="piri-mesa" />
      <div className="piri-carril">
        <div className="piri-mueve" ref={mueveRef}>
          <span className="piri-sombra" />
          <div className="piri-gira" ref={giraRef}>
            <span className="piri-tallo" />
            <span className="piri-cuerpo" ref={caraRef} />
            <span className="piri-punta" />
          </div>
        </div>
      </div>
    </div>
  );
}
