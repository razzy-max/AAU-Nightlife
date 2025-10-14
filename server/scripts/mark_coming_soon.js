#!/usr/bin/env node
// Migration script: mark events without a date as comingSoon
// Usage:
//   Provide MONGO_URI via environment variable or as the first argument.
//   Example (PowerShell):
//     $env:MONGO_URI = "your-mongo-uri"; node server/scripts/mark_coming_soon.js

const { MongoClient } = require('mongodb');

async function main() {
  const uri = process.env.MONGO_URI || process.argv[2];
  if (!uri) {
    console.error('Missing MONGO_URI. Provide it as env var or first arg.');
    process.exit(1);
  }

  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    const db = client.db();
    const events = db.collection('events');

    // Find documents where date is missing, null, or empty string
    const query = {
      $or: [
        { date: { $exists: false } },
        { date: null },
        { date: '' }
      ]
    };

    // Update: set comingSoon = true and ensure date is null
    const update = {
      $set: { comingSoon: true, date: null }
    };

    const result = await events.updateMany(query, update);

    console.log(`Matched ${result.matchedCount} documents.`);
    console.log(`Modified ${result.modifiedCount} documents.`);
    console.log('Migration complete.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exitCode = 2;
  } finally {
    await client.close();
  }
}

main();
