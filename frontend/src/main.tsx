import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import LandingPage from './pages/LandingPage'
import LoadingPage from './pages/LoadingPage'
import HomeGate from './pages/HomeGate'
import logo from './components/pics/logo_fin.png'

// Attach favicon dynamically (works with Vite assets)
const ensureFavicon = () => {
  const link = document.querySelector("link[rel='icon']") as HTMLLinkElement | null
  if (link) {
    link.type = 'image/png'
    link.href = logo
    return
  }
  const l = document.createElement('link')
  l.rel = 'icon'
  l.type = 'image/png'
  l.href = logo
  document.head.appendChild(l)
}
ensureFavicon()

// Always show loader on refresh by using '/' as the entry, which auto-navigates to '/home'.
const router = createBrowserRouter([
  { path: '/', element: <LoadingPage auto durationMs={3500} /> },
  { path: '/home', element: <HomeGate /> },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
