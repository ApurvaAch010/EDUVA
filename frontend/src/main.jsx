import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import { RouterComponent } from './router/route.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterComponent />
  </StrictMode>,
)
