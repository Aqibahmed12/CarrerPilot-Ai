# NOTES — Meridian (current: M0 done, next: M1)
## Decisions
- Vite + React + TS, Tailwind v4 (`@theme inline`, default palette reset; tokens in `:root` per Design §3).
- Stages are state (`lib/store.ts` zustand, no router). 6 stages: Prologue + 5 chapters.
- Thread: one fixed SVG (viewBox 1440x900, slice). All presets `M C C` in `ui/threadPaths.ts`; `motion` interpolates `d`.
- Stage transition: exit 350ms fade+2px blur, enter 550ms rise 16px (AnimatePresence wait). Reduced motion = crossfade, no morph.
- Typecheck: `npm run typecheck` (root tsconfig has `files: []`, so use tsconfig.app.json).
## File map
- index.html (font links), public/favicon.svg (Mark), src/index.css (tokens, grain, vignette, type classes)
- src/lib/{store,motion}.ts · src/ui/{Mark,Thread,threadPaths,Stage,Headline}.tsx
- src/stages/{Prologue..Summit,index}.ts(x) — Origin..Summit are empty placeholders
- App.tsx: header wordmark, Thread, stage, chapter nav (keys: ←/→)
## Not yet built
- Legend, Chip, Field, Badge, Ring, etc. (later milestones). Prologue "Load Zara" arrives with M2 persona.
- Dev nav (bottom-right numerals) is temporary scaffolding.
