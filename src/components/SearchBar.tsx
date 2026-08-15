import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { PlaceResult } from '@/types'
import { searchPlaces } from '@/utils/weather'

interface SearchBarProps {
  onSelect: (place: PlaceResult) => void
}

export function SearchBar({ onSelect }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PlaceResult[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      return
    }
    setLoading(true)
    const handle = setTimeout(async () => {
      try {
        const places = await searchPlaces(query)
        setResults(places)
        setOpen(true)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 350)
    return () => clearTimeout(handle)
  }, [query])

  useEffect(() => {
    const onClickAway = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickAway)
    return () => document.removeEventListener('mousedown', onClickAway)
  }, [])

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <div className="flex items-center gap-2 rounded-full border border-vapor/15 bg-cloudline/60 px-4 py-2.5 backdrop-blur-md">
        <span className="font-mono text-xs text-haze">◎</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="search a place"
          className="w-full bg-transparent font-mono text-sm text-vapor placeholder:text-haze focus:outline-none"
          aria-label="Search for a city"
        />
        {loading && <span className="font-mono text-xs text-haze">…</span>}
      </div>

      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute z-10 mt-2 w-full overflow-hidden rounded-2xl border border-vapor/10 bg-cloudline/90 backdrop-blur-md"
          >
            {results.map((place, i) => (
              <li key={`${place.name}-${i}`}>
                <button
                  onClick={() => {
                    onSelect(place)
                    setQuery(`${place.name}, ${place.country}`)
                    setOpen(false)
                  }}
                  className="flex w-full flex-col items-start px-4 py-2.5 text-left transition hover:bg-void/40"
                >
                  <span className="font-body text-sm text-vapor">{place.name}</span>
                  <span className="font-mono text-[11px] text-haze">
                    {[place.admin1, place.country].filter(Boolean).join(', ')}
                  </span>
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
