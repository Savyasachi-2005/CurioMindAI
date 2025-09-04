import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '../components/pics/logo_fin.png'

export default function Navbar() {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark'
  })
  const [open, setOpen] = useState(false)

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
  <nav className="sticky top-0 z-50 bg-white/70 dark:bg-black/30 backdrop-blur border-b border-slate-200 dark:border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link to="/home" className="flex items-center gap-2 min-w-0">
            <img src={logo} alt="CurioMindAI" className="h-9 w-9 rounded-xl object-cover" />
            <span className="font-display text-xl tracking-tight truncate">CurioMindAI</span>
          </Link>
          {/* Desktop actions */}
          <div className="hidden sm:flex items-center gap-4">
            <Link to="/home" className="text-slate-700 hover:text-slate-900 dark:text-white/80 dark:hover:text-white transition">Home</Link>
            <a href="#features" className="text-slate-700 hover:text-slate-900 dark:text-white/80 dark:hover:text-white transition">Features</a>
            <button
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-sm"
              onClick={() => setDark((d) => !d)}
              aria-label="Toggle theme"
            >
              {dark ? 'Light' : 'Dark'} mode
            </button>
          </div>
          {/* Mobile hamburger */}
          <div className="sm:hidden flex items-center gap-2">
            <button
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-sm"
              onClick={() => setDark((d) => !d)}
              aria-label="Toggle theme"
            >
              {dark ? '☀️' : '🌙'}
            </button>
            <button
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15"
              onClick={() => setOpen((o) => !o)}
              aria-label="Toggle menu"
              aria-expanded={open}
            >
              ☰
            </button>
          </div>
        </div>
        {/* Mobile menu */}
        {open && (
          <div className="sm:hidden mt-3 grid gap-2">
            <Link to="/home" onClick={() => setOpen(false)} className="px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 dark:bg-white/10 dark:hover:bg-white/20 dark:border-white/15">Home</Link>
            <a href="#features" onClick={() => setOpen(false)} className="px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 dark:bg-white/10 dark:hover:bg-white/20 dark:border-white/15">Features</a>
          </div>
        )}
      </div>
    </nav>
  )
}
