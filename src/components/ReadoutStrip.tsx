import type { CurrentWeather } from '@/types'
import { toDisplayTemp, type TempUnit } from '@/utils/units'

interface ReadoutStripProps {
  current: CurrentWeather
  unit: TempUnit
}

export function ReadoutStrip({ current, unit }: ReadoutStripProps) {
  const items = [
    { label: 'FEELS LIKE', value: `${toDisplayTemp(current.feelsLike, unit)}°` },
    { label: 'HUMIDITY', value: `${current.humidity}%` },
    { label: 'WIND', value: `${current.windSpeed} km/h` },
    {
      label: 'LOCAL TIME',
      value: current.localTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    },
  ]

  return (
    <div className="flex flex-wrap gap-x-8 gap-y-3 rounded-2xl border border-vapor/10 bg-cloudline/50 px-6 py-4 backdrop-blur-md">
      {items.map((item, i) => (
        <div key={item.label} className="flex items-baseline gap-2">
          {i > 0 && <span className="hidden text-haze/40 sm:inline">/</span>}
          <span className="font-mono text-[11px] tracking-wide text-haze">{item.label}</span>
          <span className="font-mono text-sm text-vapor">{item.value}</span>
        </div>
      ))}
    </div>
  )
}
