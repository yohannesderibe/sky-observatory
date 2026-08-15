export type TempUnit = 'C' | 'F'

const STORAGE_KEY = 'sky-observatory:unit'

/** Converts a raw Celsius value to the display unit, rounded for presentation. */
export function toDisplayTemp(celsius: number, unit: TempUnit): number {
  return unit === 'F' ? Math.round((celsius * 9) / 5 + 32) : Math.round(celsius)
}

export function loadUnit(): TempUnit {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'F' ? 'F' : 'C'
  } catch {
    return 'C'
  }
}

export function saveUnit(unit: TempUnit) {
  try {
    localStorage.setItem(STORAGE_KEY, unit)
  } catch {
    // localStorage unavailable (private mode, etc.) — unit just won't persist
  }
}
