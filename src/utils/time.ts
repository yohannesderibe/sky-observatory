/** How long the dawn/dusk blend lasts on either side of sunrise/sunset. */
const TRANSITION_MS = 45 * 60 * 1000

/**
 * Returns a continuous value from 0 (full day) to 1 (full night), ramping
 * smoothly through dawn and dusk instead of snapping at sunrise/sunset.
 */
export function computeNightMix(now: number, sunrise: number, sunset: number): number {
  const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
  const dawnStart = sunrise - TRANSITION_MS
  const dawnEnd = sunrise + TRANSITION_MS
  const duskStart = sunset - TRANSITION_MS
  const duskEnd = sunset + TRANSITION_MS

  if (now <= dawnStart || now >= duskEnd) return 1
  if (now >= dawnEnd && now <= duskStart) return 0
  if (now < dawnEnd) return clamp01(1 - (now - dawnStart) / (dawnEnd - dawnStart))
  return clamp01((now - duskStart) / (duskEnd - duskStart))
}
