# funnyangle — CLAUDE.md

> Letzter Stand: Sprint 2 abgeschlossen (2026-06-25). Alle Änderungen auf `main` gepusht, live auf GitHub Pages.

## Was ist das?

PWA für selbstorganisierte Stadtführungen in Hamburg. Nutzer stellen sich eine Tour aus Stationen zusammen — mit Anekdoten, GPS-Navigation, Tag-Filter und Offline-Unterstützung. Prototyp: 2 Routen, 17 Stationen in Hamburg Altona/St. Pauli.

**Live-URL:** `https://3dclassen.github.io/funnyangle/`
**GitHub:** `https://github.com/3dclassen/funnyangle` (Branch: `main`)
**Lokaler Pfad:** `C:\Users\daniel.classen\OneDrive - Lightshape GmbH & Co. KG\_PRIVATE\BUSINESS\DEV\FUNNYANGLE\funnyangle`

---

## Stack

- **Frontend:** Vanilla JS ES-Module, kein Framework, kein Build-Step, kein npm für Frontend
- **Karte:** Leaflet.js v1.9.4 via CDN + OpenStreetMap
- **Datenbank:** Firebase Firestore (Spark, kostenlos)
- **Auth:** Firebase Auth — Google Login (`signInWithPopup`)
- **Hosting:** GitHub Pages
- **Offline:** Service Worker (cache-first) + localStorage
- **Firebase CDN:** `https://www.gstatic.com/firebasejs/10.12.0/firebase-*.js`

---

## Projektstruktur

```
funnyangle/
├── index.html        — Hauptapp: Karte, Filter, Stationsauswahl, Tour-Panel
├── station.html      — Stationsdetail: Anekdoten, Abhaken, Google Maps-Link
├── tour.html         — Aktive Tour: Fortschrittsbalken, geordnete Stationsliste
├── settings.html     — Einstellungen: Emoji-Avatar, gespeicherte Touren, Prefs
├── crew.html         — Stub (Sprint 3: Gruppen-Features)
├── result.html       — Stub (Sprint 3: Gamification)
├── admin.html        — Stub
├── css/style.css     — Dark Theme, Mobile First (alle Seiten)
├── js/
│   ├── firebase.js   — Firebase init, Auth, Firestore CRUD
│   ├── sync.js       — localStorage Cache + Touren + Preferences
│   ├── app.js        — Shared state (state.user, state.stations, state.selectedStations)
│   ├── map.js        — Leaflet: Pins, Polyline, Legende, Farben
│   ├── tour.js       — formatDuration, buildTagsHtml, optimizeRoute
│   ├── quiz.js       — Stub (Sprint 3)
│   └── crew.js       — Stub (Sprint 3)
├── data/
│   └── stations-seed.json   — Quelldaten (2 Routen, 17 Stationen)
├── scripts/
│   └── import-seed.js       — Einmaliger Firestore-Import (Node.js, firebase-admin)
├── sw.js             — Service Worker, Cache-Name: funnyangle-v4
├── manifest.json     — PWA Manifest
└── icon.svg          — App-Icon (gelbes Dreieck)
```

---

## Firebase

```js
// js/firebase.js
const firebaseConfig = {
  apiKey: "AIzaSyBwzS6JCyRVYphAZe9hJ_E_AcrYTRH6988",
  authDomain: "funnyangle.firebaseapp.com",
  projectId: "funnyangle",
  storageBucket: "funnyangle.firebasestorage.app",
  messagingSenderId: "595026834333",
  appId: "1:595026834333:web:d6e382185796708cc87574"
};
```

**Authorized Domains (Firebase Console → Auth → Settings):**
`localhost`, `funnyangle.firebaseapp.com`, `3dclassen.github.io`

**Firestore Collections:**

| Collection | Felder |
|-----------|--------|
| `stations` | `id, name, lat, lng, tags[], duration_minutes, type, address, opening_hours, anecdotes[], order` |
| `routes` | `id, name, station_ids[]` |
| `users` | `uid, display_name, avatar_emoji, role, created_at` |

**Security Rules:** `allow read, write: if request.auth != null;`

**Exports aus firebase.js:**
- `auth`, `db` — Firebase-Instanzen
- `signInWithGoogle()`, `signOutUser()`, `onAuthChange(cb)`
- `ensureUserProfile(user)` — legt Profil an wenn nicht vorhanden
- `getUserProfile(uid)` → `Promise<data|null>`
- `updateUserProfile(uid, data)` → `Promise<void>`

---

## JavaScript-Module

### js/app.js — Shared State

```js
export const state = { user, stations, routes, selectedStations[] }
export async function initApp({ onLoggedIn, onLoggedOut })
```

`initApp` aufrufen auf jeder Seite. Lädt Stationen und wiederherstellt `selectedStations` aus localStorage. Callback `onLoggedIn(user)` wird aufgerufen sobald Auth + Daten bereit sind.

### js/sync.js — Persistenz

```js
loadAllData()                       // Firestore → localStorage
getVisited() / markVisited(id)
getSelectedTour() / saveSelectedTour(ids)
getSavedTours() / saveTour(name, ids) / deleteSavedTour(index)
getPrefs() / setPrefs({ showLabels: true })
```

**localStorage Keys:**

| Key | Inhalt |
|-----|--------|
| `fa_stations` | Alle Stationen (JSON, offline-Cache) |
| `fa_routes` | Alle Routen (JSON, offline-Cache) |
| `fa_visited` | IDs abgehakter Stationen |
| `fa_selected_tour` | IDs der aktuellen Tour in Reihenfolge |
| `fa_saved_tours` | Array von `{name, stationIds, savedAt}` (max 20) |
| `fa_prefs` | `{showLabels: boolean}` |

### js/map.js — Leaflet

```js
initMap()                           // L.map('#map') → OSM-Tiles
renderPins(stations, onPinClick)    // rendert alle Pins + Legende
refreshPin(stationId)               // einzelnen Pin neu zeichnen (nach Toggle)
refreshAllPins()                    // alle Pins neu (nach Reorder)
renderPolyline()                    // amber Linie zwischen selected Stationen
fitToSelected()                     // Karte auf selected-Bounds zoomen
getTagColor(tag)                    // → Hex-Farbe
```

**Pin-Typen:**
- **Visited** (grün ✓): 14px grüner Kreis mit Häkchen
- **Selected** (amber, nummeriert): 22px Amber-Ring, weiße Zahl, Name-Label darunter, `iconAnchor:[40,11]`
- **Unselected** (Tag-Farbe): 11px Kreis; wenn `prefs.showLabels=true` mit kleinem Label

**Tag-Farben (eindeutig, kein Duplikat):**

| Tag | Hex |
|-----|-----|
| punk | #ef4444 (Rot) |
| musik | #3b82f6 (Blau) |
| psychedelisch | #a855f7 (Lila) |
| weird | #d97706 (Dunkelamber) |
| pause | #06b6d4 (Cyan) |
| essen-trinken | #06b6d4 (Cyan) |
| geschichte | #f97316 (Orange) |
| kunst | #ec4899 (Pink) |
| politik | #6366f1 (Indigo) |
| natur | #84cc16 (Lime) |
| architektur | #64748b (Slate) |
| wow | #fbbf24 (Gelb) |
| spiegelung | #22d3ee (Hellblau) |
| stille | #94a3b8 (Grau) |
| street-art | #f43f5e (Rose) |
| lost-place | #78716c (Braun) |

Grün (`#22c55e`) ist **reserviert für Visited**. Amber (`#f59e0b`) für Selected und Accent.

### js/tour.js — Tour-Logik

```js
formatDuration(minutes)             // → "2h 15min" oder "45 Min"
buildTagsHtml(tags)                 // → HTML-Badges
optimizeRoute(stationIds)           // Nearest-Neighbor, erste Station = Startpunkt
```

`optimizeRoute` importiert `state` aus `app.js`. Erst ab 3 Stationen aktiv.

---

## index.html — Hauptapp

**Views:** loading → login → app (3-State-Pattern)

**Auth-Flow:**
1. `initApp` → `onAuthStateChanged`
2. `onLoggedIn`: lädt Daten, prüft `?tour=`-URL-Param, rendert Karte
3. `onLoggedOut`: zeigt Login-Screen

**Tour-Auswahl:**
- `toggleStation(id)` → fügt hinzu / entfernt, ruft `optimizeRoute` auf, speichert, aktualisiert Pins + Polyline + Bottom Bar
- `clearSelection()` → reset

**Bottom Bar** (erscheint wenn Stationen ausgewählt):
```
[×]  [ca. 2h 30min · 5 Stationen]  [↑ Tour]  [Start]
```

**Tour-Panel (Bottom Sheet):**
- Öffnet per "↑ Tour"-Button
- Zeigt geordnete Liste mit `↑↓`-Reorder-Buttons
- "Teilen"-Button → `navigator.share()` (mobil) / Clipboard (Desktop)
- "Tour starten" → `tour.html`

**URL-Sharing:** `?tour=id1,id2,id3` — wird nach Login automatisch geladen und URL bereinigt

**Settings-Link:** ⚙️-Icon im Header → `settings.html`

---

## settings.html

- Emoji-Avatar auswählen (24 Emojis, Grid 8×3)
- Anzeigename bearbeiten → Firestore `updateUserProfile`
- Aktuelle Tour benennen + speichern → `saveTour()` → localStorage
- Gespeicherte Touren laden (setzt `fa_selected_tour`) oder löschen
- Toggle "Stationsnamen auf Karte" → `setPrefs({showLabels})`
- Crew-Sektion: Info-Box "kommt in Sprint 3"

---

## Service Worker

Cache-Name: **`funnyangle-v4`** — bei Code-Änderungen auf v5 bumpen.

Strategie:
- Firebase-APIs → nie cachen (pass-through)
- OSM-Kartenkacheln → Network-first mit Cache-Fallback
- Alles andere (App-Shell) → Cache-first

Wenn Nutzer veralteten Cache sieht: DevTools → Application → Service Workers → Unregister, dann Seite neu laden.

---

## Sprint-Stand

| Sprint | Was | Status |
|--------|-----|--------|
| 1 | Karte, Login, Stationsdetail, Abhaken, Offline-PWA | ✅ fertig |
| 2 | Nummerierte Pins, Tour-Panel, Route-Optimierung, Sharing, Settings | ✅ fertig |
| 3 | Crew/Gruppen, Proximity-Erkennung, Gamification (Quiz, Punkte) | 🔜 |

---

## Sprint 3 — Geplante Features

**Gruppen (crew.html):**
- User können eine "Crew" anlegen und sich gegenseitig einladen (via Firestore-Subcollection oder Code)
- Proximity-Erkennung: Browser-Geolocation + Firestore-Realtime → zeigt an wenn Crew-Mitglied in der Nähe einer Station ist
- Gemeinsame Tour-Planung in Echtzeit

**Gamification:**
- Quiz-Fragen pro Station (Felder schon in Datenschema vorgesehen)
- Punkte-System, Abzeichen
- `result.html` — Tour-Auswertung nach Abschluss

**Weitere Ideen:**
- "In der Nähe starten" — GPS erkennt nächste Station automatisch
- Echte Gehzeit zwischen Stationen (Luftlinie × 1.3 / 5 km/h Fußtempo)
- Audio-Guide (optional, komplex — kein Must-have)

---

## Bekannte Fallstricke

1. **Service Worker Caching:** Nutzer sehen alten Stand → Cache-Name bumpen (v4 → v5) und Nutzer um SW-Unregistrierung bitten
2. **Firebase Authorized Domains:** Neuer Hostname muss unter Firebase Console → Auth → Settings → Authorized Domains eingetragen werden (war Ursache für "Login öffnet sich nicht")
3. **OneDrive + npm:** `npm install` auf OneDrive-Pfad gibt TAR_ENTRY_ERROR-Warnungen — harmlos, firebase-admin installiert sich trotzdem
4. **Firestore Rules:** Default-Rules blockieren alles. Aktuell: `allow read, write: if request.auth != null`
5. **iconAnchor bei Leaflet:** Für numbered Pins (80×42px) ist `iconAnchor: [40, 11]` korrekt — Ankerpunkt ist Mitte des 22px-Kreises. Falsche Anchor lassen Pins seitlich verrutschen.

---

## Seed-Import (einmalig, schon erledigt)

```bash
npm install
node scripts/import-seed.js
```

Benötigt `scripts/funnyangle-firebase-adminsdk-*.json` — **niemals committen** (steht in .gitignore).

---

## Arbeits-Prinzipien

- **Kein Framework** — Vanilla JS, alle Deps per CDN
- **Mobile First** — Touch-Targets min. 44px, `max-width: 480px` in CSS
- **Offline First** — localStorage ist primär, Firestore ist Fallback
- **Keine npm-Deps im Frontend** — nur `firebase-admin` als Dev-Dep für den Import
