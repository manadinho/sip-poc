const express = require("express");
const https = require("https");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 3200;

const publicPath = path.resolve(__dirname, "public");
app.use(express.static(publicPath));

// Root route for serving index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "one.html"));
});

app.get("/two", (req, res) => {
  res.sendFile(path.join(publicPath, "two.html"));
});

// Define your routes and middleware here

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
