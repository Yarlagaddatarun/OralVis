const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const DATA_FILE = './data.json';

// Load data
let data = { users: [], sessions: [], scans: [] };
if (fs.existsSync(DATA_FILE)) {
  data = JSON.parse(fs.readFileSync(DATA_FILE));
} else {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Generate random token
function generateToken() {
  return Math.random().toString(36).substring(2, 12);
}

// Save data to file
function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// ----------------- LOGIN -----------------
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = data.users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });

  const token = generateToken();
  data.sessions.push({ token, email: user.email, role: user.role, name: user.name });
  saveData();

  res.json({ token, name: user.name, role: user.role });
});

// ----------------- UPLOAD SCAN -----------------
app.post('/upload', (req, res) => {
  const { patientName, scan, details } = req.body;
  const token = req.headers.authorization;
  const session = data.sessions.find(s => s.token === token);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  if (!patientName || !scan || !details) return res.status(400).json({ error: 'All fields required' });

  data.scans.push({ patientName, scan, details, uploadedBy: session.name });
  saveData();

  res.json({ message: 'Scan uploaded successfully' });
});

// ----------------- VIEW SCANS -----------------
app.get('/scans', (req, res) => {
  const token = req.headers.authorization;
  const session = data.sessions.find(s => s.token === token);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  res.json({ scans: data.scans });
});

// ----------------- START SERVER -----------------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
