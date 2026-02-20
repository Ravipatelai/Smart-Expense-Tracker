const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection failed!");
    console.error(`Error Message: ${error.message}`);
    console.error(`Error Stack: ${error.stack}`);
    process.exit(1); // Exit with failure
  }

  // Global error listener for mongoose
  mongoose.connection.on("error", (err) => {
    console.error("⚠️ Mongoose runtime error:", err);
  });
};

module.exports = connectDB;
