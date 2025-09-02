export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-white/5 dark:bg-black/30">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-white/70 text-sm">© {new Date().getFullYear()} CurioMindAI. All rights reserved.</p>
        <div className="flex items-center gap-4 text-white/80">
          <a className="hover:text-white transition" href="#">Twitter</a>
          <a className="hover:text-white transition" href="#">GitHub</a>
          <a className="hover:text-white transition" href="#">LinkedIn</a>
        </div>
      </div>
    </footer>
  )
}
