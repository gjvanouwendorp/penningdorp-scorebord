const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');

const app = express();
const port = process.env.PORT || 4000;
const mongoUrl = 'mongodb://localhost:27017/?retryWrites=true&w=majority&directConnection=true&serverSelectionTimeoutMS=5000';
const dbName = 'penningdorp-scorebord';
const collectionName = 'scores';

app.use(bodyParser.json());

let db, collection;

// Connectie met MongoDB opzetten
MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, function(err, client) {
  if (err) {
    console.error('Fout bij verbinden met MongoDB:', err);
    process.exit(1);
  }
  db = client.db(dbName);
  collection = db.collection(collectionName);
  // Zorg dat er altijd één document is
  collection.updateOne(
    {},
    { $setOnInsert: { morris: 0, ize: 0 } },
    { upsert: true }
  , function(err) {
    if (err) {
      console.error('Fout bij initialiseren van score document:', err);
      process.exit(1);
    }
    app.listen(port, () => {
      console.log(`Server draait op http://localhost:${port}`);
    });
  });
});

app.get('/api/scores', (req, res) => {
  collection.findOne({}, function(err, score) {
    if (err) {
      return res.status(500).json({ error: 'Serverfout' });
    }
    if (!score) {
      return res.status(404).json({ error: 'Score niet gevonden' });
    }
    res.json({ morris: score.morris, ize: score.ize });
  });
});

app.post('/api/scores', (req, res) => {
  const { morris, ize } = req.body;
  if (typeof morris !== 'number' || typeof ize !== 'number') {
    return res.status(400).json({ error: 'Scores moeten nummers zijn' });
  }
  collection.updateOne({}, { $set: { morris, ize } }, { upsert: true }, function(err) {
    if (err) {
      return res.status(500).json({ error: 'Serverfout' });
    }
    res.json({ morris, ize });
  });
});
