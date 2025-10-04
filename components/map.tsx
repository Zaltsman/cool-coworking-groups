'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { CoworkingGroup } from '@/lib/supabase'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icons in React-Leaflet
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

type MapProps = {
  groups: CoworkingGroup[]
}

export default function Map({ groups }: MapProps) {
  // Filter groups that have BOTH latitude AND longitude
  const groupsWithCoords = groups.filter(g => g.latitude !== null && g.longitude !== null)

  return (
    <div className="border border-border-color rounded-lg overflow-hidden" style={{ height: '500px' }}>
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <style>{`
          .leaflet-container {
            background-color: #E5E7E0 !important;
          }
          .leaflet-tile-pane {
            filter: hue-rotate(20deg) saturate(150%) brightness(0.85);
          }
        `}</style>
        {groupsWithCoords.map((group) => (
          <Marker
            key={group.id}
            position={[group.latitude!, group.longitude!]}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold mb-1">{group.group_name}</h3>
                <p className="text-sm opacity-80 mb-2">{group.location}</p>
                {group.website_url && (
                  <a
                    href={group.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-posthog-red hover:underline"
                  >
                    Visit website →
                  </a>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
