export type SkyCondition = 'clear' | 'cloudy' | 'rain' | 'snow' | 'storm' | 'fog'

export interface PlaceResult {
  name: string
  admin1?: string
  country: string
  latitude: number
  longitude: number
  timezone: string
}

export interface DayForecast {
  date: string
  label: string
  condition: SkyCondition
  isDay: boolean
  max: number
  min: number
}

export interface HourForecast {
  time: Date
  label: string
  temperature: number
  condition: SkyCondition
}

export interface CurrentWeather {
  temperature: number
  feelsLike: number
  humidity: number
  windSpeed: number
  condition: SkyCondition
  isDay: boolean
  localTime: Date
  sunrise: Date
  sunset: Date
}

export interface WeatherReport {
  place: PlaceResult
  current: CurrentWeather
  forecast: DayForecast[]
  hourly: HourForecast[]
  yesterdayMax: number | null
}
