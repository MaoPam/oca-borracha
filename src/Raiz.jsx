import { Suspense, lazy } from 'react';
import App from './App.jsx';

// Con ?sala=CODIGO en el link se abre la vista del cel; si no, el juego normal.
// La vista del cel (y Firebase) solo se descarga cuando se necesita.
const Cel = lazy(() => import('./components/Cel.jsx'));

export default function Raiz() {
  const sala = new URLSearchParams(window.location.search).get('sala');
  if (sala === null) return <App />;
  return (
    <Suspense fallback={<p className="cel-cargando">Abriendo la sala…</p>}>
      <Cel codigo={sala} />
    </Suspense>
  );
}
