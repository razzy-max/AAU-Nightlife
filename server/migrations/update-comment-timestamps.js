const { MongoClient } = require('mongodb');
const { MONGODB_URI } = require('../config');

async function updateCommentTimestamps() {
  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db();

  try {
    // Get all comments without timestamps
    const comments = await db.collection('blogComments').find({
      $or: [
        { timestamp: { $exists: false } },
        { timestamp: null }
      ]
    }).toArray();

    console.log(`Found ${comments.length} comments without timestamps`);

    // Update each comment with a timestamp
    for (const comment of comments) {
      // If the comment has an _id, use its creation time as the timestamp
      // Otherwise use current time
      const timestamp = comment._id ? 
        comment._id.getTimestamp().toISOString() : 
        new Date().toISOString();

      await db.collection('blogComments').updateOne(
        { _id: comment._id },
        { $set: { timestamp } }
      );
    }

    console.log('Successfully updated comment timestamps');
  } catch (error) {
    console.error('Error updating timestamps:', error);
  } finally {
    await client.close();
  }
}

// Run the migration
updateCommentTimestamps().catch(console.error);
