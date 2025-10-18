const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const multer = require("multer");
const { connectDB } = require("./db");
const branchController = require("./branchController"); // Import the controller

const app = express();

// --- Middleware Setup ---
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// --- Static File Serving ---
// Serve the uploaded images from the /uploads URL path

// --- API Routes ---
app.get("/api/v1/branches", branchController.getallBranches);
app.post("/api/v1/branches", branchController.addBranch);

// --- 404 Not Found Handler ---
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot find ${req.originalUrl} on this server!`,
  });
});

// --- Server Startup ---
const PORT = 2711;
app.listen(PORT, async () => {
  console.log(`Server running successfully on port ${PORT}`);
  await connectDB();
});
