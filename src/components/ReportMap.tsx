import { useEffect, useMemo } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import { Clock, MapPin } from 'lucide-react'
import type { Report } from '../lib/types'
import { MAP_CENTER, MAP_ZOOM, SEVERITY_HEX, typeMeta } from '../lib/constants'
import { timeAgo } from '../lib/format'
import { SeverityBadge, StatusBadge } from './Badges'

export const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
export const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

export function pinIcon(hex: string) {
  return L.divIcon({
    className: '',
    html: `<div class="pin" style="background:${hex}"></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  })
}

function FitToReports({ reports }: { reports: Report[] }) {
  const map = useMap()
  useEffect(() => {
    if (reports.length === 0) return
    const bounds = L.latLngBounds(reports.map((r) => [r.lat, r.lng] as [number, number]))
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 })
  }, [reports, map])
  return null
}

interface Props {
  reports: Report[]
  className?: string
  fit?: boolean
}

export default function ReportMap({ reports, className = 'h-[28rem]', fit = true }: Props) {
  const markers = useMemo(
    () =>
      reports.map((r) => ({
        report: r,
        icon: pinIcon(SEVERITY_HEX[r.severity]),
      })),
    [reports],
  )

  return (
    <div className={`overflow-hidden rounded-[3.5rem] shadow-xl ring-4 ring-white ${className}`}>
      <MapContainer center={MAP_CENTER} zoom={MAP_ZOOM} scrollWheelZoom className="h-full w-full">
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
        {fit && <FitToReports reports={reports} />}
        {markers.map(({ report: r, icon }) => {
          const TypeIcon = typeMeta(r.type).icon
          return (
            <Marker key={r.id} position={[r.lat, r.lng]} icon={icon}>
              <Popup minWidth={230} maxWidth={280}>
                <div className="space-y-2.5">
                  <div className="flex flex-wrap gap-1.5 pr-5">
                    <SeverityBadge severity={r.severity} />
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="flex items-start gap-2 text-base font-black leading-tight text-ink">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                      <TypeIcon className="h-3.5 w-3.5" />
                    </span>
                    <span>{r.title}</span>
                  </p>
                  {r.photo_url && (
                    <img
                      src={r.photo_url}
                      alt={r.title}
                      className="h-28 w-full rounded-2xl object-cover"
                      loading="lazy"
                    />
                  )}
                  {r.description && (
                    <p className="line-clamp-3 text-sm font-semibold text-slate-600">{r.description}</p>
                  )}
                  <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold text-slate-400">
                    {r.barangay && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {r.barangay}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {timeAgo(r.created_at)}
                    </span>
                  </p>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}

export function MapLegend() {
  const items: [string, string][] = [
    ['Low', SEVERITY_HEX.low],
    ['Moderate', SEVERITY_HEX.moderate],
    ['High', SEVERITY_HEX.high],
    ['Critical', SEVERITY_HEX.critical],
  ]
  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map(([label, hex]) => (
        <span
          key={label}
          className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-black uppercase tracking-wider shadow-sm ring-1 ring-black/5"
        >
          <span className="h-3 w-3 rounded-full" style={{ background: hex }} />
          {label}
        </span>
      ))}
    </div>
  )
}
