// server.js - Plain Node.js backend (no npm needed)

const http = require('http');
const fs = require('fs');
const url = require('url');

const PORT = 5000;

// -------------------------
// Load data
// -------------------------
let rawData = fs.readFileSync('data.json');
let db = JSON.parse(rawData);

// -------------------------
// Helper functions
// -------------------------
function sendJSON(res, obj) {
  res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(obj));
}

function parseRequestBody(req, callback) {
  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', () => {
    try {
      callback(JSON.parse(body));
    } catch (e) {
      callback({});
    }
  });
}

// -------------------------
// Server
// -------------------------
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;

  // Enable CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization'
    });
    res.end();
    return;
  }

  // -------------------------
  // Login
  // -------------------------
  if (path === '/login' && req.method === 'POST') {
    parseRequestBody(req, body => {
      const user = db.users.find(u => u.email === body.email && u.password === body.password);
      if (!user) {
        sendJSON(res, { error: 'Invalid credentials' });
        return;
      }

      // Generate simple token (random string)
      const token = Math.random().toString(36).substr(2);
      db.sessions.push({ token, email: user.email, role: user.role, name: user.name });
      fs.writeFileSync('data.json', JSON.stringify(db, null, 2));
      sendJSON(res, { token, role: user.role, name: user.name });
    });
    return;
  }

  // -------------------------
  // Upload Scan (Technician)
  // -------------------------
  if (path === '/upload' && req.method === 'POST') {
    const authToken = req.headers['authorization'];
    const session = db.sessions.find(s => s.token === authToken);
    if (!session || session.role !== 'technician') {
      sendJSON(res, { error: 'Unauthorized' });
      return;
    }

    parseRequestBody(req, body => {
      db.scans.push({
        patientName: body.patientName,
        scan: body.scan,
        details: body.details,
        uploadedBy: session.name
      });
      fs.writeFileSync('data.json', JSON.stringify(db, null, 2));
      sendJSON(res, { message: 'Scan uploaded successfully!' });
    });
    return;
  }

  // -------------------------
  // View Scans (Dentist)
  // -------------------------
  if (path === '/scans' && req.method === 'GET') {
    const authToken = req.headers['authorization'];
    const session = db.sessions.find(s => s.token === authToken);
    if (!session || session.role !== 'dentist') {
      sendJSON(res, { error: 'Unauthorized', scans: [] });
      return;
    }

    sendJSON(res, { scans: db.scans });
    return;
  }

  // 404 for other routes
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`OralVis Backend is running at http://localhost:${PORT}`);
});

