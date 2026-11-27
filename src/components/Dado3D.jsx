// Dado de peluche rosa en 3D. "giros" sube en cada tirada para que el dado ruede.
const PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
const CARA = { 1: 'rotateY(0deg)', 2: 'rotateY(90deg)', 3: 'rotateX(90deg)', 4: 'rotateX(-90deg)', 5: 'rotateY(-90deg)', 6: 'rotateY(180deg)' };
const VISTA = { 1: [0, 0], 2: [0, -90], 3: [-90, 0], 4: [90, 0], 5: [0, 90], 6: [0, 180] };

export default function Dado3D({ valor = 1, giros = 0, tam = 68, girando = false }) {
  const [x, y] = VISTA[valor] || VISTA[1];
  // Vueltas distintas en cada tirada para que no se sienta siempre el mismo giro.
  // Tienen que ser multiplos de 360 o el dado acabaria mostrando otra cara.
  const vueltas = 2 + (giros % 3);
  return (
    <div className={`dado-caja${girando ? ' girando' : ''}`} style={{ width: tam, height: tam }}>
      <div className="dado" style={{ transform: `rotateX(${x + 360 * vueltas * giros}deg) rotateY(${y + 360 * (vueltas + 1) * giros}deg)` }}>
        {[1, 2, 3, 4, 5, 6].map(v => (
          <div key={v} className="cara" style={{ transform: `${CARA[v]} translateZ(${tam / 2}px)` }}>
            {Array.from({ length: 9 }, (_, k) => <span key={k} className={PIPS[v].includes(k) ? 'p' : ''} />)}
          </div>
        ))}
      </div>
    </div>
  );
}
