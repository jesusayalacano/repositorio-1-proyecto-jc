const mongoose = require('mongoose');

async function conectarDB() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || 'dunklabs';

  if (!uri) {
    throw new Error('Falta MONGODB_URI en el archivo .env');
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  await mongoose.connect(uri, {
    dbName,
    serverSelectionTimeoutMS: 10000,
  });

  console.log(`MongoDB conectado a la base "${mongoose.connection.name}"`);
  return mongoose.connection;
}

module.exports = { conectarDB };
