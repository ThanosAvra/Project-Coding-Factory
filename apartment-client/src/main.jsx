import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/global.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { checkDateInputSupport } from './utils/dateInputFallback'

// Check for date input support and apply fallback if needed
if (typeof window !== 'undefined') {
  checkDateInputSupport();
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
