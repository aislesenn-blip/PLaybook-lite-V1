import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

console.log("App Version: v3-FINAL-IMMEDIATE")

// Force explicit, immediate registration without user prompt
// This fixes the "White Screen" or "Cut in Half" issue caused by the confirm dialog blocking the main thread
registerSW({ immediate: true })

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
