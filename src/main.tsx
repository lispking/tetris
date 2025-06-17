import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { initGA, logPageView } from './utils/analytics'
import { AnalyticsProvider } from './contexts/AnalyticsContext'
import './index.css'
import App from './App.tsx'

// Initialize Google Analytics
const AnalyticsWrapper = () => {
  useEffect(() => {
    initGA()
    logPageView(window.location.pathname, document.title)
  }, [])

  return (
    <AnalyticsProvider>
      <App />
    </AnalyticsProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AnalyticsWrapper />
  </StrictMode>
)
