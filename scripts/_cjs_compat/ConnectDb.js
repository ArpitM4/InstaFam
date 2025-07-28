const mongoose = require('mongoose');

module.exports = async function connectDb() {
  if (mongoose.connection.readyState >= 1) return;
  const uri = process.env.MONGODB_URI || process.env.NEXT_PUBLIC_MONGODB_URI;
  if (!uri) throw new Error('MongoDB connection string not found in env');
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};
