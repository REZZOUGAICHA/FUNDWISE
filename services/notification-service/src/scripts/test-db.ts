const { MongoClient } = require('mongodb');
require('dotenv').config();

async function testConnection() {
  // Use your MongoDB connection string from .env file
  const uri = process.env.MONGODB_URI;
  
  // Create client
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected successfully to MongoDB Atlas');
    
    // Explicitly specify the database name
    const dbName = 'fundwise_notification_service';
    const db = client.db(dbName);
    
    // List all collections in the specified database
    const collections = await db.listCollections().toArray();
    console.log(`Collections in ${dbName}: ${collections.map(c => c.name).join(', ')}`);
    
    // Try a simple operation (count documents in a collection)
    let collection = db.collection('notifications');
    let count = await collection.countDocuments();
    console.log(`Documents in notifications collection: ${count}`);
    
    collection = db.collection('logs');
    count = await collection.countDocuments();
    console.log(`Documents in logs collection: ${count}`);
    
    return true;
  } catch (error) {
    console.error('Connection error:', error);
    return false;
  } finally {
    await client.close();
    console.log('Connection closed');
  }
}

testConnection().catch(console.error);
