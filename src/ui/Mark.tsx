export function Mark({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="var(--text)" strokeWidth="1.25" />
      <line x1="12" y1="3" x2="12" y2="21" stroke="var(--violet)" strokeWidth="1.25" />
      <circle cx="18.36" cy="5.64" r="1.6" fill="var(--violet)" />
    </svg>
  )
}
