import { state } from './app.js';
import { getVisited } from './sync.js';

let _map = null;
const _markers = {};

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

function makeIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2.5px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.5)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });
}

export function renderPins(stations, onPinClick) {
  Object.values(_markers).forEach(m => m.remove());
  Object.keys(_markers).forEach(k => delete _markers[k]);

  const visited = getVisited();

  stations.forEach(station => {
    const isVisited = visited.includes(station.id);
    const isSelected = state.selectedStations.includes(station.id);
    const color = isVisited ? '#22c55e' : isSelected ? '#f59e0b' : getTagColor(station.tags?.[0]);

    const marker = L.marker([station.lat, station.lng], { icon: makeIcon(color) })
      .addTo(_map)
      .bindTooltip(station.name, { direction: 'top', offset: [0, -8] });

    marker.on('click', () => onPinClick(station));
    _markers[station.id] = marker;
  });
}

export function refreshPin(stationId) {
  const station = state.stations.find(s => s.id === stationId);
  if (!station || !_markers[stationId]) return;

  _markers[stationId].remove();
  const visited = getVisited();
  const isVisited = visited.includes(stationId);
  const isSelected = state.selectedStations.includes(stationId);
  const color = isVisited ? '#22c55e' : isSelected ? '#f59e0b' : getTagColor(station.tags?.[0]);

  _markers[stationId] = L.marker([station.lat, station.lng], { icon: makeIcon(color) })
    .addTo(_map)
    .bindTooltip(station.name, { direction: 'top', offset: [0, -8] });

  _markers[stationId].on('click', () => {});
}
