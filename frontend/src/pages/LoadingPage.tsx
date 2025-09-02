import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

const title = 'CurioMindAI'

function LoadingPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const t = setTimeout(() => navigate('/home'), 2200)
    return () => clearTimeout(t)
  }, [navigate])

  const letters = useMemo(() => title.split(''), [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-800 to-cyan-500">
      <div className="text-center">
        <div className="flex gap-1 sm:gap-2 justify-center mb-3">
          {letters.map((ch, i) => (
            <span
              key={i}
              className="font-display text-4xl sm:text-6xl md:text-7xl tracking-tight inline-block text-white"
              style={{
                animation: 'fadeUp 600ms ease both',
                animationDelay: `${i * 60}ms`,
              }}
            >
              {ch}
            </span>
          ))}
        </div>
        <p className="text-white/90 text-lg sm:text-xl">Big ideas, made little.</p>
      </div>

      <style>
        {`@keyframes fadeUp{0%{opacity:0;transform:translateY(8px) scale(.98)}100%{opacity:1;transform:translateY(0) scale(1)}}`}
      </style>
    </div>
  )
}

export default LoadingPage
