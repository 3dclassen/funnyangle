import { getTagColor } from './map.js';

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
