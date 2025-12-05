import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Track connection state to prevent multiple connections
let isConnected = false;

const connectDB = async () => {
  // If already connected, skip
  if (isConnected) {
    return;
  }

  // If mongoose is already connected via another path
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Optimized connection options for better performance
      maxPoolSize: 10, // Maximum connections in the pool
      minPoolSize: 5, // Minimum connections to maintain
      maxIdleTimeMS: 60000, // Close idle connections after 60s
      serverSelectionTimeoutMS: 5000, // Timeout for server selection
      socketTimeoutMS: 45000, // Socket timeout
      connectTimeoutMS: 10000, // Initial connection timeout
      retryWrites: true,
      retryReads: true,
    });
    
    isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      console.log('MongoDB disconnected');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      isConnected = false;
    });
    
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    isConnected = false;
    throw error;
  }
};

export default connectDB;
