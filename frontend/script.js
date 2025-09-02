// script.js

const backendURL = "https://oralvis-production.up.railway.app";

// Login form
const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {
            const res = await fetch(`${backendURL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (data.token) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("role", data.role);
                localStorage.setItem("name", data.name);
                alert("Login successful!");
                window.location.href = "dashboard.html"; // redirect after login
            } else {
                alert(data.message || "Error during login");
            }
        } catch (err) {
            console.error(err);
            alert("Error connecting to backend");
        }
    });
}

// Fetch scans
async function fetchScans() {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
        const res = await fetch(`${backendURL}/scans`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        const scansContainer = document.getElementById("scansContainer");
        if (scansContainer) {
            scansContainer.innerHTML = "";
            data.scans.forEach(scan => {
                const div = document.createElement("div");
                div.innerHTML = `
                    <h3>Patient: ${scan.patientName}</h3>
                    <p>Details: ${scan.details}</p>
                    <p>Uploaded by: ${scan.uploadedBy}</p>
                    <hr>
                `;
                scansContainer.appendChild(div);
            });
        }
    } catch (err) {
        console.error(err);
    }
}

// Upload scan (technician)
const uploadForm = document.getElementById("uploadForm");
if (uploadForm) {
    uploadForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const patientName = document.getElementById("patientName").value;
        const scanFile = document.getElementById("scanFile").files[0];
        const details = document.getElementById("details").value;
        const token = localStorage.getItem("token");

        if (!token) {
            alert("Not logged in");
            return;
        }

        const formData = new FormData();
        formData.append("patientName", patientName);
        formData.append("scan", scanFile);
        formData.append("details", details);

        try {
            const res = await fetch(`${backendURL}/upload`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData
            });
            const data = await res.json();
            alert(data.message || "Scan uploaded");
        } catch (err) {
            console.error(err);
            alert("Error uploading scan");
        }
    });
}

// Call fetchScans on page load if element exists
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("scansContainer")) {
        fetchScans();
    }
});
