const BASE = 'inline-flex items-center gap-1.5 rounded-[2px] px-2 py-[3px] font-mono text-[10px] uppercase tracking-[.12em] whitespace-nowrap'

export function Badge({ kind, n, compact }: { kind: 'verified' | 'generated' | 'curated'; n?: number; compact?: boolean }) {
  if (kind === 'verified')
    return <span className={`${BASE} border border-ice text-ice`}>◼ Verified{!compact && n ? ` · n=${n} JDs` : ''}</span>
  if (kind === 'curated') return <span className={`${BASE} border border-line-strong text-text-2`}>◼ Curated</span>
  return <span className={`${BASE} border border-dashed border-violet-hi text-violet-hi`}>◇ AI-suggested</span>
}
