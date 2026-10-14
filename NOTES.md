# NOTES — Meridian (M0–M7 built; verification: typecheck, vitest, vite build only)
## Decisions
- Vite+React+TS, Tailwind v4 (`@theme inline`, palette reset, tokens in `:root`). Stages are state (zustand+persist `meridian-v1`).
- Thread: fixed SVG 1440x900 slice; every preset is `M`+4`C` (`ui/threadPaths.ts`); dynamic presets in `lib/hooks.ts` (`useThreadPreset`).
- `Canvas` (svg) and `Frame` (DOM) share the Thread's viewBox/slice so ring, constellation, elevation line align exactly.
- Scoring = PRD §6 in `lib/scoring.ts`. Roadmap = gap-desc + prereq-first, 4 milestones (`lib/roadmap.ts`), from base profile (no progress).
- Data: `data/taxonomy.src.txt`+`resources.src.txt` -> `npm run data` (also requirements + layouts). `~alias` = list-only, never scanned in JDs.
- JDs are PLACEHOLDERS: `data/jds/*/NN.SAMPLE.txt` (`npm run samples`). UI shows "sample data". Replace with real JDs, delete samples, `npm run data`.
- `recs.json` = templates (no LLM key). With keys: `npm run recs` (top 8 skills/role via LLM). LLM proxy `server/`, `npm run dev` runs vite+proxy.
## Files
- lib: types roles data extract scoring roadmap store hooks geom llm cv motion · ui: Mark Thread Stage Headline Canvas Chip Field Badge Check Sheet Legend Ring Constellation Contour ElevationLine · stages/*
## Known gaps
- Not visually verified (per token rules). Dev nav (bottom-right numerals, ←/→) kept. Contour has 6 axes (taxonomy cats), not 8.
