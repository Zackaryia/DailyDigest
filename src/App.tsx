import { Routes, Route } from "react-router-dom"
import { useEffect } from "react"
import HomePage from "./pages/HomePage"
import BriefingPage from "./pages/BriefingPage"
import { SidePanelCedarChat } from './cedar/components/chatComponents/SidePanelCedarChat'
import { initializeCedarOS, configureDailyDigest } from './cedar/cedarConfig'

function App() {
  useEffect(() => {
    // Initialize Cedar-OS with our custom Daily Digest provider
    const initCedar = async () => {
      try {
        console.log('Initializing Cedar-OS for Daily Digest...')
        
        // Initialize the provider
        const success = await initializeCedarOS()
        
        if (success) {
          // Configure for Daily Digest use case
          configureDailyDigest()
          console.log('Cedar-OS fully configured for Daily Digest')
        } else {
          console.warn('Cedar-OS initialization failed, chat may not work')
        }
      } catch (error) {
        console.error('Cedar-OS setup error:', error)
      }
    }
    
    initCedar()
  }, [])

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/briefing" element={<BriefingPage />} />
    </Routes>
  )
}

export default App
