// db.js
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/moviehub';

const client = new MongoClient(uri);

async function connectDB() {
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB!');
    return client.db(); // Uses the database name from the URI (moviehub)
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
  }
}

module.exports = connectDB;
