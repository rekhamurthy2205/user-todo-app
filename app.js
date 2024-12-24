const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const dbConfig = require("./db.config/db.config.json");
const cookieParser = require("cookie-parser");
const router = require("./src/router/index.route");

dotenv.config(); // Load environment variables

const app = express();

// Middleware
app.use(cors()); // Enable CORS
app.use(bodyParser.json()); // Parse JSON request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser()); // Parse URL-encoded request bodies
app.use(morgan("dev")); // Log HTTP requests

app.use("/api/v1", router);

// CORS setup
const corsOptions = {
  origin: [
    "http://localhost:2395",
    "http://localhost:8275",
    "http://localhost:6290",
  ],
  credentials: true,
};
app.use(cors(corsOptions));
// Database Connection (MongoDB Example)
mongoose
  .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {})
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

// Routes

// Default Route
app.get("/", (req, res) => {
  res.send("Welcome to the Node.js Application");
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: "Something went wrong!" });
});

// Start Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
