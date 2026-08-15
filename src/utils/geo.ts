import type { PlaceResult } from '@/types'

function getCurrentCoords(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('This browser does not support location access.'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      (err) => reject(new Error(err.message || 'Location access was denied.')),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60 * 1000 }
    )
  })
}

/** Turns raw coordinates into a place name using BigDataCloud's free reverse-geocoding API (no key required). */
async function reverseGeocode(latitude: number, longitude: number): Promise<PlaceResult> {
  const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Could not identify that location.')
  const data = await res.json()
  return {
    name: data.city || data.locality || data.principalSubdivision || 'Your location',
    admin1: data.principalSubdivision,
    country: data.countryName,
    latitude,
    longitude,
    timezone: 'auto',
  }
}

/** Requests the browser's geolocation permission, then resolves it to a named place. */
export async function locateAndDescribe(): Promise<PlaceResult> {
  const coords = await getCurrentCoords()
  return reverseGeocode(coords.latitude, coords.longitude)
}
