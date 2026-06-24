const admin = require('firebase-admin');
const serviceAccount = require('./funnyangle-firebase-adminsdk-fbsvc-087c725ac2.json');
const seedData = require('../data/stations-seed.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function importData() {
  console.log('Starte Firestore-Import...\n');

  for (const route of seedData.routes) {
    await db.collection('routes').doc(route.id).set({
      ...route,
      created_at: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`Route: ${route.name}`);
  }

  console.log('');

  for (const station of seedData.stations) {
    await db.collection('stations').doc(station.id).set({
      ...station,
      created_at: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`Station: ${station.name}`);
  }

  console.log(`\nFertig! ${seedData.routes.length} Routen, ${seedData.stations.length} Stationen`);
  process.exit(0);
}

importData().catch(err => {
  console.error('Import fehlgeschlagen:', err.message);
  process.exit(1);
});
