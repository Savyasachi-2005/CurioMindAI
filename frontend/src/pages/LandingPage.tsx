import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../shared/Navbar'
import Footer from '../shared/Footer'
import heroVideo from '../components/vid/cm_vid.mp4'

// API base: set VITE_API_URL in production (e.g., https://your-render-backend.onrender.com)
// Leave unset in dev to use Vite proxy
const API_BASE: string = (import.meta as any).env?.VITE_API_URL || ''

interface Explanation {
  id: string
  question: string
  age: number
  length: 'Short' | 'Medium' | 'Detailed'
  text: string
  createdAt?: number
}

const lengths: Array<Explanation['length']> = ['Short', 'Medium', 'Detailed']
const languages = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'kn', label: 'Kannada' },
  { code: 'ta', label: 'Tamil' },
  { code: 'te', label: 'Telugu' },
  { code: 'ml', label: 'Malayalam' },
  { code: 'bn', label: 'Bengali' },
  { code: 'gu', label: 'Gujarati' },
  { code: 'mr', label: 'Marathi' },
  { code: 'ur', label: 'Urdu' },
]

export default function LandingPage() {
  const uid = () => (typeof crypto !== 'undefined' && (crypto as any).randomUUID ? (crypto as any).randomUUID() : `id_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`)
  const [question, setQuestion] = useState('')
  const [age, setAge] = useState<number>(10)
  const [length, setLength] = useState<Explanation['length']>('Medium')
  const [language, setLanguage] = useState<string>('en')
  const [loading, setLoading] = useState(false)
  const [output, setOutput] = useState<Explanation | null>(null)
  const [notes, setNotes] = useState<Explanation[]>([])
  const [relatedQuestions, setRelatedQuestions] = useState<string[]>([])
  const [typed, setTyped] = useState<string>('')
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const controllerRef = useRef<AbortController | null>(null)
  

  useEffect(() => {
    return () => controllerRef.current?.abort()
  }, [])

  

  // Load notes from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('curiomindai.notes.v1')
      if (raw) {
        const parsed: Explanation[] = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          // Ensure every note has an id and createdAt
          const cleaned = parsed.map((n) => ({
            ...n,
            id: n.id || uid(),
            createdAt: n.createdAt || Date.now(),
          }))
          setNotes(cleaned)
        }
      }
    } catch {
      // ignore
    }
  }, [])

  // Persist notes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('curiomindai.notes.v1', JSON.stringify(notes))
    } catch {
      // ignore
    }
  }, [notes])

  // Related questions are provided by backend per response
  // Typing animation for answer text
  useEffect(() => {
    if (!output?.text) { setTyped(''); return }
    setTyped('')
    const text = output.text
    let i = 0
    const speed = Math.max(10, Math.min(30, Math.floor(2000 / Math.max(20, text.length))))
    const timer = setInterval(() => {
      i++
      setTyped(text.slice(0, i))
      if (i >= text.length) clearInterval(timer)
    }, speed)
    return () => clearInterval(timer)
  }, [output?.text])

  const canSubmit = question.trim().length > 0 && !loading

  async function onSubmit(e?: React.FormEvent, overrideQuestion?: string) {
    e?.preventDefault()
    const q = (overrideQuestion ?? question).trim()
    if (!q || loading) return

    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller

    setLoading(true)
    setOutput(null)
  setRelatedQuestions([])

  try {
      const res = await fetch(`${API_BASE}/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, age, length, language }),
        signal: controller.signal,
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const answerText = String(data?.answer ?? '')
      const item: Explanation = {
        id: uid(),
        question: q,
        age,
        length,
        text: answerText,
        createdAt: Date.now(),
      }
      setOutput(item)
      const rel = Array.isArray(data?.related) ? data.related.slice(0, 5) : []
      setRelatedQuestions(rel)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch explanation.'
      setOutput({
        id: uid(),
        question: q,
        age,
        length,
        text: `Error: ${msg}`,
        createdAt: Date.now(),
      })
    } finally {
      setLoading(false)
    }
  }

  function scrollToId(id: string) {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function addToNotes() {
  if (!output) return
  const item: Explanation = { ...output, id: output.id || uid(), createdAt: output.createdAt ?? Date.now() }
    setNotes((prev) => [item, ...prev])
  }

  function deleteNote(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id))
  }

  function clearNotes() {
    if (!notes.length) return
    const ok = confirm('Clear all saved notes? This cannot be undone.')
    if (!ok) return
    setNotes([])
  }

  function toggleExpand(id: string) {
    setExpanded((e) => ({ ...e, [id]: !e[id] }))
  }

  async function copyNote(n: Explanation) {
    try {
      await navigator.clipboard.writeText(`Q: ${n.question}\n\n${n.text}`)
    } catch {
      // ignore
    }
  }

  const filteredNotes = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return notes
    return notes.filter((n) =>
      n.question.toLowerCase().includes(q) || n.text.toLowerCase().includes(q)
    )
  }, [notes, query])

  async function exportPdf() {
    try {
      const res = await fetch(`${API_BASE}/export?format=pdf`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'curiomindai-notes.pdf'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e) {
      alert('Failed to export PDF')
    }
  }

  async function exportWord() {
    if (!notes.length) return
    // Try backend DOCX first
    try {
      const res = await fetch(`${API_BASE}/export?format=docx`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'curiomindai-notes.docx'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      return
    } catch {
      // Fallback to client-side .doc if backend not available
    }

    const esc = (s: string) => s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br/>')

    const body = notes.map((n, i) => `
      <h3>Q${i + 1}: ${esc(n.question)}</h3>
      <p>${esc(n.text)}</p>
      <hr/>
    `).join('\n')

    const html = `<!DOCTYPE html>
      <html><head><meta charset="utf-8"/>
      <title>CurioMindAI Notes</title>
      <style>
        body{font-family:Segoe UI, Roboto, Helvetica, Arial, sans-serif;}
        h1{font-size:22px;margin:0 0 12px}
        h3{font-size:16px;margin:16px 0 6px}
        p{font-size:14px;line-height:1.5;margin:0 0 10px}
        hr{border:none;border-top:1px solid #ddd;margin:12px 0}
      </style></head>
      <body>
        <h1>CurioMindAI Notes</h1>
        ${body}
      </body></html>`

    const blob = new Blob([html], { type: 'application/msword' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'curiomindai-notes.doc'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  // relatedQuestions provided by backend; rendered below the answer

  // const titleLetters = useMemo(() => 'CurioMindAI'.split(''), [])

  return (
    <div className="min-h-screen flex flex-col text-slate-900 dark:text-white">
      <Navbar />
  {/* Header with brand removed to avoid duplication with Navbar */}

      {/* Hero */}
      <section className="px-4 sm:px-8 pt-4 pb-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-display text-3xl sm:text-5xl md:text-6xl leading-tight mb-4 text-center md:text-left">
              Learn anything, explained for your age.
            </h1>
            <p className="text-slate-700 dark:text-white/85 text-base sm:text-lg mb-6 max-w-prose mx-auto md:mx-0 text-center md:text-left">
              CurioMindAI turns complex topics into simple, friendly explanations and suggests smart follow-up questions to keep your curiosity going.
            </p>
            <div className="flex gap-3 flex-col sm:flex-row justify-center md:justify-start">
              <button className="btn btn-primary" onClick={() => scrollToId('ask')}>Start Learning</button>
              <button className="btn btn-secondary" onClick={() => scrollToId('features')}>Explore Features</button>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-3xl shadow-xl">
              {/* Soft animated glow behind the media */}
              <motion.div
                className="pointer-events-none absolute -inset-6 rounded-[40px] z-0"
                animate={{
                  background: [
                    'radial-gradient(600px 220px at 15% 25%, rgba(0,0,0,.06), rgba(0,0,0,0))',
                    'radial-gradient(600px 220px at 85% 75%, rgba(0,0,0,.06), rgba(0,0,0,0))',
                  ],
                }}
                transition={{ duration: 5, repeat: Infinity, repeatType: 'reverse' }}
              />
              {/* Media container (height adapts to content) */}
              <div className="relative z-10">
                <video
                  className="w-full h-auto object-contain max-h-80 md:max-h-96 bg-black/5"
                  src={heroVideo}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-4 sm:px-8 pb-10">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {[
            { title: 'Ask Questions', desc: 'Type any topic and choose age + length.', icon: '❓' },
            { title: 'AI Explanations', desc: 'Get child-friendly answers with clear language.', icon: '🤖' },
            { title: 'Follow-up Questions', desc: 'Click suggestions to keep exploring.', icon: '✨' },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="card p-5 hover:bg-white/15 transition"
            >
              <div className="h-10 w-10 rounded-xl bg-slate-900/5 border border-slate-200 dark:bg-white/15 dark:border-white/10 flex items-center justify-center text-xl mb-3">{f.icon}</div>
              <h3 className="text-xl font-semibold mb-1">{f.title}</h3>
              <p className="text-slate-600 dark:text-white/80">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

  <main id="ask" ref={askRef} className="px-4 sm:px-8 pb-12 max-w-6xl mx-auto grid md:grid-cols-5 gap-4 sm:gap-6 min-w-0">
        <section className="md:col-span-3 card p-6 min-w-0">
          <h2 className="text-xl font-semibold mb-4">Ask anything</h2>
          <form onSubmit={onSubmit} className="space-y-4">
            <input
              className="input"
              placeholder="Explain quantum entanglement like I'm five..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />

            <div className="grid sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-slate-700 dark:text-white/80 mb-1">Age</label>
                <input
                  type="range"
                  min={5}
                  max={18}
                  step={1}
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value, 10))}
                  className="range"
                />
                <div className="mt-1 flex justify-between text-xs text-slate-600 dark:text-white/70">
                  <span>5</span>
                  <span className="text-slate-900 dark:text-white">Age: {age}</span>
                  <span>18</span>
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-700 dark:text-white/80 mb-1">Length</label>
                <select
                  className="select"
                  value={length}
                  onChange={(e) => setLength(e.target.value as Explanation['length'])}
                >
                  {lengths.map((l) => (
                    <option key={l} value={l} className="text-slate-900">{l}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-700 dark:text-white/80 mb-1">Language</label>
                <select
                  className="select"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  {languages.map((l) => (
                    <option key={l.code} value={l.code} className="text-slate-900">{l.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button type="submit" className="btn btn-primary w-full" disabled={!canSubmit}>
                  Generate
                </button>
              </div>
            </div>
          </form>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Explanation</h3>
            <div className="card p-4 min-h-[120px] overflow-x-hidden">
              {loading ? (
                <div className="flex items-center gap-3 text-slate-700 dark:text-white/80">
                  <div className="spinner" />
                  <span>Thinking…</span>
                </div>
              ) : output ? (
                <div className="space-y-4">
                  <p className="whitespace-pre-wrap leading-relaxed break-anywhere">{typed || output.text}</p>
                  <button
                    className="btn btn-secondary"
                    onClick={async () => {
                      addToNotes()
                      try {
                        await fetch(`${API_BASE}/notes/add`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ question: output.question, explanation: output.text })
                        })
                      } catch {
                        // ignore network errors for MVP
                      }
                    }}
                  >
                    Add to Notes
                  </button>

                  {relatedQuestions.length > 0 && (
                    <div>
                      <p className="text-slate-700 dark:text-white/80 mb-2">You may also like to ask about…</p>
                      <div className="flex flex-wrap gap-2 whitespace-normal">
                        {relatedQuestions.map((s: string) => (
                          <button
                            key={s}
            className="px-3 py-1.5 rounded-full text-sm transition shrink-0 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 dark:bg-white/10 dark:hover:bg-white/20 dark:border-white/15 dark:text-white"
                            onClick={() => {
                              setQuestion(s)
                              onSubmit(undefined, s)
                            }}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-slate-500 dark:text-white/60">Your explanation will appear here.</p>
              )}
            </div>
          </div>
        </section>

        <aside className="md:col-span-2 card p-6">
          <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Notes</h2>
              <p className="text-xs text-white/70">Saved: {notes.length}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search notes..."
                className="input h-10 w-full sm:w-56 flex-1 min-w-0"
              />
              <button className="btn btn-secondary" onClick={exportPdf} disabled={!notes.length}>PDF</button>
              <button className="btn btn-secondary" onClick={exportWord} disabled={!notes.length}>Word</button>
              <button className="btn btn-secondary" onClick={clearNotes} disabled={!notes.length}>Clear</button>
            </div>
          </div>
          {notes.length === 0 ? (
            <p className="text-slate-500 dark:text-white/60">No notes yet. Add an explanation to save it.</p>
          ) : filteredNotes.length === 0 ? (
            <p className="text-slate-500 dark:text-white/60">No notes match your search.</p>
          ) : (
            <ul className="space-y-3 max-h-[60vh] overflow-auto pr-2">
              {filteredNotes.map((n) => {
                const isOpen = !!expanded[n.id]
                const text = isOpen ? n.text : (n.text.length > 240 ? n.text.slice(0, 240) + '…' : n.text)
                const when = n.createdAt ? new Date(n.createdAt).toLocaleString() : ''
                return (
                  <li key={n.id} className="card p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm text-slate-800 dark:text-white/90 truncate">Q: {n.question}</p>
                        {when && <p className="text-xs text-slate-500 dark:text-white/60">Saved: {when}</p>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button title="Copy" onClick={() => copyNote(n)} className="px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 text-sm">📋</button>
                        <button title={isOpen ? 'Collapse' : 'Expand'} onClick={() => toggleExpand(n.id)} className="px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 text-sm">{isOpen ? '▴' : '▾'}</button>
                        <button title="Delete" onClick={() => deleteNote(n.id)} className="px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 text-sm">🗑️</button>
                      </div>
                    </div>
                    <p className="whitespace-pre-wrap text-white leading-relaxed mt-2 break-anywhere">{text}</p>
                  </li>
                )
              })}
            </ul>
          )}
        </aside>
  </main>

  <Footer />

  {/* Removed fadeUp keyframes (used only by the old header) */}
    </div>
  )
}
