document.addEventListener("DOMContentLoaded", () => {
    
    // ==========================================================================
    // 1. FIREBASE AUTH DELAY GATEWAY CHECKER
    // ==========================================================================
    let isInitialCheck = true;

    firebase.auth().onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = "login.html";
            return;
        }

        if (isInitialCheck) {
            isInitialCheck = false;
            initializeDashboardData(user);
const headerEmailKey = user.email.replace(/\./g, "_").replace(/@/g, "_at_");

firebase.database().ref("userProfiles/" + headerEmailKey).once("value", (snap) => {
    if (snap.exists()) {
        const profileData = snap.val();
        // Verify the image string exists and isn't empty
        if (profileData.avatarBase64 && profileData.avatarBase64 !== "") {
            const topHeaderImgElement = document.getElementById("topHeaderAvatar");
            if (topHeaderImgElement) {
                topHeaderImgElement.src = profileData.avatarBase64;
            }
        }
    }
});
        }
    });

    // ==========================================================================
    // 2. MAIN METRICS AND RENDERING LAYER
    // ==========================================================================
    function initializeDashboardData(user) {
        const tableBody = document.querySelector(".jobs-table tbody");
        if (!tableBody) return;

        // Show a brief loading indicator while fetching from the network
        tableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #64748b;">Fetching latest job updates...</td></tr>`;

        // Connect directly to your global Firebase database tree
        firebase.database().ref("postedJobs").orderByChild("timestamp").on("value", (snapshot) => {
            let fetchedJobs = [];
            
            snapshot.forEach((childSnapshot) => {
                const data = childSnapshot.val();
                fetchedJobs.push({
                    company: data.company || "Self Posted",
                    title: data.title || "Untitled Role",
                    date: "Just Now",
                    status: "Live / Active",
                    class: "review"
                });
            });

            // Reverse the array so the absolute newest jobs appear at the top
            fetchedJobs.reverse();

            // --- THE DASHBOARD FILTER RULE ---
            // Grabs only the top 3 items for the dashboard display preview
            const latestJobsOnly = fetchedJobs.slice(0, 3);

            // Update your dashboard metrics count text box dynamically
            const appsSentSpan = document.getElementById("applicationsSent");
            if (appsSentSpan) {
                appsSentSpan.textContent = fetchedJobs.length;
            }

            // Wipe out loaders or placeholders to inject live elements cleanly
            tableBody.innerHTML = "";

            if (latestJobsOnly.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #64748b;">No recent jobs posted yet.</td></tr>`;
                return;
            }

            // Loop and paint the latest entries into table rows
            latestJobsOnly.forEach(item => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td><strong>${item.company}</strong></td>
                    <td>${item.title}</td>
                    <td>${item.date}</td>
                    <td><span class="status-badge ${item.class}" style="background-color: #dcfce7; color: #16a34a;">${item.status}</span></td>
                `;
                tableBody.appendChild(row);
            });
        });
    }

    // ==========================================================================
    // 3. SIDEBAR LOGOUT CONTROLLER
    // ==========================================================================
    const logoutBtn = document.getElementById("sidebarLogoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            if (confirm("Are you sure you want to log out of JoshiPro?")) {
                firebase.auth().signOut().then(() => {
                    window.location.href = "login.html";
                });
            }
        });
    }
});