// script.js

const backendUrl = "https://oralvis-production.up.railway.app"; // Your Railway backend URL

// Elements
const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const uploadForm = document.getElementById("uploadForm");
const scansContainer = document.getElementById("scansContainer");

// Check session on load
document.addEventListener("DOMContentLoaded", () => {
  const session = JSON.parse(localStorage.getItem("session"));
  if (session) {
    showApp(session);
    fetchScans();
  }
});

// Login
loginBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    alert("Please enter email and password");
    return;
  }

  try {
    const res = await fetch(`${backendUrl}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.success) {
      localStorage.setItem("session", JSON.stringify(data.session));
      showApp(data.session);
      fetchScans();
    } else {
      alert(data.message || "Login failed");
    }
  } catch (err) {
    console.error(err);
    alert("Error connecting to server");
  }
});

// Logout
logoutBtn?.addEventListener("click", () => {
  localStorage.removeItem("session");
  location.reload();
});

// Show app after login
function showApp(session) {
  document.getElementById("loginSection").style.display = "none";
  document.getElementById("appSection").style.display = "block";

  if (session.role === "technician") {
    document.getElementById("uploadSection").style.display = "block";
  } else {
    document.getElementById("uploadSection").style.display = "none";
  }
}

// Upload scan (Technician only)
uploadForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(uploadForm);
  const session = JSON.parse(localStorage.getItem("session"));
  formData.append("uploadedBy", session.name);

  try {
    const res = await fetch(`${backendUrl}/upload`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (data.success) {
      alert("Scan uploaded successfully");
      uploadForm.reset();
      fetchScans();
    } else {
      alert(data.message || "Upload failed");
    }
  } catch (err) {
    console.error(err);
    alert("Error uploading scan");
  }
});

// Fetch scans (for dentist or technician)
async function fetchScans() {
  const session = JSON.parse(localStorage.getItem("session"));
  try {
    const res = await fetch(`${backendUrl}/scans`);
    const data = await res.json();
    scansContainer.innerHTML = "";

    data.scans.forEach((scan) => {
      const scanDiv = document.createElement("div");
      scanDiv.classList.add("scanItem");
      scanDiv.innerHTML = `
        <h4>Patient: ${scan.patientName}</h4>
        <p>Details: ${scan.details}</p>
        <p>Uploaded By: ${scan.uploadedBy}</p>
        <p>File: ${scan.scan}</p>
        <hr>
      `;
      scansContainer.appendChild(scanDiv);
    });
  } catch (err) {
    console.error(err);
    scansContainer.innerHTML = "<p>Error fetching scans</p>";
  }
}

