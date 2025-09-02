// script.js

const backendUrl = "https://oralvis-production.up.railway.app";

// Elements
const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginError = document.getElementById("loginError");

const uploadForm = document.getElementById("uploadForm");
const patientNameInput = document.getElementById("patientName");
const scanInput = document.getElementById("scan");
const detailsInput = document.getElementById("details");
const uploadError = document.getElementById("uploadError");
const uploadSuccess = document.getElementById("uploadSuccess");

const scansContainer = document.getElementById("scansContainer");

// Store session token and role
let sessionToken = null;
let userRole = null;

// ---------------- LOGIN ----------------
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginError.textContent = "";

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    try {
      const res = await fetch(`${backendUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        sessionToken = data.token;
        userRole = data.role;
        // Save to localStorage to persist session
        localStorage.setItem("token", sessionToken);
        localStorage.setItem("role", userRole);
        localStorage.setItem("name", data.name);

        // Redirect or show upload/view page
        window.location.href = "dashboard.html"; // replace with your page
      } else {
        loginError.textContent = data.message || "Login failed";
      }
    } catch (err) {
      console.error(err);
      loginError.textContent = "Network error. Try again!";
    }
  });
}

// ---------------- UPLOAD SCAN ----------------
if (uploadForm) {
  uploadForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    uploadError.textContent = "";
    uploadSuccess.textContent = "";

    const patientName = patientNameInput.value.trim();
    const scan = scanInput.value.trim();
    const details = detailsInput.value.trim();

    if (!sessionToken || userRole !== "technician") {
      uploadError.textContent = "You are not authorized!";
      return;
    }

    try {
      const res = await fetch(`${backendUrl}/upload-scan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ patientName, scan, details }),
      });

      const data = await res.json();

      if (res.ok) {
        uploadSuccess.textContent = "Scan uploaded successfully!";
        uploadForm.reset();
        fetchScans();
      } else {
        uploadError.textContent = data.message || "Upload failed";
      }
    } catch (err) {
      console.error(err);
      uploadError.textContent = "Network error. Try again!";
    }
  });
}

// ---------------- FETCH SCANS ----------------
async function fetchScans() {
  if (!sessionToken) return;

  try {
    const res = await fetch(`${backendUrl}/scans`, {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    });
    const data = await res.json();

    if (res.ok && scansContainer) {
      scansContainer.innerHTML = "";
      data.scans.forEach((scan) => {
        const div = document.createElement("div");
        div.className = "scan-item";
        div.innerHTML = `
          <h4>${scan.patientName}</h4>
          <p><strong>Details:</strong> ${scan.details}</p>
          <p><strong>Uploaded By:</strong> ${scan.uploadedBy}</p>
          <p><strong>Scan:</strong> ${scan.scan}</p>
          <hr>
        `;
        scansContainer.appendChild(div);
      });
    } else if (!res.ok) {
      scansContainer.textContent = data.message || "Failed to fetch scans";
    }
  } catch (err) {
    console.error(err);
    scansContainer.textContent = "Network error. Try again!";
  }
}

// Fetch scans on page load if container exists
if (scansContainer) {
  sessionToken = localStorage.getItem("token");
  userRole = localStorage.getItem("role");
  fetchScans();
}

