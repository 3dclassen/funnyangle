import { getTagColor } from './map.js';
import { state } from './app.js';

export { getTagColor };

export function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}min` : `${m} Min`;
}

export function buildTagsHtml(tags) {
  return (tags || []).map(tag => {
    const color = getTagColor(tag);
    return `<span class="tag-badge" style="color:${color};border-color:${color}">${tag}</span>`;
  }).join('');
}

// Nearest-neighbor route optimization. First station is fixed as start point.
export function optimizeRoute(stationIds) {
  if (stationIds.length < 3) return stationIds;
  const stations = stationIds.map(id => state.stations.find(s => s.id === id)).filter(Boolean);
  if (stations.length < 3) return stationIds;

  const remaining = stations.slice(1);
  const result = [stations[0]];

  while (remaining.length) {
    const last = result[result.length - 1];
    let nearestIdx = 0;
    let minDist = Infinity;
    remaining.forEach((s, i) => {
      const d = Math.hypot(s.lat - last.lat, s.lng - last.lng);
      if (d < minDist) { minDist = d; nearestIdx = i; }
    });
    result.push(remaining.splice(nearestIdx, 1)[0]);
  }

  return result.map(s => s.id);
}
