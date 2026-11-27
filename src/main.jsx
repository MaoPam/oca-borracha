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
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
