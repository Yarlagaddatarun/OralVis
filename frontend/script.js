const loginForm = document.getElementById("loginForm");
const patientForm = document.getElementById("uploadForm");
const scanList = document.getElementById("scanList");

const BACKEND_URL = "https://oralvis-production.up.railway.app"; // Replace with your Railway backend URL

// Login
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const res = await fetch(`${BACKEND_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        if (data.error) {
            alert("Error during login: " + data.error);
        } else {
            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.role);
            localStorage.setItem("name", data.name);
            alert("Login successful as " + data.role);
            // Show upload form if technician
            if (data.role === "technician") {
                patientForm.style.display = "block";
            }
            // Fetch scans if dentist
            if (data.role === "dentist") {
                fetchScans();
            }
        }
    } catch (err) {
        console.error(err);
        alert("Login failed. Check console for error.");
    }
});

// Upload scan
patientForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const patientName = document.getElementById("patientName").value;
    const scan = document.getElementById("scan").value;
    const details = document.getElementById("details").value;
    const token = localStorage.getItem("token");

    try {
        const res = await fetch(`${BACKEND_URL}/upload-scan`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ patientName, scan, details }),
        });

        const data = await res.json();
        if (data.error) {
            alert("Error uploading scan: " + data.error);
        } else {
            alert("Scan uploaded successfully!");
            patientForm.reset();
        }
    } catch (err) {
        console.error(err);
        alert("Upload failed. Check console for error.");
    }
});

// Fetch scans
async function fetchScans() {
    const token = localStorage.getItem("token");
    try {
        const res = await fetch(`${BACKEND_URL}/scans`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        scanList.innerHTML = "";
        if (data.scans && data.scans.length > 0) {
            data.scans.forEach((scan) => {
                const li = document.createElement("li");
                li.textContent = `${scan.patientName} - ${scan.details} (Uploaded by: ${scan.uploadedBy})`;
                scanList.appendChild(li);
            });
        } else {
            scanList.textContent = "No scans available";
        }
    } catch (err) {
        console.error(err);
        alert("Failed to fetch scans. Check console for error.");
    }
}
