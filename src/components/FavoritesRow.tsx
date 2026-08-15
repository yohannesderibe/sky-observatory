import type { PlaceResult } from '@/types'

interface FavoritesRowProps {
  favorites: PlaceResult[]
  activeName?: string
  onSelect: (place: PlaceResult) => void
  onRemove: (place: PlaceResult) => void
}

export function FavoritesRow({ favorites, activeName, onSelect, onRemove }: FavoritesRowProps) {
  if (favorites.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {favorites.map((place) => {
        const active = place.name === activeName
        return (
          <div
            key={`${place.name}-${place.latitude}-${place.longitude}`}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-xs backdrop-blur-md transition ${
              active ? 'border-solar/50 bg-solar/10 text-solar' : 'border-vapor/10 bg-cloudline/50 text-haze'
            }`}
          >
            <button onClick={() => onSelect(place)} className="hover:text-vapor">
              {place.name}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRemove(place)
              }}
              aria-label={`Remove ${place.name} from saved locations`}
              className="text-haze/60 hover:text-solar"
            >
              ×
            </button>
          </div>
        )
      })}
    </div>
  )
}
