export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white/70 dark:bg-black/30 dark:border-white/10">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-slate-600 dark:text-white/70 text-sm">© {new Date().getFullYear()} CurioMindAI. All rights reserved.</p>
        <div className="flex items-center gap-4 text-slate-700 dark:text-white/80">
          <a
            className="hover:text-slate-900 dark:hover:text-white transition"
            href="https://x.com/AbhishekHi38767"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open Twitter"
            title="Twitter/X"
          >
            {/* X logo (two crossing strokes) */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              aria-hidden
            >
              <path d="M4 4 L20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M20 4 L4 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </a>
          <a
            className="hover:text-slate-900 dark:hover:text-white transition"
            href="https://github.com/Savyasachi-2005"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open GitHub"
            title="GitHub"
          >
            <span
              className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 text-[10px] font-semibold dark:border-white/30"
              aria-hidden
            >
              GH
            </span>
          </a>
          <a
            className="hover:text-slate-900 dark:hover:text-white transition"
            href="https://www.linkedin.com/in/abhishek-hiremath-3020692a3"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open LinkedIn"
            title="LinkedIn"
          >
            <span
              className="inline-flex h-6 w-6 items-center justify-center rounded-[6px] border border-slate-300 text-[11px] font-bold dark:border-white/30"
              aria-hidden
            >
              in
            </span>
          </a>
        </div>
      </div>
    </footer>
  )
}
