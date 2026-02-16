const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let usingMemoryServer = false;

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;

    // Try the provided URI first
    if (uri) {
      try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
        console.log(`MongoDB Connected: ${mongoose.connection.host}`);
        return;
      } catch (err) {
        console.log('Configured MongoDB not available, falling back to in-memory server...');
        await mongoose.disconnect().catch(() => {});
      }
    }

    // Start in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    uri = mongoServer.getUri();
    usingMemoryServer = true;
    console.log('MongoDB Memory Server started');

    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected (In-Memory): ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database Error: ${error.message}`);
    process.exit(1);
  }
};

const isUsingMemoryServer = () => usingMemoryServer;

module.exports = { connectDB, isUsingMemoryServer };
