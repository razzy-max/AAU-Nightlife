Migration: Mark events without date as comingSoon

This repository includes a small migration script that will mark any event documents
which lack a `date` as `comingSoon: true` and set their `date` field to `null`.

Files added:
- server/scripts/mark_coming_soon.js  - Node script to perform the migration

How it works
- Connects to the MongoDB instance using MONGO_URI (env var or first CLI arg)
- Finds documents where `date` is missing, null, or an empty string
- Sets `comingSoon: true` and `date: null` on matching documents

Safety and rollback
- Always back up your database before running migrations.
- You can preview affected documents by running a find query in a Mongo shell:
  db.events.find({ $or: [{ date: { $exists: false } }, { date: null }, { date: '' }] })

Running the migration (PowerShell)
1) Set your MONGO_URI environment variable:
   $env:MONGO_URI = 'your-mongo-connection-string'

2) Run the script from the project root:
   node server/scripts/mark_coming_soon.js

Or pass the URI as the first argument:
   node server/scripts/mark_coming_soon.js 'your-mongo-connection-string'

Notes
- The script requires Node.js and the `mongodb` driver. If you run it in this repo,
  install dev dependencies with `npm install` inside `server/` first if needed.
- This script is idempotent: running it multiple times will leave already-updated
  documents unchanged.
