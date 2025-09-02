// server.js - OralVis Backend

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all origins (needed for Netlify frontend)
app.use(cors());

// Parse JSON bodies
app.use(bodyParser.json());

// Temporary in-memory storage (replace with DB in real projects)
let users = [
  { email: "tech1@oralvis.com", password: "1234", role: "technician", name: "Tech One" },
  { email: "dent1@oralvis.com", password: "1234", role: "dentist", name: "Dentist One" }
];

let scans = [];

// -----------------
// Routes
// -----------------

// Login route
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  // Generate a simple token (in real app use JWT)
  const token = `${user.email}-token`;

  res.json({ 
    message: "Login successful", 
    token, 
    role: user.role, 
    name: user.name 
  });
});

// Upload scan (technician)
app.post("/upload", (req, res) => {
  const token = req.headers["authorization"];
  const { patientName, scan, details } = req.body;

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const user = users.find(u => `${u.email}-token` === token);
  if (!user || user.role !== "technician") {
    return res.status(403).json({ error: "Forbidden" });
  }

  if (!patientName || !scan || !details) {
    return res.status(400).json({ error: "All fields are required" });
  }

  scans.push({
    patientName,
    scan,
    details,
    uploadedBy: user.name
  });

  res.json({ message: "Scan uploaded successfully" });
});

// View scans (dentist)
app.get("/scans", (req, res) => {
  const token = req.headers["authorization"];

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const user = users.find(u => `${u.email}-token` === token);
  if (!user || user.role !== "dentist") {
    return res.status(403).json({ error: "Forbidden" });
  }

  res.json({ scans });
});

// Test route
app.get("/", (req, res) => res.send("OralVis Backend is running"));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


