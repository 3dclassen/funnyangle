import { db } from './firebase.js';
import {
  collection,
  getDocs
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const KEYS = {
  stations: 'fa_stations',
  routes: 'fa_routes',
  visited: 'fa_visited',
  selectedTour: 'fa_selected_tour',
  savedTours: 'fa_saved_tours',
  prefs: 'fa_prefs'
};

export async function loadAllData() {
  try {
    const [stSnap, rtSnap] = await Promise.all([
      getDocs(collection(db, 'stations')),
      getDocs(collection(db, 'routes'))
    ]);
    const stations = stSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const routes = rtSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    localStorage.setItem(KEYS.stations, JSON.stringify(stations));
    localStorage.setItem(KEYS.routes, JSON.stringify(routes));
    return { stations, routes };
  } catch (err) {
    console.warn('Offline — lade gecachte Daten', err);
    return getCached();
  }
}

export function getCached() {
  return {
    stations: JSON.parse(localStorage.getItem(KEYS.stations) || '[]'),
    routes: JSON.parse(localStorage.getItem(KEYS.routes) || '[]')
  };
}

export function getVisited() {
  return JSON.parse(localStorage.getItem(KEYS.visited) || '[]');
}

export function markVisited(stationId) {
  const visited = getVisited();
  if (!visited.includes(stationId)) {
    visited.push(stationId);
    localStorage.setItem(KEYS.visited, JSON.stringify(visited));
  }
}

export function getSelectedTour() {
  return JSON.parse(localStorage.getItem(KEYS.selectedTour) || '[]');
}

export function saveSelectedTour(stationIds) {
  localStorage.setItem(KEYS.selectedTour, JSON.stringify(stationIds));
}

// ── Saved tours ──

export function getSavedTours() {
  return JSON.parse(localStorage.getItem(KEYS.savedTours) || '[]');
}

export function saveTour(name, stationIds) {
  const tours = getSavedTours();
  tours.unshift({ name, stationIds, savedAt: Date.now() });
  localStorage.setItem(KEYS.savedTours, JSON.stringify(tours.slice(0, 20)));
}

export function deleteSavedTour(index) {
  const tours = getSavedTours();
  tours.splice(index, 1);
  localStorage.setItem(KEYS.savedTours, JSON.stringify(tours));
}

// ── Preferences ──

export function getPrefs() {
  return JSON.parse(localStorage.getItem(KEYS.prefs) || '{}');
}

export function setPrefs(updates) {
  localStorage.setItem(KEYS.prefs, JSON.stringify({ ...getPrefs(), ...updates }));
}
