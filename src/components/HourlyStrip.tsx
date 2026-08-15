import type { HourForecast } from '@/types'
import { toDisplayTemp, type TempUnit } from '@/utils/units'

interface HourlyStripProps {
  hours: HourForecast[]
  unit: TempUnit
}

const glyph: Record<HourForecast['condition'], string> = {
  clear: '☀',
  cloudy: '☁',
  rain: '☂',
  snow: '❄',
  storm: '⚡',
  fog: '≈',
}

export function HourlyStrip({ hours, unit }: HourlyStripProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {hours.map((h) => (
        <div
          key={h.time.toISOString()}
          className="flex min-w-[56px] shrink-0 flex-col items-center gap-1.5 rounded-xl border border-vapor/10 bg-cloudline/50 px-2 py-3 backdrop-blur-md"
        >
          <span className="font-mono text-[11px] text-haze">{h.label}</span>
          <span aria-hidden className="text-base text-glacial">
            {glyph[h.condition]}
          </span>
          <span className="font-mono text-xs text-vapor">{toDisplayTemp(h.temperature, unit)}°</span>
        </div>
      ))}
    </div>
  )
}
