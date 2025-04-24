require('dotenv').config();
const { MongoClient } = require('mongodb');

const URI = process.env.MONGO_URI;

const client = new MongoClient(URI, {
  tls: true,
  tlsAllowInvalidCertificates: false,
  retryWrites: true,
});

let db;

async function connectToDatabase() {
  if (db) return db;

  try {
    console.log("Attempting to connect to the database...");
    await client.connect();
    db = client.db('appx-data');
    console.log("Connected to the database");
    return db;
  } catch (error) {
    if (error.message.includes('SSL') || error.message.includes('TLS')) {
      console.error("SSL/TLS Error: Check your MongoDB Atlas security settings and TLS compatibility.");
    }
    console.error("Failed to connect to the database:", error);
    throw error;
  }
}

module.exports = connectToDatabase;
