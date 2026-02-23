import mongoose from 'mongoose';

/**
 * Connect to MongoDB.
 * Reads MONGO_URI (or MONGODB_URI for backward compat).
 */
export async function connectDB(): Promise<void> {
  const uri =
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    'mongodb://localhost:27017/kiet-collab';

  try {
    const conn = await mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(`✅  MongoDB connected: ${conn.connection.host}`);
  } catch (err: any) {
    console.error('❌  MongoDB connection error:', err.message);
    process.exit(1);
  }

  mongoose.connection.on('disconnected', () =>
    console.warn('⚠️  MongoDB disconnected')
  );
  mongoose.connection.on('reconnected', () =>
    console.info('🔄  MongoDB reconnected')
  );
}
