const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Load data from JSON file
const dataFile = path.join(__dirname, "data.json");

// Route: Home
app.get("/", (req, res) => {
  res.send("✅ Backend is running on Railway!");
});

// Route: Get all data
app.get("/data", (req, res) => {
  fs.readFile(dataFile, "utf8", (err, jsonData) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read data.json" });
    }
    try {
      const data = JSON.parse(jsonData);
      res.json(data);
    } catch (parseErr) {
      res.status(500).json({ error: "Error parsing data.json" });
    }
  });
});

// Route: Add new item
app.post("/data", (req, res) => {
  const newItem = req.body;

  fs.readFile(dataFile, "utf8", (err, jsonData) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read data.json" });
    }

    try {
      const data = JSON.parse(jsonData);
      data.push(newItem);

      fs.writeFile(dataFile, JSON.stringify(data, null, 2), (err) => {
        if (err) {
          return res.status(500).json({ error: "Failed to write to data.json" });
        }
        res.json({ message: "Item added successfully", data: newItem });
      });
    } catch (parseErr) {
      res.status(500).json({ error: "Error parsing data.json" });
    }
  });
});

// Use Railway PORT or fallback to 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

