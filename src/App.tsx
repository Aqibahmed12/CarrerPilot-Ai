import { useEffect } from 'react'
import { AnimatePresence } from 'motion/react'
import { Mark } from './ui/Mark'
import { Thread } from './ui/Thread'
import { STAGES } from './stages'
import { useApp } from './lib/store'

export default function App() {
  const stage = useApp((s) => s.stage)
  const go = useApp((s) => s.go)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const cur = useApp.getState().stage
      if (e.key === 'ArrowRight') go(cur + 1)
      if (e.key === 'ArrowLeft') go(cur - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go])

  const Current = STAGES[stage].C
  return (
    <div className="relative h-full w-full overflow-hidden">
      <header className="fixed left-[6vw] top-8 z-30 flex items-center gap-3">
        <Mark />
        <span className="font-display text-[22px] leading-none tracking-[0.02em]">meridian</span>
      </header>
      <Thread stage={stage} />
      <AnimatePresence mode="wait">
        <Current key={stage} />
      </AnimatePresence>
      <nav aria-label="Chapters" className="fixed bottom-8 right-[6vw] z-30 flex gap-5">
        {STAGES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => go(i)}
            aria-label={`Chapter ${s.num}: ${s.id}`}
            aria-current={i === stage ? 'step' : undefined}
            className={`mono-label cursor-pointer bg-transparent p-0 ${i === stage ? '!text-violet-hi' : 'hover:!text-text'}`}
          >
            {s.num}
          </button>
        ))}
      </nav>
    </div>
  )
}
