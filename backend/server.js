const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Load data from JSON file
const dataFile = path.join(__dirname, "data.json");

// -----------------
// Routes
// -----------------

// Home route
app.get("/", (req, res) => {
  res.send("✅ Backend is running on Railway!");
});

// Get all data (optional)
app.get("/data", (req, res) => {
  fs.readFile(dataFile, "utf8", (err, jsonData) => {
    if (err) return res.status(500).json({ error: "Failed to read data.json" });
    try {
      const data = JSON.parse(jsonData);
      res.json(data);
    } catch (parseErr) {
      res.status(500).json({ error: "Error parsing data.json" });
    }
  });
});

// -----------------
// Login Route
// -----------------
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  fs.readFile(dataFile, "utf8", (err, jsonData) => {
    if (err) return res.status(500).json({ error: "Failed to read data.json" });
    const data = JSON.parse(jsonData);
    const user = data.users.find(u => u.email === email && u.password === password);
    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    // Create simple session token
    const token = Math.random().toString(36).substring(2, 12);
    data.sessions.push({ token, email: user.email, role: user.role, name: user.name });

    fs.writeFile(dataFile, JSON.stringify(data, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "Failed to save session" });
      res.json({ token, role: user.role, name: user.name });
    });
  });
});

// -----------------
// Upload Scan Route (Technician)
// -----------------
app.post("/upload", (req, res) => {
  const authToken = req.headers["authorization"];
  const { patientName, scan, details } = req.body;

  if (!patientName || !scan || !details) {
    return res.status(400).json({ error: "All fields are required" });
  }

  fs.readFile(dataFile, "utf8", (err, jsonData) => {
    if (err) return res.status(500).json({ error: "Failed to read data.json" });
    const data = JSON.parse(jsonData);

    const session = data.sessions.find(s => s.token === authToken);
    if (!session || session.role !== "technician") return res.status(403).json({ error: "Unauthorized" });

    const newScan = { patientName, scan, details, uploadedBy: session.name };
    data.scans.push(newScan);

    fs.writeFile(dataFile, JSON.stringify(data, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "Failed to save scan" });
      res.json({ message: "Scan uploaded successfully" });
    });
  });
});

// -----------------
// View Scans Route (Dentist)
// -----------------
app.get("/scans", (req, res) => {
  const authToken = req.headers["authorization"];

  fs.readFile(dataFile, "utf8", (err, jsonData) => {
    if (err) return res.status(500).json({ error: "Failed to read data.json" });
    const data = JSON.parse(jsonData);

    const session = data.sessions.find(s => s.token === authToken);
    if (!session || session.role !== "dentist") return res.status(403).json({ error: "Unauthorized" });

    res.json({ scans: data.scans });
  });
});

// -----------------
// Start server
// -----------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

