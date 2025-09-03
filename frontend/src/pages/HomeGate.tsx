import { useEffect, useState } from 'react'
import LoadingPage from './LoadingPage'
import LandingPage from './LandingPage'

export default function HomeGate() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const fromRoot = sessionStorage.getItem('sawSplash') === 'from-root'
    if (fromRoot) {
      sessionStorage.removeItem('sawSplash')
      setReady(true)
      return
    }
  const t = setTimeout(() => setReady(true), 2500)
    return () => clearTimeout(t)
  }, [])

  if (!ready) return <LoadingPage auto={false} />
  return <LandingPage />
}
