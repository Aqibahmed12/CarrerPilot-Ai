import type { ReactNode } from 'react'

const TONE = {
  default: 'border-line-strong text-text-2',
  owned: 'border-violet text-text',
  unknown: 'border-dashed border-text-3 text-text-3 hover:text-text-2',
}

export function Chip({ children, tone = 'default', onRemove, onClick }: { children: ReactNode; tone?: keyof typeof TONE; onRemove?: () => void; onClick?: () => void }) {
  const cls = `inline-flex items-center gap-2 rounded-pill border bg-transparent px-3 py-1 font-mono text-[11px] uppercase tracking-[.12em] ${TONE[tone]}`
  const body = (
    <>
      {children}
      {onRemove && (
        <button type="button" aria-label="Remove" onClick={onRemove} className="cursor-pointer border-0 bg-transparent p-0 text-text-3 hover:text-text">×</button>
      )}
    </>
  )
  return onClick ? (
    <button type="button" onClick={onClick} className={`${cls} cursor-pointer`}>{body}</button>
  ) : (
    <span className={cls}>{body}</span>
  )
}
