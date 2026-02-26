const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");

// Load env variables
dotenv.config();

// Import routes
const authRoutes = require("./routes/authRoutes");
const treeRoutes = require("./routes/treeRoutes");
const memberRoutes = require("./routes/memberRoutes");

// Import middleware
const { errorHandler } = require("./middleware/errorHandler");

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/trees", treeRoutes);
app.use("/api/trees", memberRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Family Tree API is running 🌳" });
});

// Error handler (must be last)
app.use(errorHandler);

// Connect to MongoDB & start server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });
