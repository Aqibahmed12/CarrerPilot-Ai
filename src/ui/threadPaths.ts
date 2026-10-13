export type ThreadPreset = { d: string; x: number; y: number }

// Every preset: M + C + C (same command structure) so `d` interpolates. viewBox 1440x900.
export const PATHS: ThreadPreset[] = [
  // 00 Prologue: rises from bottom centre, bends right
  { d: 'M 720 900 C 720 700 680 560 760 440 C 840 320 1000 300 1100 180', x: 1100, y: 180 },
  // 01 Origin: vertical on the left gutter
  { d: 'M 86 40 C 86 160 86 260 86 340 C 86 420 86 520 86 640', x: 86, y: 640 },
  // 02 Horizon: horizontal underline beneath the role list
  { d: 'M 86 700 C 300 700 500 700 720 700 C 940 700 1100 700 1300 700', x: 1300, y: 700 },
  // 03 Map: 270deg ring arc
  { d: 'M 824.4 605.6 C 685.8 467 784 230 980 230 C 1176 230 1274.2 467 1135.6 605.6', x: 1135.6, y: 605.6 },
  // 04 Ascent: elevation line
  { d: 'M 86 780 C 360 780 460 640 720 600 C 980 560 1100 300 1360 220', x: 1360, y: 220 },
  // 05 Summit: closes into the contour
  { d: 'M 980 250 C 1200 250 1260 560 1000 640 C 800 700 700 450 980 250', x: 980, y: 250 },
]
