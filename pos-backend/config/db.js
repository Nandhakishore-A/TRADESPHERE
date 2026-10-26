const mongoose = require('mongoose');

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  let MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!MONGO_URI) {
    throw new Error('MONGO_URI is missing in environment variables!');
  }

  // Sanitize URI: strip accidental angle brackets if left from template <username>
  MONGO_URI = MONGO_URI.replace(/<([^>]+)>/g, '$1');

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 4000,
      connectTimeoutMS: 4000,
    };
    cached.promise = mongoose.connect(MONGO_URI, opts).then((m) => {
      console.log('✅ [TradeSphere] Connected to MongoDB Atlas Cloud Cluster:', m.connection.host);
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    cached.promise = null;
    throw err;
  }
};

module.exports = connectDB;
