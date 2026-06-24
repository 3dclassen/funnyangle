import { state } from './app.js';
import { getVisited } from './sync.js';

let _map = null;
const _markers = {};
let _polyline = null;
let _pinClickHandlers = {};

const TAG_COLORS = {
  punk: '#ef4444',
  musik: '#3b82f6',
  psychedelisch: '#a855f7',
  weird: '#f59e0b',
  pause: '#22c55e',
  'essen-trinken': '#22c55e',
  geschichte: '#f97316',
  kunst: '#ec4899',
  politik: '#6366f1',
  natur: '#10b981',
  architektur: '#64748b',
  wow: '#fbbf24',
  spiegelung: '#06b6d4',
  stille: '#10b981',
  'street-art': '#f43f5e',
  'lost-place': '#78716c'
};

export function getTagColor(tag) {
  return TAG_COLORS[tag] || '#94a3b8';
}

export function initMap() {
  _map = L.map('map', { zoomControl: true }).setView([53.553, 9.992], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
    maxZoom: 19
  }).addTo(_map);
  return _map;
}

function pinColor(station) {
  const visited = getVisited();
  if (visited.includes(station.id)) return { color: '#16a34a', size: 14 };
  if (state.selectedStations.includes(station.id)) return { color: '#22c55e', size: 16 };
  return { color: getTagColor(station.tags?.[0]), size: 12 };
}

function makeIcon(color, size) {
  return L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2.5px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.5)"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
}

export function renderPins(stations, onPinClick) {
  Object.values(_markers).forEach(m => m.remove());
  Object.keys(_markers).forEach(k => delete _markers[k]);
  _pinClickHandlers = {};

  stations.forEach(station => {
    const { color, size } = pinColor(station);
    const marker = L.marker([station.lat, station.lng], { icon: makeIcon(color, size) })
      .addTo(_map)
      .bindTooltip(station.name, { direction: 'top', offset: [0, -8] });

    const handler = () => onPinClick(station);
    marker.on('click', handler);
    _markers[station.id] = marker;
    _pinClickHandlers[station.id] = { handler, onPinClick };
  });
}

export function refreshPin(stationId) {
  const station = state.stations.find(s => s.id === stationId);
  if (!station || !_markers[stationId]) return;

  _markers[stationId].remove();
  const { color, size } = pinColor(station);
  const saved = _pinClickHandlers[stationId];

  const marker = L.marker([station.lat, station.lng], { icon: makeIcon(color, size) })
    .addTo(_map)
    .bindTooltip(station.name, { direction: 'top', offset: [0, -8] });

  if (saved) marker.on('click', saved.handler);
  _markers[stationId] = marker;
}

// Draws a dashed polyline connecting selected stations in their order
export function renderPolyline() {
  if (_polyline) { _polyline.remove(); _polyline = null; }
  if (state.selectedStations.length < 2) return;

  const coords = state.selectedStations
    .map(id => state.stations.find(s => s.id === id))
    .filter(Boolean)
    .map(s => [s.lat, s.lng]);

  _polyline = L.polyline(coords, {
    color: '#22c55e',
    weight: 2,
    opacity: 0.6,
    dashArray: '8, 10'
  }).addTo(_map);
}

// Zooms map to fit all selected stations
export function fitToSelected() {
  if (!state.selectedStations.length) return;
  const stations = state.selectedStations
    .map(id => state.stations.find(s => s.id === id))
    .filter(Boolean);
  if (!stations.length) return;
  const bounds = L.latLngBounds(stations.map(s => [s.lat, s.lng]));
  _map.fitBounds(bounds, { padding: [48, 48], maxZoom: 15 });
}
