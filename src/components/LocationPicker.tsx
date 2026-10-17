import { useEffect, useMemo, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import type { Marker as LeafletMarker } from 'leaflet'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import { Crosshair, Loader2, MapPin } from 'lucide-react'
import { MAP_CENTER, MAP_ZOOM } from '../lib/constants'
import { pinIcon, TILE_ATTRIBUTION, TILE_URL } from './ReportMap'
import { ghostBtn } from './ui'

export interface LatLng {
  lat: number
  lng: number
}

function ClickHandler({ onPick }: { onPick: (p: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

function FlyTo({ target }: { target: LatLng | null }) {
  const map = useMap()
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], Math.max(map.getZoom(), 16), { duration: 0.8 })
  }, [target, map])
  return null
}

interface Props {
  value: LatLng | null
  onChange: (p: LatLng) => void
}

export default function LocationPicker({ value, onChange }: Props) {
  const [locating, setLocating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [flyTarget, setFlyTarget] = useState<LatLng | null>(null)
  const icon = useMemo(() => pinIcon('#dc2626'), [])

  const useMyLocation = () => {
    setError(null)
    if (!('geolocation' in navigator)) {
      setError('Your browser does not support GPS. Tap the map to set the location.')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        onChange(p)
        setFlyTarget(p)
        setLocating(false)
      },
      () => {
        setError('Could not get your location. Allow location access, or tap the map instead.')
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 12000 },
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={useMyLocation} disabled={locating} className={ghostBtn}>
          {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crosshair className="h-4 w-4" />}
          Use my current location
        </button>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold ${
            value ? 'bg-emerald-50 text-emerald-800' : 'text-slate-500'
          }`}
        >
          {value ? (
            <>
              <MapPin className="h-4 w-4" />
              {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
            </>
          ) : (
            'or tap the map to drop a pin'
          )}
        </span>
      </div>
      {error && <p className="px-2 text-sm font-bold text-rose-600">{error}</p>}
      <div className="h-72 overflow-hidden rounded-[2.5rem] shadow-lg ring-4 ring-white sm:h-80">
        <MapContainer center={MAP_CENTER} zoom={MAP_ZOOM} scrollWheelZoom className="h-full w-full">
          <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
          <ClickHandler onPick={onChange} />
          <FlyTo target={flyTarget} />
          {value && (
            <Marker
              position={[value.lat, value.lng]}
              icon={icon}
              draggable
              eventHandlers={{
                dragend(e) {
                  const ll = (e.target as LeafletMarker).getLatLng()
                  onChange({ lat: ll.lat, lng: ll.lng })
                },
              }}
            />
          )}
        </MapContainer>
      </div>
    </div>
  )
}
