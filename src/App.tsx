import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SkyCanvas } from '@/components/SkyCanvas'
import { SearchBar } from '@/components/SearchBar'
import { ReadoutStrip } from '@/components/ReadoutStrip'
import { ForecastStrip } from '@/components/ForecastStrip'
import { HourlyStrip } from '@/components/HourlyStrip'
import { FavoritesRow } from '@/components/FavoritesRow'
import { fetchWeather } from '@/utils/weather'
import { locateAndDescribe } from '@/utils/geo'
import { loadUnit, saveUnit, toDisplayTemp, type TempUnit } from '@/utils/units'
import {
  loadFavorites,
  toggleFavorite as toggleFavoriteInList,
  removeFavorite as removeFavoriteFromList,
  isSamePlace,
} from '@/utils/favorites'
import { computeNightMix } from '@/utils/time'
import { buildSummaryLine } from '@/utils/summary'
import { loadLastPlace, saveLastPlace } from '@/utils/lastPlace'
import type { PlaceResult, WeatherReport } from '@/types'

const conditionLabel: Record<WeatherReport['current']['condition'], string> = {
  clear: 'Clear',
  cloudy: 'Cloudy',
  rain: 'Rain',
  snow: 'Snow',
  storm: 'Storm',
  fog: 'Fog',
}

export default function App() {
  const [report, setReport] = useState<WeatherReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [locating, setLocating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [geoDenied, setGeoDenied] = useState(false)
  const [unit, setUnit] = useState<TempUnit>(() => loadUnit())
  const [favorites, setFavorites] = useState<PlaceResult[]>(() => loadFavorites())
  const [nightMix, setNightMix] = useState(1)

  const handleSelect = async (place: PlaceResult) => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchWeather(place)
      setReport(result)
      saveLastPlace(place)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong fetching the forecast.')
    } finally {
      setLoading(false)
    }
  }

  const handleLocate = async (silent = false) => {
    setLocating(true)
    if (!silent) setError(null)
    try {
      const place = await locateAndDescribe()
      setGeoDenied(false)
      await handleSelect(place)
    } catch (err) {
      setGeoDenied(true)
      // On the automatic first attempt, fail quietly — the search bar remains
      // a perfectly good fallback. Only surface the error for a manual retry.
      if (!silent) setError(err instanceof Error ? err.message : 'Could not access your location.')
    } finally {
      setLocating(false)
    }
  }

  const handleSetUnit = (next: TempUnit) => {
    setUnit(next)
    saveUnit(next)
  }

  const handleToggleFavorite = () => {
    if (!report) return
    setFavorites((prev) => toggleFavoriteInList(prev, report.place))
  }

  const handleRemoveFavorite = (place: PlaceResult) => {
    setFavorites((prev) => removeFavoriteFromList(prev, place))
  }

  const isFavorite = report ? favorites.some((f) => isSamePlace(f, report.place)) : false

  // Reopen wherever the visitor last was, if we remember it — otherwise try
  // to open straight into their current sky via geolocation.
  useEffect(() => {
    const last = loadLastPlace()
    if (last) {
      handleSelect(last)
    } else {
      handleLocate(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Recompute the day/night blend every minute so the sky drifts through
  // dawn and dusk in real time while the tab stays open.
  useEffect(() => {
    if (!report) return
    const update = () => {
      setNightMix(computeNightMix(Date.now(), report.current.sunrise.getTime(), report.current.sunset.getTime()))
    }
    update()
    const id = setInterval(update, 60_000)
    return () => clearInterval(id)
  }, [report])

  return (
    <div className="relative h-screen overflow-hidden font-body text-vapor">
      <SkyCanvas condition={report?.current.condition ?? 'clear'} nightMix={nightMix} />

      <div className="mx-auto flex h-full w-full max-w-3xl flex-col justify-between overflow-y-auto px-6 py-5 sm:px-10">
        {/* Header / search */}
        <header className="flex flex-col items-start gap-3">
          <div className="flex w-full flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-mono text-xs tracking-widest text-haze">SKY OBSERVATORY</p>
              <h1 className="font-display text-lg font-medium text-vapor">Live atmospheric readout</h1>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
              <SearchBar onSelect={handleSelect} />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleLocate(false)}
                  disabled={locating}
                  className="flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-vapor/15 bg-cloudline/60 px-4 py-2.5 font-mono text-xs text-haze backdrop-blur-md transition hover:text-vapor disabled:opacity-50"
                >
                  <span aria-hidden>◈</span>
                  {locating ? 'locating…' : 'use my location'}
                </button>
                <div className="flex items-center rounded-full border border-vapor/15 bg-cloudline/60 p-1 font-mono text-xs backdrop-blur-md">
                  {(['C', 'F'] as const).map((u) => (
                    <button
                      key={u}
                      onClick={() => handleSetUnit(u)}
                      aria-pressed={unit === u}
                      className={`rounded-full px-2.5 py-1 transition ${
                        unit === u ? 'bg-solar/20 text-solar' : 'text-haze hover:text-vapor'
                      }`}
                    >
                      °{u}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <FavoritesRow
            favorites={favorites}
            activeName={report?.place.name}
            onSelect={handleSelect}
            onRemove={handleRemoveFavorite}
          />
        </header>

        {/* Main readout */}
        <main className="flex flex-1 flex-col justify-center py-4">
          <AnimatePresence mode="wait">
            {!report && !loading && !locating && !error && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-md"
              >
                <p className="font-mono text-sm text-haze">
                  {geoDenied
                    ? "Couldn't access your location. Search a city above to bring its sky online."
                    : 'No location selected yet. Search a city above to bring its sky online.'}
                </p>
              </motion.div>
            )}

            {(loading || locating) && (
              <motion.p
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-mono text-sm text-haze"
              >
                {locating ? 'Finding you…' : 'Reading the sky…'}
              </motion.p>
            )}

            {error && !loading && !locating && (
              <motion.p
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-mono text-sm text-solar"
              >
                {error}
              </motion.p>
            )}

            {report && !loading && (
              <motion.div
                key={report.place.name}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                <p className="font-mono text-xs tracking-wide text-haze">
                  {[report.place.admin1, report.place.country].filter(Boolean).join(', ')}
                </p>

                <div className="flex items-center gap-2">
                  <h2 className="font-display text-3xl font-medium text-vapor sm:text-4xl">{report.place.name}</h2>
                  <button
                    onClick={handleToggleFavorite}
                    aria-label={isFavorite ? 'Remove from saved locations' : 'Save this location'}
                    aria-pressed={isFavorite}
                    className="text-xl text-solar/70 transition hover:text-solar"
                  >
                    {isFavorite ? '★' : '☆'}
                  </button>
                </div>

                <div className="mt-3 flex items-end gap-4">
                  <span className="font-display text-7xl font-black leading-none text-solar sm:text-8xl">
                    {toDisplayTemp(report.current.temperature, unit)}°
                  </span>
                  <span className="mb-2 font-mono text-sm text-glacial">
                    {conditionLabel[report.current.condition]}
                  </span>
                </div>

                <p className="mt-2 font-mono text-xs text-haze">
                  {buildSummaryLine(report.forecast[0]?.max ?? report.current.temperature, report.yesterdayMax, report.current.windSpeed)}
                </p>

                <div className="mt-5">
                  <ReadoutStrip current={report.current} unit={unit} />
                </div>

                <div className="mt-5">
                  <p className="mb-2 font-mono text-[11px] tracking-widest text-haze">NEXT 10 HOURS</p>
                  <HourlyStrip hours={report.hourly} unit={unit} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Forecast */}
        <footer>
          <AnimatePresence>
            {report && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                <p className="mb-3 font-mono text-[11px] tracking-widest text-haze">6-DAY OUTLOOK</p>
                <ForecastStrip days={report.forecast} unit={unit} />
              </motion.div>
            )}
          </AnimatePresence>
        </footer>
      </div>
    </div>
  )
}
