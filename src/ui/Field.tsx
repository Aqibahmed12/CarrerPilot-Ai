import type { InputHTMLAttributes } from 'react'

export function Field(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <span className="field relative inline-block min-w-[220px] flex-1">
      <input
        {...props}
        className="w-full border-0 border-b border-line-strong bg-transparent py-1 font-display text-[32px] leading-tight text-text outline-none placeholder:text-text-3"
      />
      <span className="field-line" />
    </span>
  )
}
