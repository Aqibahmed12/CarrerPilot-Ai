import { motion } from 'motion/react'
import { EASE } from '../lib/motion'

export function Check({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="relative h-[18px] w-[18px] shrink-0 cursor-pointer border border-line-strong bg-transparent p-0 hover:border-violet"
    >
      <svg viewBox="0 0 18 18" className="absolute inset-0" aria-hidden>
        <motion.path
          d="M4 9.5 L7.5 13 L14 5"
          fill="none"
          stroke="var(--violet)"
          strokeWidth={1.5}
          initial={false}
          animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
          transition={{ duration: 0.35, ease: EASE }}
        />
      </svg>
    </button>
  )
}
