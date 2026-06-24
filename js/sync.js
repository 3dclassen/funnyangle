import { db } from './firebase.js';
import {
  collection,
  getDocs
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const KEYS = {
  stations: 'fa_stations',
  routes: 'fa_routes',
  visited: 'fa_visited',
  selectedTour: 'fa_selected_tour'
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
