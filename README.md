<div align="center">

# 🌌 Sky Observatory

**A live weather dashboard where the background *is* the forecast.**

Built with React, TypeScript, Tailwind CSS, and Framer Motion — no backend, no API keys.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-black?logo=framer&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

</div>

---

## What it is

Most weather apps show you numbers next to a stock icon. Sky Observatory renders an actual animated sky — driven by live data from [Open-Meteo](https://open-meteo.com) — that fills the whole screen behind an instrument-panel-style readout. Stars fade in as night approaches, rain and snow fall, clouds drift, storms flicker. It's real weather data doing the animating, not a decorative loop.

## ✨ Features

- **📍 Auto-location on load** — asks for location permission once and opens straight into your local sky. Denied or unsupported? Falls back to search, no error shown.
- **🔎 City search** — type-ahead geocoding search for any place in the world.
- **🌗 Smooth day/night blending** — the sky doesn't hard-switch at sunrise/sunset. It ramps through a 45-minute dawn/dusk window, recalculated every minute, so the transition unfolds while you watch.
- **☀️🌧️❄️⚡ Reactive sky canvas** — layered CSS + Framer Motion animation keyed to the real condition: clear, cloudy, rain, snow, storm, or fog.
- **🌡️ °C / °F toggle** — persisted across visits.
- **⭐ Saved locations** — star up to 6 cities and switch between them with one click.
- **📅 6-day outlook** — condensed forecast strip below the main readout.
- **⏱️ Hourly forecast** — scrollable next-10-hours strip.
- **💬 Plain-language summary** — a one-line human read on the day, e.g. "Warmer than yesterday. A bit breezy."
- **🔁 Remembers your last view** — reloading the page reopens exactly where you left off, no re-prompting for location.
- **♿ Reduced-motion aware** — every looping animation respects `prefers-reduced-motion`.
- **📱 Fully responsive** — instrument-panel layout adapts down to mobile.

## 🛠️ Tech stack

| | |
|---|---|
| Framework | React 19 + TypeScript |
| Build tool | Vite 7 |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| Weather data | [Open-Meteo](https://open-meteo.com) (forecast + geocoding, free, no key) |
| Reverse geocoding | [BigDataCloud](https://www.bigdatacloud.com/free-api/free-reverse-geocode-to-city-api) (free, client-side, no key) |

## 🚀 Getting started

```bash
git clone <your-repo-url>
cd weather-dashboard
npm install
npm run dev
```

Open the local URL Vite prints (usually `http://localhost:5173`). No `.env` file, no API keys, no backend — it just runs.

> **Note:** geolocation only works over HTTPS or `localhost`. It'll work out of the box once deployed to Vercel/Netlify/GitHub Pages.

## 📁 Project structure

```
src/
├── components/
│   ├── SkyCanvas.tsx       # the signature animated background
│   ├── SearchBar.tsx       # type-ahead city search
│   ├── ReadoutStrip.tsx    # feels-like / humidity / wind / local time
│   ├── HourlyStrip.tsx     # next-24-hours forecast
│   ├── ForecastStrip.tsx   # 6-day outlook
│   └── FavoritesRow.tsx    # saved-location chips
├── utils/
│   ├── weather.ts          # Open-Meteo forecast + geocoding
│   ├── geo.ts              # browser geolocation + reverse geocoding
│   ├── time.ts             # day/night blend calculation
│   ├── units.ts            # °C/°F conversion + persistence
│   ├── favorites.ts        # saved-locations persistence
│   ├── summary.ts          # plain-language summary line
│   └── lastPlace.ts        # remembers the last-viewed city
├── types.ts
└── App.tsx
```

## 🌐 Deploying

This is a fully static site — `npm run build` outputs a `dist/` folder you can drop onto Vercel, Netlify, GitHub Pages, or any static host. No environment variables, no secrets, no server.

## 📄 License

MIT — do whatever you'd like with it.
