const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3000;
const mongoUrl = 'mongodb://localhost:27017';
const dbName = 'penningdorp-scorebord';
const collectionName = 'scores';

app.use(bodyParser.json());

let db, collection;

// Connectie met MongoDB opzetten
MongoClient.connect(mongoUrl, { useUnifiedTopology: true })
  .then(client => {
    db = client.db(dbName);
    collection = db.collection(collectionName);
    // Zorg dat er altijd één document is
    return collection.updateOne(
      {},
      { $setOnInsert: { morris: 0, ize: 0 } },
      { upsert: true }
    );
  })
  .then(() => {
    app.listen(port, () => {
      console.log(`Server draait op http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error('Fout bij verbinden met MongoDB:', err);
    process.exit(1);
  });

app.get('/api/score', async (req, res) => {
  try {
    const score = await collection.findOne({});
    if (!score) {
      return res.status(404).json({ error: 'Score niet gevonden' });
    }
    res.json({ morris: score.morris, ize: score.ize });
  } catch (err) {
    res.status(500).json({ error: 'Serverfout' });
  }
});

app.post('/api/score', async (req, res) => {
  const { morris, ize } = req.body;
  if (typeof morris !== 'number' || typeof ize !== 'number') {
    return res.status(400).json({ error: 'Scores moeten nummers zijn' });
  }
  try {
    await collection.updateOne({}, { $set: { morris, ize } }, { upsert: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Serverfout' });
  }
});
