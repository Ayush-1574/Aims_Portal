import { StrictMode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './core/context/AuthContext'
import './index.css'
import App from './App.jsx'
import { Toaster } from "sonner";



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
   <BrowserRouter>
      <App />
      <Toaster richColors position="top-right" />
   </BrowserRouter>
</AuthProvider>

  </StrictMode>,
)
