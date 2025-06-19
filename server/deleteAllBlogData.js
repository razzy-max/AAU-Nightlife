const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://AdminNight:AdminKey@nightlife.oft9xkj.mongodb.net/?retryWrites=true&w=majority';
const dbName = 'Nightlife'; // Change if your DB name is different

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    await db.collection('blogPosts').deleteMany({});
    await db.collection('blogComments').deleteMany({});
    console.log('All blog posts and comments deleted!');
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
