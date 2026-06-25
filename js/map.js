import { state } from './app.js';
import { getVisited, getPrefs } from './sync.js';

let _map = null;
const _markers = {};
let _polyline = null;
let _pinClickHandlers = {};
let _legend = null;

// No color appears twice. Green is reserved for "visited". Amber for "selected".
const TAG_COLORS = {
  punk:           '#ef4444',
  musik:          '#3b82f6',
  psychedelisch:  '#a855f7',
  weird:          '#d97706',
  pause:          '#06b6d4',
  'essen-trinken':'#06b6d4',
  geschichte:     '#f97316',
  kunst:          '#ec4899',
  politik:        '#6366f1',
  natur:          '#84cc16',
  architektur:    '#64748b',
  wow:            '#fbbf24',
  spiegelung:     '#22d3ee',
  stille:         '#94a3b8',
  'street-art':   '#f43f5e',
  'lost-place':   '#78716c'
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

function makeIcon(station) {
  const visited = getVisited();
  const prefs = getPrefs();

  // ── Visited: green circle with ✓ ──
  if (visited.includes(station.id)) {
    return L.divIcon({
      className: '',
      html: `<div style="width:14px;height:14px;border-radius:50%;background:#22c55e;border:2px solid #fff;display:flex;align-items:center;justify-content:center;font-size:8px;color:#fff;font-weight:900;box-shadow:0 2px 6px rgba(0,0,0,0.55)">✓</div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });
  }

  const tourIdx = state.selectedStations.indexOf(station.id);

  // ── Selected: numbered amber ring + name label ──
  if (tourIdx !== -1) {
    const num = tourIdx + 1;
    const raw = station.name || '';
    const label = raw.length > 20 ? raw.slice(0, 19) + '…' : raw;
    return L.divIcon({
      className: '',
      html: `<div style="width:80px;display:flex;flex-direction:column;align-items:center">` +
        `<div style="width:22px;height:22px;border-radius:50%;background:#1a1a2e;border:3px solid #f59e0b;color:#f59e0b;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 10px rgba(0,0,0,0.65);line-height:1;flex-shrink:0">${num}</div>` +
        `<div style="margin-top:3px;font-size:9px;font-weight:700;color:#f1f5f9;background:rgba(15,15,26,0.9);padding:2px 6px;border-radius:3px;border:1px solid rgba(245,158,11,0.35);white-space:nowrap;max-width:78px;overflow:hidden;text-overflow:ellipsis;text-align:center;line-height:1.3">${label}</div>` +
        `</div>`,
      iconSize: [80, 42],
      iconAnchor: [40, 11]
    });
  }

  // ── Unselected: colored dot (optional label) ──
  const color = getTagColor(station.tags?.[0]);
  const size = 11;

  if (prefs.showLabels) {
    const raw = station.name || '';
    const label = raw.length > 18 ? raw.slice(0, 17) + '…' : raw;
    return L.divIcon({
      className: '',
      html: `<div style="width:70px;display:flex;flex-direction:column;align-items:center">` +
        `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid rgba(255,255,255,0.8);box-shadow:0 2px 4px rgba(0,0,0,0.4)"></div>` +
        `<div style="margin-top:2px;font-size:8px;font-weight:600;color:#f1f5f9;background:rgba(15,15,26,0.82);padding:1px 4px;border-radius:3px;white-space:nowrap;max-width:70px;overflow:hidden;text-overflow:ellipsis;text-align:center;line-height:1.3">${label}</div>` +
        `</div>`,
      iconSize: [70, 32],
      iconAnchor: [35, 5.5]
    });
  }

  return L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid rgba(255,255,255,0.8);box-shadow:0 2px 4px rgba(0,0,0,0.4)"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
}

export function renderPins(stations, onPinClick) {
  Object.values(_markers).forEach(m => m.remove());
  Object.keys(_markers).forEach(k => delete _markers[k]);
  _pinClickHandlers = {};

  stations.forEach(station => {
    const marker = L.marker([station.lat, station.lng], { icon: makeIcon(station) })
      .addTo(_map);

    // Unselected pins keep tooltip; selected pins show their label directly
    if (!state.selectedStations.includes(station.id) && !getVisited().includes(station.id)) {
      marker.bindTooltip(station.name, { direction: 'top', offset: [0, -8] });
    }

    const handler = () => onPinClick(station);
    marker.on('click', handler);
    _markers[station.id] = marker;
    _pinClickHandlers[station.id] = { handler, onPinClick };
  });

  renderLegend(stations);
}

export function refreshPin(stationId) {
  const station = state.stations.find(s => s.id === stationId);
  if (!station || !_markers[stationId]) return;

  _markers[stationId].remove();
  const saved = _pinClickHandlers[stationId];

  const marker = L.marker([station.lat, station.lng], { icon: makeIcon(station) })
    .addTo(_map);

  if (!state.selectedStations.includes(stationId) && !getVisited().includes(stationId)) {
    marker.bindTooltip(station.name, { direction: 'top', offset: [0, -8] });
  }

  if (saved) marker.on('click', saved.handler);
  _markers[stationId] = marker;
}

export function refreshAllPins() {
  Object.keys(_markers).forEach(id => refreshPin(id));
}

// Dashed amber polyline connecting selected stations
export function renderPolyline() {
  if (_polyline) { _polyline.remove(); _polyline = null; }
  if (state.selectedStations.length < 2) return;

  const coords = state.selectedStations
    .map(id => state.stations.find(s => s.id === id))
    .filter(Boolean)
    .map(s => [s.lat, s.lng]);

  _polyline = L.polyline(coords, {
    color: '#f59e0b',
    weight: 2.5,
    opacity: 0.55,
    dashArray: '8, 10'
  }).addTo(_map);
}

export function fitToSelected() {
  if (!state.selectedStations.length) return;
  const stations = state.selectedStations
    .map(id => state.stations.find(s => s.id === id))
    .filter(Boolean);
  if (!stations.length) return;
  const bounds = L.latLngBounds(stations.map(s => [s.lat, s.lng]));
  _map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
}

// ── Color legend (Leaflet custom control) ──

function renderLegend(visibleStations) {
  if (_legend) { _map.removeControl(_legend); _legend = null; }

  const usedTags = [...new Set(visibleStations.flatMap(s => s.tags || []))]
    .filter(tag => TAG_COLORS[tag]);
  if (!usedTags.length) return;

  const LegendControl = L.Control.extend({
    options: { position: 'bottomleft' },
    onAdd() {
      const div = L.DomUtil.create('div', 'map-legend-ctrl');
      let open = false;

      const btn = document.createElement('button');
      btn.className = 'legend-toggle-btn';
      btn.textContent = '≡ Legende';

      const body = document.createElement('div');
      body.className = 'legend-body';
      body.style.display = 'none';
      body.innerHTML = usedTags.map(tag =>
        `<div class="legend-item"><div class="legend-dot" style="background:${getTagColor(tag)}"></div>${tag}</div>`
      ).join('') +
        `<div class="legend-item" style="margin-top:5px;padding-top:5px;border-top:1px solid rgba(255,255,255,0.08)">` +
          `<div style="width:10px;height:10px;border-radius:50%;border:2.5px solid #f59e0b;flex-shrink:0"></div>ausgewählt` +
        `</div>` +
        `<div class="legend-item"><div class="legend-dot" style="background:#22c55e"></div>abgehakt</div>`;

      btn.addEventListener('click', e => {
        L.DomEvent.stopPropagation(e);
        open = !open;
        body.style.display = open ? 'block' : 'none';
        btn.textContent = open ? '× Legende' : '≡ Legende';
      });

      L.DomEvent.disableClickPropagation(div);
      div.appendChild(btn);
      div.appendChild(body);
      return div;
    }
  });

  _legend = new LegendControl();
  _map.addControl(_legend);
}
