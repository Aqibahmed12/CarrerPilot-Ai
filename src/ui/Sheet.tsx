import { AnimatePresence, motion } from 'motion/react'
import { useEffect, type ReactNode } from 'react'
import { EASE } from '../lib/motion'

export function Sheet({ open, onClose, kicker, title, children }: { open: boolean; onClose: () => void; kicker: string; title: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])
  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          role="dialog"
          aria-label={title}
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.5, ease: EASE }}
          className="panel fixed bottom-0 right-0 top-0 z-40 w-[min(440px,92vw)] overflow-y-auto !rounded-none border-y-0 border-r-0 p-8"
        >
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <p className="mono-label mb-2">{kicker}</p>
              <h2 className="font-display text-[32px] leading-none">{title}</h2>
            </div>
            <button type="button" onClick={onClose} className="link-draw cursor-pointer bg-transparent p-0 font-mono text-[11px] uppercase tracking-[.12em]">Close</button>
          </div>
          {children}
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
