# funnyangle — CLAUDE.md

## Was ist das?

PWA für selbstorganisierte Stadtführungen in Hamburg. Stationen mit Anekdoten, GPS-Navigation, Tag-Filter, Offline-Fähigkeit. Später: Gruppen-Connect, Gamification (Quiz, Punkte).

Prototyp: 2 Routen, 17 Stationen in Hamburg Altona/St. Pauli.

## Stack

- **Frontend:** Vanilla JS (ES-Module, kein Framework, kein Build-Step)
- **Karte:** Leaflet.js via CDN + OpenStreetMap
- **Datenbank:** Firebase Firestore (Spark, kostenlos)
- **Auth:** Firebase Auth (Google Login only)
- **Hosting:** GitHub Pages → https://3dclassen.github.io/funnyangle/
- **Offline:** Service Worker + localStorage Cache

Kein npm für das Frontend. Firebase wird per CDN-Import geladen (`https://www.gstatic.com/firebasejs/10.12.0/...`).

## Projektstruktur

```
funnyangle/
├── index.html       — Startbildschirm: Karte, Filter, Stationsauswahl
├── station.html     — Stationsdetail: Anekdoten, Abhaken, Navigation
├── tour.html        — Aktive Tour: Fortschrittsbalken, Stationsliste
├── crew.html        — Stub (Sprint 2: Gruppen-Features)
├── result.html      — Stub (Sprint 3: Gamification-Auswertung)
├── admin.html       — Stub (Stationsverwaltung)
├── css/style.css    — Dark Theme, Mobile First
├── js/
│   ├── firebase.js  — Firebase init, Auth, Firestore exports
│   ├── sync.js      — localStorage Cache, Daten laden/speichern
│   ├── app.js       — Shared state (state.user, state.stations, ...)
│   ├── map.js       — Leaflet: initMap, renderPins, refreshPin, getTagColor
│   ├── tour.js      — Hilfsfunktionen: formatDuration, buildTagsHtml
│   ├── quiz.js      — Stub (Sprint 3)
│   └── crew.js      — Stub (Sprint 2)
├── data/
│   └── stations-seed.json  — Quelldaten (2 Routen, 17 Stationen)
├── scripts/
│   └── import-seed.js      — Einmaliger Firestore-Import (Node.js)
├── sw.js            — Service Worker (Cache-first für App-Shell)
├── manifest.json    — PWA Manifest
└── icon.svg         — App-Icon
```

## Firebase

- **Projekt-ID:** `funnyangle`
- **Auth-Domain:** `funnyangle.firebaseapp.com`
- **Authorized Domains:** `localhost`, `funnyangle.firebaseapp.com`, `cycobitch.github.io`, `3dclassen.github.io`
- **Firestore Collections:** `stations`, `routes`, `users`
- **Security Rules:** eingeloggte User dürfen lesen; schreiben nur Admins (role == 'admin')

## localStorage Keys

| Key | Inhalt |
|-----|--------|
| `fa_stations` | Alle Stationen (JSON-Array, gecacht) |
| `fa_routes` | Alle Routen (JSON-Array, gecacht) |
| `fa_visited` | IDs abgehakter Stationen |
| `fa_selected_tour` | IDs der aktuell gewählten Tour-Stationen |

## Seed-Import (einmalig)

```bash
npm install
node scripts/import-seed.js
```

Benötigt `scripts/funnyangle-firebase-adminsdk-*.json` (niemals committen — steht in .gitignore).

## Sprint-Plan

| Sprint | Was | Status |
|--------|-----|--------|
| 1 | Karte, Login, Stationsdetail, Abhaken, PWA | ✅ gebaut |
| 2 | Gruppen-Connect, Proximity-Erkennung | 🔜 |
| 3 | Gamification: Quiz, Punkte, Auswertung | 🔜 |

## Wichtige Prinzipien

- **Kein Framework** — Vanilla JS, gleiche Architektur wie Festival Buddy
- **Offline First** — Service Worker + localStorage, Firestore ist Fallback
- **Mobile First** — Touch-Targets min. 44px, kein horizontales Scrollen
- **Kein npm für Frontend** — alle Abhängigkeiten per CDN
