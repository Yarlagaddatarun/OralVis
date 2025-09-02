const BASE_URL = "https://oralvis-production.up.railway.app";

document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  const uploadBtn = document.getElementById("uploadBtn");

  if (loginBtn) {
    loginBtn.addEventListener("click", login);
  }

  if (uploadBtn) {
    uploadBtn.addEventListener("click", uploadScan);
  }
});

// 🔹 Login Function
async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const message = document.getElementById("loginMessage");

  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      message.innerText = data.error || "Login failed";
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);

    message.innerText = "Login successful ✅";

    if (data.role === "technician") {
      document.getElementById("loginSection").classList.add("hidden");
      document.getElementById("technicianSection").classList.remove("hidden");
    } else if (data.role === "dentist") {
      document.getElementById("loginSection").classList.add("hidden");
      document.getElementById("dentistSection").classList.remove("hidden");
      fetchScans();
    }
  } catch (error) {
    message.innerText = "Error connecting to server";
  }
}

// 🔹 Upload Scan (Technician)
async function uploadScan() {
  const patientName = document.getElementById("patientName").value.trim();
  const scanFile = document.getElementById("scanFile").files[0];
  const message = document.getElementById("uploadMessage");

  if (!patientName || !scanFile) {
    message.innerText = "Enter all fields!";
    return;
  }

  const formData = new FormData();
  formData.append("patientName", patientName);
  formData.append("scanFile", scanFile);

  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      message.innerText = data.error || "Upload failed";
      return;
    }

    message.innerText = "Scan uploaded successfully ✅";
    document.getElementById("patientName").value = "";
    document.getElementById("scanFile").value = "";
  } catch (error) {
    message.innerText = "Error uploading scan";
  }
}

// 🔹 Fetch Scans (Dentist)
async function fetchScans() {
  const scansList = document.getElementById("scansList");
  scansList.innerHTML = "Loading scans...";

  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/scans`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await response.json();

    if (!response.ok) {
      scansList.innerHTML = data.error || "Failed to load scans";
      return;
    }

    if (data.length === 0) {
      scansList.innerHTML = "No scans found.";
      return;
    }

    scansList.innerHTML = "";
    data.forEach(scan => {
      const div = document.createElement("div");
      div.classList.add("scan");
      div.innerHTML = `
        <p><strong>Patient:</strong> ${scan.patientName}</p>
        <img src="${BASE_URL}/${scan.filePath}" alt="Scan Image" />
      `;
      scansList.appendChild(div);
    });
  } catch (error) {
    scansList.innerHTML = "Error fetching scans";
  }
}


