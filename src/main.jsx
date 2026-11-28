import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/unifrakturmaguntia/400.css'
import '@fontsource/anton/400.css'
import '@fontsource/archivo/400.css'
import '@fontsource/archivo/600.css'
import '@fontsource/archivo/700.css'
import '@fontsource/bungee/400.css'
import '@fontsource/permanent-marker/400.css'
import '@fontsource/press-start-2p/400.css'
import './estilos/tokens.css'
import './index.css'
import Raiz from './Raiz.jsx'

// En la versión publicada, el service worker guarda el juego para que abra sin internet
// y se pueda instalar como app. En `npm run dev` no se usa (si no, verías cambios viejos).
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}))
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Raiz />
  </StrictMode>
)
