import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../shared/Navbar'
import Footer from '../shared/Footer'

interface Explanation {
  id: string
  question: string
  age: number
  length: 'Short' | 'Medium' | 'Detailed'
  text: string
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
  const [question, setQuestion] = useState('')
  const [age, setAge] = useState<number>(10)
  const [length, setLength] = useState<Explanation['length']>('Medium')
  const [language, setLanguage] = useState<string>('en')
  const [loading, setLoading] = useState(false)
  const [output, setOutput] = useState<Explanation | null>(null)
  const [notes, setNotes] = useState<Explanation[]>([])
  const [relatedQuestions, setRelatedQuestions] = useState<string[]>([])
  const [typed, setTyped] = useState<string>('')
  const controllerRef = useRef<AbortController | null>(null)
  const askRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    return () => controllerRef.current?.abort()
  }, [])

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
      const res = await fetch('/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, age, length, language }),
        signal: controller.signal,
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const answerText = String(data?.answer ?? '')
      const item: Explanation = {
        id: crypto.randomUUID(),
        question: q,
        age,
        length,
        text: answerText,
      }
      setOutput(item)
      const rel = Array.isArray(data?.related) ? data.related.slice(0, 5) : []
      setRelatedQuestions(rel)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch explanation.'
      setOutput({
        id: crypto.randomUUID(),
        question: q,
        age,
        length,
        text: `Error: ${msg}`,
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
    if (output) setNotes((prev) => [output, ...prev])
  }

  async function exportPdf() {
    try {
      const res = await fetch('/export?format=pdf')
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
      const res = await fetch('/export?format=docx')
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
    <div className="min-h-screen flex flex-col text-white bg-gradient-to-br from-indigo-900 via-violet-800 to-sky-500 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
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
            <p className="text-white/85 text-base sm:text-lg mb-6 max-w-prose mx-auto md:mx-0 text-center md:text-left">
              CurioMindAI turns complex topics into simple, friendly explanations and suggests smart follow-up questions to keep your curiosity going.
            </p>
            <div className="flex gap-3 flex-col sm:flex-row justify-center md:justify-start">
              <button className="btn btn-primary" onClick={() => scrollToId('ask')}>Start Learning</button>
              <button className="btn btn-secondary" onClick={() => scrollToId('features')}>Explore Features</button>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative h-56 sm:h-64 md:h-72"
          >
            <div className="absolute inset-0 rounded-3xl bg-white/10 border border-white/10 backdrop-blur-md" />
            <motion.div
              className="absolute -inset-4 rounded-[32px]"
              animate={{
                background: [
                  'radial-gradient(600px 200px at 10% 20%, rgba(255,255,255,.25), rgba(255,255,255,0))',
                  'radial-gradient(600px 200px at 90% 80%, rgba(255,255,255,.25), rgba(255,255,255,0))',
                ],
              }}
              transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse' }}
            />
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
              <div className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center text-xl mb-3">{f.icon}</div>
              <h3 className="text-xl font-semibold mb-1">{f.title}</h3>
              <p className="text-white/80">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

  <main id="ask" ref={askRef} className="px-4 sm:px-8 pb-12 max-w-6xl mx-auto grid md:grid-cols-5 gap-4 sm:gap-6">
        <section className="md:col-span-3 card p-6">
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
                <label className="block text-sm text-white/80 mb-1">Age</label>
                <input
                  type="range"
                  min={5}
                  max={18}
                  step={1}
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value, 10))}
                  className="range"
                />
                <div className="mt-1 flex justify-between text-xs text-white/70">
                  <span>5</span>
                  <span className="text-white">Age: {age}</span>
                  <span>18</span>
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/80 mb-1">Length</label>
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
                <label className="block text-sm text-white/80 mb-1">Language</label>
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
            <div className="card p-4 min-h-[120px]">
              {loading ? (
                <div className="flex items-center gap-3 text-white/80">
                  <div className="spinner" />
                  <span>Thinking…</span>
                </div>
              ) : output ? (
                <div className="space-y-4">
                  <p className="whitespace-pre-wrap leading-relaxed">{typed || output.text}</p>
                  <button
                    className="btn btn-secondary"
                    onClick={async () => {
                      addToNotes()
                      try {
                        await fetch('/notes/add', {
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
                      <p className="text-white/80 mb-2">You may also like to ask about…</p>
          <div className="flex flex-wrap md:flex-wrap gap-2 overflow-x-auto md:overflow-visible whitespace-nowrap md:whitespace-normal -mx-1 px-1">
                        {relatedQuestions.map((s: string) => (
                          <button
                            key={s}
            className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-sm transition shrink-0"
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
                <p className="text-white/60">Your explanation will appear here.</p>
              )}
            </div>
          </div>
        </section>

        <aside className="md:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">Notes</h2>
            <div className="flex gap-2">
              <button className="btn btn-secondary" onClick={exportPdf} disabled={!notes.length}>Export as PDF</button>
              <button className="btn btn-secondary" onClick={exportWord} disabled={!notes.length}>Export to Word</button>
            </div>
          </div>
          {notes.length === 0 ? (
            <p className="text-white/60">No notes yet. Add an explanation to save it.</p>
          ) : (
            <ul className="space-y-3 max-h-[60vh] overflow-auto pr-2">
              {notes.map((n) => (
                <li key={n.id} className="card p-3">
                  <p className="text-sm text-white/80 mb-1">Q: {n.question}</p>
                  <p className="whitespace-pre-wrap text-white leading-relaxed">{n.text}</p>
                </li>
              ))}
            </ul>
          )}
        </aside>
  </main>

  <Footer />

  {/* Removed fadeUp keyframes (used only by the old header) */}
    </div>
  )
}
