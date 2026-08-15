import type { PlaceResult } from '@/types'

const STORAGE_KEY = 'sky-observatory:favorites'
const MAX_FAVORITES = 6

export function isSamePlace(a: PlaceResult, b: PlaceResult): boolean {
  return Math.abs(a.latitude - b.latitude) < 0.01 && Math.abs(a.longitude - b.longitude) < 0.01
}

export function loadFavorites(): PlaceResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as PlaceResult[]) : []
  } catch {
    return []
  }
}

function persist(list: PlaceResult[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    // localStorage unavailable — favorites just won't persist this session
  }
}

export function toggleFavorite(favorites: PlaceResult[], place: PlaceResult): PlaceResult[] {
  const exists = favorites.some((f) => isSamePlace(f, place))
  const next = exists ? favorites.filter((f) => !isSamePlace(f, place)) : [...favorites, place].slice(-MAX_FAVORITES)
  persist(next)
  return next
}

export function removeFavorite(favorites: PlaceResult[], place: PlaceResult): PlaceResult[] {
  const next = favorites.filter((f) => !isSamePlace(f, place))
  persist(next)
  return next
}
