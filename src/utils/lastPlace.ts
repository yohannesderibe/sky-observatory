import type { PlaceResult } from '@/types'

const STORAGE_KEY = 'sky-observatory:last-place'

export function loadLastPlace(): PlaceResult | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as PlaceResult) : null
  } catch {
    return null
  }
}

export function saveLastPlace(place: PlaceResult) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(place))
  } catch {
    // localStorage unavailable — last view just won't persist
  }
}
