import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../components/pics/logo_fin.png'

const title = 'CurioMindAI'

type LoadingProps = {
  auto?: boolean
  durationMs?: number
}

function LoadingPage({ auto = true, durationMs = 5000 }: LoadingProps) {
  const navigate = useNavigate()

  useEffect(() => {
    if (!auto) return
    const t = setTimeout(() => navigate('/home'), durationMs)
  try { sessionStorage.setItem('sawSplash', 'from-root') } catch {}
    return () => clearTimeout(t)
  }, [navigate, auto, durationMs])

  const letters = useMemo(() => title.split(''), [])

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#0b1220] via-[#0a1a2a] to-[#0b1220] text-white">
      {/* Aurora overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-90 aurora" />
      <div className="relative text-center px-6">
        {/* Logo orb */}
        <div className="mx-auto mb-6 h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-sky-400 shadow-lg shadow-emerald-500/20 grid place-items-center animate-pulse overflow-hidden ring-2 ring-emerald-400/30">
          <img src={logo} alt="CurioMindAI" className="h-10 w-10 sm:h-12 sm:w-12 object-contain" />
        </div>
        {/* Title with smoother stagger */}
        <div className="flex gap-1 sm:gap-2 justify-center mb-3">
          {letters.map((ch, i) => (
            <span
              key={i}
              className="font-display text-4xl sm:text-6xl md:text-7xl tracking-tight inline-block"
              style={{
                animation: 'lift 700ms cubic-bezier(.2,.7,.2,1) both',
                animationDelay: `${i * 70}ms`,
              }}
            >
              {ch}
            </span>
          ))}
        </div>
        <p className="text-white/85 text-base sm:text-lg">Big ideas, made little.</p>
        {/* Progress bar */}
        <div className="mt-6 h-1 w-56 sm:w-72 mx-auto overflow-hidden rounded-full bg-white/15">
          <div className="h-full w-1/3 bg-gradient-to-r from-emerald-300 to-sky-300 animate-slide" />
        </div>
      </div>

      <style>
        {`
        @keyframes lift { 0% { opacity: 0; transform: translateY(10px) scale(.98);} 100% { opacity: 1; transform: translateY(0) scale(1);} }
        @keyframes slide { 0% { transform: translateX(-100%);} 100% { transform: translateX(300%);} }
        .animate-slide { animation: slide 1.2s ease-in-out infinite; }
        .aurora {
          background:
            radial-gradient(600px 300px at 12% 18%, rgba(16, 185, 129, 0.18), rgba(0,0,0,0) 70%),
            radial-gradient(800px 360px at 88% 78%, rgba(56, 189, 248, 0.18), rgba(0,0,0,0) 70%),
            radial-gradient(700px 340px at 55% 55%, rgba(139, 92, 246, 0.12), rgba(0,0,0,0) 70%);
          animation: auroraFloat 12s ease-in-out infinite alternate;
          filter: blur(2px);
        }
        @keyframes auroraFloat {
          0% { transform: translateY(-1%) translateX(-1%) scale(1); filter: hue-rotate(0deg) blur(2px); }
          100% { transform: translateY(1%) translateX(1%) scale(1.02); filter: hue-rotate(20deg) blur(2px); }
        }
        `}
      </style>
    </div>
  )
}

export default LoadingPage
