import { onAuthChange, ensureUserProfile } from './firebase.js';
import { loadAllData, getSelectedTour } from './sync.js';

export const state = {
  user: null,
  stations: [],
  routes: [],
  selectedStations: []
};

export async function initApp({ onLoggedIn, onLoggedOut } = {}) {
  onAuthChange(async (user) => {
    state.user = user;
    if (user) {
      try { await ensureUserProfile(user); } catch (e) { console.warn('userProfile:', e.code); }
      const data = await loadAllData();
      state.stations = data.stations;
      state.routes = data.routes;
      const saved = getSelectedTour();
      if (saved.length) state.selectedStations = [...saved];
      if (onLoggedIn) onLoggedIn(user);
    } else {
      if (onLoggedOut) onLoggedOut();
    }
  });
}
