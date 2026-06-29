const admin = require('firebase-admin');
const serviceAccount = require('./funnyangle-firebase-adminsdk-fbsvc-087c725ac2.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const station = {
  id: 'station-feldstrasse-bunker',
  route_id: 'route-altona-stpauli',
  order: 11,
  name: 'Feldstraßenbunker',
  address: 'Feldstraße 66, 20357 Hamburg',
  lat: 53.558349,
  lng: 9.97132,
  tags: ['architektur', 'geschichte'],
  type: 'location',
  description_short: '38 Meter Beton. 3,5 Meter dicke Wände. Geburtsstätte der Tagesschau. Von der Turnerstraße aus wirkt der Koloss durch die enge Häuserschlucht noch massiver.',
  duration_minutes: 10,
  opening_hours: 'Außenansicht jederzeit. Dachgarten: öffentlich zugänglich (Hilldegarden)',
  image_url: '',
  anecdotes: [
    {
      title: 'Die Geburtsstunde der Tagesschau',
      text: '1952 strahlte der NWDR aus einem winzigen 4,5 × 4,5 Meter Studio im Bunker die erste Tagesschau aus. Ein einziger Redakteur — Martin Svoboda — schnitt Restmaterial aus Wochenschauen zusammen. Ein Klavier passte nicht ins Studio, es stand auf dem Flur. Zwei Jahre zuvor hatte Axel Springer hier bereits die erste Ausgabe der »Hörzu« gedruckt — das einzige intakte Gebäude in der zerstörten Innenstadt.'
    },
    {
      title: '25.000 Menschen in einem Betonklotz',
      text: 'Der Flakturm IV wurde 1942 von 1.000 Zwangsarbeitern in nur 300 Tagen errichtet: 75 × 75 Meter Grundfläche, 38 Meter hoch, Wände 3,5 Meter dick, Decke fünf Meter. Während der Operation Gomorrha im Juli 1943 suchten bis zu 25.000 Menschen Schutz im Bunker — bei einer Kapazität von 18.000. Es gab einen eigenen Kinderwagen-Eingang. Die spiralförmige Treppe nach oben hatte zunächst kein Geländer — bei Panik und Gedränge lebensgefährlich.'
    },
    {
      title: 'Vom Flakturm zum Grünen Bunker',
      text: 'Nach dem Krieg sollte der Bunker gesprengt werden — aber die 3,5-Meter-Wände hätten das halbe Viertel mitgerissen. Stattdessen zogen Mieter ein, dann Filmstudios, dann Clubs wie das Uebel & Gefährlich. Zwischen 2019 und 2024 wurde der Bunker um fünf Stockwerke aufgestockt und mit einem öffentlich zugänglichen Dachgarten begrünt — dem Hilldegarden-Projekt. Ein Flakturm der Nazis, auf dem heute Kräuter wachsen.'
    }
  ],
  quiz_question: {
    question: 'Welche berühmte Sendung wurde erstmals aus dem Feldstraßenbunker ausgestrahlt?',
    options: ['Sportschau', 'Tagesschau', 'Aktuelle Kamera', 'heute'],
    correct_index: 1,
    explanation: '1952 strahlte der NWDR die erste Tagesschau aus einem 4,5 × 4,5 Meter großen Studio im Bunker aus. Ein einzelner Redakteur schnitt die Sendung aus Wochenschau-Restmaterial zusammen.'
  }
};

async function run() {
  // Add new station
  await db.collection('stations').doc(station.id).set({
    ...station,
    created_at: admin.firestore.FieldValue.serverTimestamp()
  });
  console.log('Station hinzugefügt:', station.name);

  // Bump Feldstern order from 11 to 12
  await db.collection('stations').doc('station-feldstern').update({ order: 12 });
  console.log('Feldstern order → 12');

  console.log('\nFertig!');
  process.exit(0);
}

run().catch(err => {
  console.error('Fehler:', err.message);
  process.exit(1);
});
