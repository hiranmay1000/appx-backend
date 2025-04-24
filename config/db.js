require('dotenv').config();
const { MongoClient } = require('mongodb');

const URI = process.env.MONGO_URI;
const client = new MongoClient(URI, {
  ssl: true,                           // Enforce SSL
  tls: true,           // Enable TLS (SSL)
  tlsAllowInvalidCertificates: false, // Enforce valid SSL/TLS certificates
  retryWrites: true,   // Allow retrying writes in case of network issues
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
    console.error("Failed to connect to the database:", error);
    throw error;
  }
}

// Correctly export connectToDatabase
module.exports = connectToDatabase;
