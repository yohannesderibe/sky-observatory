import type { CurrentWeather, DayForecast, HourForecast, PlaceResult, SkyCondition, WeatherReport } from '@/types'

const GEOCODE_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'

/** Maps WMO weather codes (used by Open-Meteo) to a simplified sky condition. */
function codeToCondition(code: number): SkyCondition {
  if (code === 0 || code === 1) return 'clear'
  if (code === 2 || code === 3) return 'cloudy'
  if (code === 45 || code === 48) return 'fog'
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'rain'
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snow'
  if ([95, 96, 99].includes(code)) return 'storm'
  return 'cloudy'
}

const dayLabel = (iso: string, index: number) => {
  if (index === 0) return 'Today'
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' })
}

const hourLabel = (iso: string) => new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric' })

/** Finds the first hourly slot at or after the given time, so the hourly strip starts "now". */
function findStartIndex(times: string[], fromIso: string): number {
  const from = new Date(fromIso).getTime()
  const idx = times.findIndex((t) => new Date(t).getTime() >= from)
  return idx === -1 ? 0 : idx
}

export async function searchPlaces(query: string): Promise<PlaceResult[]> {
  if (!query.trim()) return []
  const url = `${GEOCODE_URL}?name=${encodeURIComponent(query)}&count=5&language=en&format=json`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Could not search that location right now.')
  const data = await res.json()
  const results = (data.results ?? []) as any[]
  return results.map((r) => ({
    name: r.name,
    admin1: r.admin1,
    country: r.country,
    latitude: r.latitude,
    longitude: r.longitude,
    timezone: r.timezone,
  }))
}

export async function fetchWeather(place: PlaceResult): Promise<WeatherReport> {
  const params = new URLSearchParams({
    latitude: String(place.latitude),
    longitude: String(place.longitude),
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,is_day',
    hourly: 'temperature_2m,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset',
    timezone: place.timezone || 'auto',
    forecast_days: '6',
    past_days: '1',
  })
  const res = await fetch(`${FORECAST_URL}?${params.toString()}`)
  if (!res.ok) throw new Error('Could not fetch weather for that location.')
  const data = await res.json()

  // With past_days=1, index 0 of every "daily" array is yesterday and index 1 is today.
  const TODAY_INDEX = 1
  const yesterdayMax: number | null =
    data.daily?.temperature_2m_max?.[0] !== undefined ? data.daily.temperature_2m_max[0] : null

  const current: CurrentWeather = {
    // Kept raw (not rounded) so °C ⇄ °F conversion stays accurate at display time.
    temperature: data.current.temperature_2m,
    feelsLike: data.current.apparent_temperature,
    humidity: Math.round(data.current.relative_humidity_2m),
    windSpeed: Math.round(data.current.wind_speed_10m),
    condition: codeToCondition(data.current.weather_code),
    isDay: data.current.is_day === 1,
    localTime: new Date(data.current.time),
    sunrise: new Date(data.daily.sunrise[TODAY_INDEX]),
    sunset: new Date(data.daily.sunset[TODAY_INDEX]),
  }

  const days: DayForecast[] = data.daily.time.slice(TODAY_INDEX).map((iso: string, i: number) => {
    const idx = i + TODAY_INDEX
    return {
      date: iso,
      label: dayLabel(iso, i),
      condition: codeToCondition(data.daily.weather_code[idx]),
      isDay: true,
      max: data.daily.temperature_2m_max[idx],
      min: data.daily.temperature_2m_min[idx],
    }
  })

  const hourlyTimes: string[] = data.hourly.time
  const startIdx = findStartIndex(hourlyTimes, data.current.time)
  const hourly: HourForecast[] = hourlyTimes.slice(startIdx, startIdx + 10).map((iso, i) => ({
    time: new Date(iso),
    label: i === 0 ? 'Now' : hourLabel(iso),
    temperature: data.hourly.temperature_2m[startIdx + i],
    condition: codeToCondition(data.hourly.weather_code[startIdx + i]),
  }))

  return { place, current, forecast: days, hourly, yesterdayMax }
}
