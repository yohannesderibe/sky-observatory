import type { DayForecast } from '@/types'
import { toDisplayTemp, type TempUnit } from '@/utils/units'

interface ForecastStripProps {
  days: DayForecast[]
  unit: TempUnit
}

const glyph: Record<DayForecast['condition'], string> = {
  clear: '☀',
  cloudy: '☁',
  rain: '☂',
  snow: '❄',
  storm: '⚡',
  fog: '≈',
}

export function ForecastStrip({ days, unit }: ForecastStripProps) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
      {days.map((day) => (
        <div
          key={day.date}
          className="flex flex-col items-center gap-1.5 rounded-xl border border-vapor/10 bg-cloudline/50 px-2 py-3 backdrop-blur-md"
        >
          <span className="font-mono text-[11px] text-haze">{day.label}</span>
          <span aria-hidden className="text-lg text-glacial">
            {glyph[day.condition]}
          </span>
          <span className="font-mono text-xs text-vapor">
            {toDisplayTemp(day.max, unit)}° <span className="text-haze">{toDisplayTemp(day.min, unit)}°</span>
          </span>
        </div>
      ))}
    </div>
  )
}
