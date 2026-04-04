// components/MapView.jsx
import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const STATUS_COLORS = {
  open:          '#ef4444',
  'in-progress': '#f59e0b',
  resolved:      '#10b981',
};

const CATEGORY_ICONS = {
  pothole: '🕳️', streetlight: '💡', garbage: '🗑️',
  waterlogging: '💧', fallen_tree: '🌳', stray_animals: '🐕', other: '⚠️',
};

const createMarker = (color, emoji) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
      <ellipse cx="16" cy="38" rx="6" ry="2.5" fill="rgba(0,0,0,0.15)"/>
      <path d="M16 2C9.4 2 4 7.4 4 14c0 9 12 24 12 24s12-15 12-24c0-6.6-5.4-12-12-12z" fill="${color}"/>
      <circle cx="16" cy="14" r="7" fill="white" opacity="0.9"/>
      <text x="16" y="18" text-anchor="middle" font-size="9">${emoji}</text>
    </svg>`;
  return L.divIcon({ html: svg, iconSize: [32, 40], iconAnchor: [16, 40], popupAnchor: [0, -40], className: '' });
};

const HeatmapLayer = ({ issues }) => {
  const map = useMap();
  const heatRef = useRef(null);
  useEffect(() => {
    if (typeof L.heatLayer !== 'function') return;
    const points = issues
      .filter(i => i.location?.lat && i.location?.lng)
      .map(i => [i.location.lat, i.location.lng, Math.min(1, (i.upvotes || 0) / 20 + 0.3)]);
    if (heatRef.current) map.removeLayer(heatRef.current);
    heatRef.current = L.heatLayer(points, {
      radius: 35, blur: 20, maxZoom: 14,
      gradient: { 0.2: '#3b82f6', 0.5: '#f59e0b', 0.8: '#ef4444' },
    }).addTo(map);
    return () => { if (heatRef.current) map.removeLayer(heatRef.current); };
  }, [issues, map]);
  return null;
};

const FitBounds = ({ issues }) => {
  const map = useMap();
  useEffect(() => {
    const valid = issues.filter(i => i.location?.lat && i.location?.lng);
    if (!valid.length) return;
    map.fitBounds(
      L.latLngBounds(valid.map(i => [i.location.lat, i.location.lng])),
      { padding: [40, 40], maxZoom: 14 }
    );
  }, [issues, map]);
  return null;
};

const MapView = ({ issues, onIssueClick, showHeatmap = false }) => (
  <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200" style={{ height: '520px' }}>
    <MapContainer
      center={[12.9716, 77.5946]}
      zoom={12}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
    >
      {/* ── Light OSM tiles ── */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        maxZoom={19}
      />

      <FitBounds issues={issues} />
      {showHeatmap && <HeatmapLayer issues={issues} />}

      {!showHeatmap && issues.map(issue => {
        if (!issue.location?.lat || !issue.location?.lng) return null;
        const color = STATUS_COLORS[issue.status] || STATUS_COLORS.open;
        const emoji = CATEGORY_ICONS[issue.category] || '⚠️';
        return (
          <Marker
            key={issue._id}
            position={[issue.location.lat, issue.location.lng]}
            icon={createMarker(color, emoji)}
            eventHandlers={{ click: () => onIssueClick(issue) }}
          >
            <Popup>
              <div
                style={{ borderRadius: 10, padding: 10, minWidth: 190, cursor: 'pointer' }}
                onClick={() => onIssueClick(issue)}
              >
                <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, color: '#1e293b' }}>{issue.title}</p>
                <p style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>{issue.location?.address}</p>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: '#10b981' }}>▲ {issue.upvotes || 0}</span>
                  <span style={{ fontSize: 11, color: '#ef4444' }}>▼ {issue.downvotes || 0}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: color + '22', color, border: `1px solid ${color}55` }}>
                    {issue.status}
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>

    {/* Legend */}
    <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 border border-slate-200 rounded-xl p-3 space-y-1.5 shadow-md">
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Status</p>
      {Object.entries(STATUS_COLORS).map(([s, color]) => (
        <div key={s} className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
          <span className="text-[10px] text-slate-600 capitalize">{s.replace('-', ' ')}</span>
        </div>
      ))}
    </div>

    {/* Count badge */}
    <div className="absolute top-4 right-4 z-[1000] bg-white/95 border border-slate-200 rounded-xl px-3 py-2 shadow-md">
      <span className="text-xs font-semibold text-slate-600">
        {issues.filter(i => i.location?.lat).length} mapped
      </span>
    </div>
  </div>
);

export default MapView;