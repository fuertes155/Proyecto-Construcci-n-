import React from 'react'
import ReactDOM from 'react-dom/client'
// Tipografía autoalojada (sin peticiones a terceros): Barlow para texto y cifras,
// Barlow Condensed para títulos.
import '@fontsource/barlow/latin-400.css'
import '@fontsource/barlow/latin-500.css'
import '@fontsource/barlow/latin-600.css'
import '@fontsource/barlow/latin-700.css'
import '@fontsource/barlow/latin-ext-400.css'
import '@fontsource/barlow/latin-ext-500.css'
import '@fontsource/barlow/latin-ext-600.css'
import '@fontsource/barlow/latin-ext-700.css'
import '@fontsource/barlow-condensed/latin-600.css'
import '@fontsource/barlow-condensed/latin-700.css'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
