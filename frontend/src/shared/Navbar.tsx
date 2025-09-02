import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function Navbar() {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark'
  })

  useEffect(() => {
    const html = document.documentElement
    if (dark) {
      html.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      html.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [dark])

  return (
    <nav className="sticky top-0 z-50 bg-white/5 dark:bg-black/30 backdrop-blur border-b border-white/10">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-4 flex items-center justify-between">
        <Link to="/home" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold">✨</div>
          <span className="font-display text-xl tracking-tight">CurioMindAI</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/home" className="text-white/80 hover:text-white transition">Home</Link>
          <a href="#features" className="text-white/80 hover:text-white transition">Features</a>
          <button
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-sm"
            onClick={() => setDark((d) => !d)}
            aria-label="Toggle theme"
          >
            {dark ? 'Light' : 'Dark'} mode
          </button>
        </div>
      </div>
    </nav>
  )
}
