'use client';

import { useEffect, useRef } from 'react';

interface LeafletMapProps {
  lat: number;
  lng: number;
  label: string;
  mapsUrl?: string;
}

export default function LeafletMap({ lat, lng, label, mapsUrl }: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Dynamically import leaflet (client-only)
    import('leaflet').then((L) => {
      // Fix default marker icons
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current!, {
        center: [lat, lng],
        zoom: 16,
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: false,
      });

      // Dark tile layer (CartoDB Dark Matter)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Custom gold marker
      const goldIcon = L.divIcon({
        className: '',
        html: `
          <div style="
            width: 36px; height: 36px;
            background: linear-gradient(135deg, #A8893E, #C9A961, #E2C785);
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid #1A1A1A;
            box-shadow: 0 4px 16px rgba(201,169,97,0.5);
          ">
            <div style="
              width: 10px; height: 10px;
              background: #1A1A1A;
              border-radius: 50%;
              position: absolute;
              top: 50%; left: 50%;
              transform: translate(-50%, -50%);
            "></div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -38],
      });

      const marker = L.marker([lat, lng], { icon: goldIcon }).addTo(map);

      // Popup
      const popupContent = `
        <div style="font-family: sans-serif; padding: 4px; min-width: 160px;">
          <p style="font-weight: 800; font-size: 13px; margin: 0 0 4px; color: #1A1A1A;">${label}</p>
          ${mapsUrl ? `<a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" style="font-size: 11px; color: #A8893E; font-weight: 700; text-decoration: none;">Buka di Google Maps ↗</a>` : ''}
        </div>
      `;
      marker.bindPopup(popupContent).openPopup();

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng, label, mapsUrl]);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <div ref={mapRef} className="w-full h-full" />
    </>
  );
}
