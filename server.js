const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');

const app = express();
const port = process.env.PORT || 4000;
const mongoUrl = 'mongodb://localhost:27017';
const dbName = 'penningdorp-scorebord';
const collectionName = 'scores';

app.use(bodyParser.json());

let db, collection;

const mongoOptions = {
  useUnifiedTopology: true,
  retryWrites: true,
  w: 'majority',
  directConnection: true,
  serverSelectionTimeoutMS: 5000
};

async function startServer() {
  try {
    console.log('Connecting to MongoDB...');
    const client = await MongoClient.connect(mongoUrl, mongoOptions);
    console.log('Connected to MongoDB');

    db = client.db(dbName);
    console.log(`Database selected: ${dbName}`);

    collection = db.collection(collectionName);
    console.log(`Collection selected: ${collectionName}`);

    // Zorg dat er altijd één document is
    const updateResult = await collection.updateOne(
      {},
      { $setOnInsert: { morris: 0, ize: 0 } },
      { upsert: true }
    );
    if (updateResult.upsertedCount > 0) {
      console.log('Score document created');
    } else {
      console.log('Score document already exists');
    }

    app.listen(port, () => {
      console.log(`Server draait op http://localhost:${port}`);
    });
  } catch (err) {
    console.error('Fout bij opstarten van de server:', err);
    process.exit(1);
  }
}

startServer();

app.get('/api/scores', async (req, res) => {
  try {
    console.log('GET /api/scores called');
    const score = await collection.findOne({});
    if (!score) {
      console.log('No score document found');
      return res.status(404).json({ error: 'Score niet gevonden' });
    }
    console.log('Score document found:', score);
    res.json({ morris: score.morris, ize: score.ize });
  } catch (err) {
    console.error('Fout bij ophalen van scores:', err);
    res.status(500).json({ error: 'Serverfout' });
  }
});

app.post('/api/scores', async (req, res) => {
  const { morris, ize } = req.body;
  if (typeof morris !== 'number' || typeof ize !== 'number') {
    console.log('Invalid score types:', req.body);
    return res.status(400).json({ error: 'Scores moeten nummers zijn' });
  }
  try {
    console.log('POST /api/scores called with:', { morris, ize });
    const updateResult = await collection.updateOne({}, { $set: { morris, ize } }, { upsert: true });
    console.log('Score document updated:', updateResult.result);
    res.json({ morris, ize });
  } catch (err) {
    console.error('Fout bij opslaan van scores:', err);
    res.status(500).json({ error: 'Serverfout' });
  }
});
