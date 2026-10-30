import './lib/polyfills' // first: other modules use these at load time
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { registerServiceWorker } from './lib/offline'
import './styles.css'

registerServiceWorker()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// index.html's "Loading…" (or error) box goes once the app has drawn something
const started = () => (document.getElementById('root')!.childElementCount ? document.getElementById('boot')?.remove() : requestAnimationFrame(started))
requestAnimationFrame(started)
