// Frontend JS for OralVis

const loginBtn = document.getElementById('login-btn');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginMessage = document.getElementById('login-message');

const technicianSection = document.getElementById('technician-section');
const dentistSection = document.getElementById('dentist-section');

const uploadBtn = document.getElementById('upload-btn');
const patientNameInput = document.getElementById('patientName');
const scanDataInput = document.getElementById('scanData');
const detailsInput = document.getElementById('details');
const uploadMessage = document.getElementById('upload-message');

const viewScansBtn = document.getElementById('view-scans-btn');
const scansTableBody = document.querySelector('#scans-table tbody');

const logoutTechBtn = document.getElementById('logout-tech-btn');
const logoutDentBtn = document.getElementById('logout-dent-btn');

let currentToken = '';
let currentRole = '';

// -----------------
// Login
// -----------------
loginBtn.addEventListener('click', async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    loginMessage.textContent = 'Please enter email and password';
    loginMessage.className = 'message error';
    return;
  }

  try {
    const res = await fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      loginMessage.textContent = data.error || 'Login failed';
      loginMessage.className = 'message error';
      return;
    }

    // Login success
    loginMessage.textContent = `Welcome ${data.name}! Role: ${data.role}`;
    loginMessage.className = 'message success';
    currentToken = data.token;
    currentRole = data.role;

    // Hide login, show correct section
    document.getElementById('login-section').style.display = 'none';
    if (data.role === 'technician') technicianSection.style.display = 'block';
    if (data.role === 'dentist') dentistSection.style.display = 'block';

  } catch (err) {
    loginMessage.textContent = 'Error during login';
    loginMessage.className = 'message error';
    console.error(err);
  }
});

// -----------------
// Technician: Upload Scan
// -----------------
uploadBtn.addEventListener('click', async () => {
  const patientName = patientNameInput.value.trim();
  const scan = scanDataInput.value.trim();
  const details = detailsInput.value.trim();

  if (!patientName || !scan || !details) {
    uploadMessage.textContent = 'All fields are required';
    uploadMessage.className = 'message error';
    return;
  }

  try {
    const res = await fetch('http://localhost:5000/upload', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': currentToken
      },
      body: JSON.stringify({ patientName, scan, details })
    });

    const data = await res.json();

    if (!res.ok) {
      uploadMessage.textContent = data.error || 'Upload failed';
      uploadMessage.className = 'message error';
      return;
    }

    uploadMessage.textContent = data.message;
    uploadMessage.className = 'message success';

    // Clear input fields
    patientNameInput.value = '';
    scanDataInput.value = '';
    detailsInput.value = '';

  } catch (err) {
    uploadMessage.textContent = 'Error uploading scan';
    uploadMessage.className = 'message error';
    console.error(err);
  }
});

// -----------------
// Dentist: View Scans
// -----------------
viewScansBtn.addEventListener('click', async () => {
  try {
    const res = await fetch('http://localhost:5000/scans', {
      method: 'GET',
      headers: { 'Authorization': currentToken }
    });

    const data = await res.json();
    scansTableBody.innerHTML = '';

    if (!res.ok) {
      scansTableBody.innerHTML = `<tr><td colspan="4">Error fetching scans</td></tr>`;
      return;
    }

    if (!data.scans || data.scans.length === 0) {
      scansTableBody.innerHTML = `<tr><td colspan="4">No scans uploaded yet</td></tr>`;
      return;
    }

    data.scans.forEach(scan => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${scan.patientName}</td>
        <td>${scan.scan}</td>
        <td>${scan.details}</td>
        <td>${scan.uploadedBy}</td>
      `;
      scansTableBody.appendChild(tr);
    });

  } catch (err) {
    scansTableBody.innerHTML = `<tr><td colspan="4">Error fetching scans</td></tr>`;
    console.error(err);
  }
});

// -----------------
// Logout Buttons
// -----------------
logoutTechBtn.addEventListener('click', () => {
  technicianSection.style.display = 'none';
  document.getElementById('login-section').style.display = 'block';
  loginMessage.textContent = '';
  currentToken = '';
  currentRole = '';
});

logoutDentBtn.addEventListener('click', () => {
  dentistSection.style.display = 'none';
  document.getElementById('login-section').style.display = 'block';
  loginMessage.textContent = '';
  currentToken = '';
  currentRole = '';
});





