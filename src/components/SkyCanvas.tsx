import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { SkyCondition } from '@/types'

interface SkyCanvasProps {
  condition: SkyCondition
  /** 0 = full day, 1 = full night. Blends smoothly through dawn/dusk. */
  nightMix: number
}

/** Deterministic pseudo-random generator so particle layout is stable per render count. */
function seeded(seed: number) {
  const x = Math.sin(seed * 999) * 10000
  return x - Math.floor(x)
}

function useParticles(count: number, seedBase: number) {
  return useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: seeded(seedBase + i) * 100,
        delay: seeded(seedBase + i + 50) * 6,
        duration: 4 + seeded(seedBase + i + 100) * 4,
        size: 1 + seeded(seedBase + i + 150) * 2,
      })),
    [count, seedBase]
  )
}

export function SkyCanvas({ condition, nightMix }: SkyCanvasProps) {
  const reduceMotion = useReducedMotion()
  const starsAlpha = Math.max(0, Math.min(1, (nightMix - 0.4) / 0.6))
  const stars = useParticles(condition === 'clear' ? 60 : 0, 1)
  const rain = useParticles(condition === 'rain' ? 70 : 0, 2)
  const snow = useParticles(condition === 'snow' ? 50 : 0, 3)
  const clouds = useParticles(condition === 'cloudy' || condition === 'storm' || condition === 'fog' ? 5 : 0, 4)

  const sunPulse = [0.14, 0.2, 0.14].map((v) => v * (1 - nightMix))
  const moonPulse = [0.08, 0.14, 0.08].map((v) => v * nightMix)

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-void">
      {/* Sun glow — fades out as night approaches */}
      <motion.div
        className="absolute -top-40 left-1/2 h-[60vh] w-[60vh] -translate-x-1/2 rounded-full blur-3xl"
        style={{ background: 'var(--color-solar)' }}
        animate={reduceMotion ? { opacity: sunPulse[1] } : { opacity: sunPulse }}
        transition={{ duration: 8, repeat: reduceMotion ? 0 : Infinity, ease: 'easeInOut' }}
      />
      {/* Moon glow — fades in as night approaches */}
      <motion.div
        className="absolute -top-40 left-1/2 h-[60vh] w-[60vh] -translate-x-1/2 rounded-full blur-3xl"
        style={{ background: 'var(--color-glacial)' }}
        animate={reduceMotion ? { opacity: moonPulse[1] } : { opacity: moonPulse }}
        transition={{ duration: 8, repeat: reduceMotion ? 0 : Infinity, ease: 'easeInOut' }}
      />

      {/* Stars — fade in smoothly as night approaches on clear skies */}
      <div style={{ opacity: starsAlpha, transition: reduceMotion ? undefined : 'opacity 1.5s ease' }}>
        {stars.map((s, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-vapor"
            style={{
              left: `${s.left}%`,
              top: `${(seeded(i + 200) * 60).toFixed(2)}%`,
              width: s.size,
              height: s.size,
              animation: `twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Rain */}
      {rain.map((r, i) => (
        <span
          key={i}
          className="absolute top-0 w-px bg-glacial/60"
          style={{
            left: `${r.left}%`,
            height: '3vh',
            animation: `fall-rain ${r.duration * 0.35}s linear ${r.delay}s infinite backwards`,
          }}
        />
      ))}

      {/* Snow */}
      {snow.map((s, i) => (
        <span
          key={i}
          className="absolute top-0 rounded-full bg-vapor/80"
          style={{
            left: `${s.left}%`,
            width: s.size + 1,
            height: s.size + 1,
            animation: `fall-snow ${s.duration}s linear ${s.delay}s infinite backwards`,
          }}
        />
      ))}

      {/* Clouds — cloudy / storm / fog */}
      {clouds.map((c, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-cloudline/70 blur-2xl"
          style={{
            left: `${c.left}%`,
            top: `${8 + i * 9}%`,
            width: '32vw',
            height: '14vh',
            animation: `drift-cloud ${18 + c.duration * 3}s ease-in-out ${c.delay}s infinite alternate`,
          }}
        />
      ))}

      {/* Storm flicker */}
      {condition === 'storm' && !reduceMotion && (
        <motion.div
          className="absolute inset-0 bg-vapor"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0, 0, 0.12, 0, 0.06, 0] }}
          transition={{ duration: 5, repeat: Infinity, repeatDelay: 3 }}
        />
      )}

      {/* Fog haze */}
      {condition === 'fog' && <div className="absolute inset-0 bg-cloudline/40 backdrop-blur-sm" />}

      {/* Vignette so foreground text stays readable everywhere */}
      <div className="absolute inset-0 bg-gradient-to-b from-void/20 via-transparent to-void/70" />
    </div>
  )
}
