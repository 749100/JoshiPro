document.addEventListener("DOMContentLoaded", () => {
    
    let isInitialCheck = true;

    firebase.auth().onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = "login.html";
            return;
        }

        if (isInitialCheck) {
            isInitialCheck = false;
            fetchUserApplications(user);
            // Paste this inside onAuthStateChanged right after verifying the user exists
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

    function fetchUserApplications(user) {
        const tableBody = document.querySelector("#applicationsHistoryTable tbody");
        if (!tableBody) return;

        // Clean path string formatting for database node lookup
        const emailKey = user.email.replace(/\./g, "_").replace(/@/g, "_at_");

        // Reference path: /userApplications/{emailKey}
        firebase.database().ref("userApplications/" + emailKey).orderByChild("timestamp").on("value", (snapshot) => {
            tableBody.innerHTML = ""; // Wipe loading indicator

            if (!snapshot.exists()) {
                tableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #64748b;">You haven't applied to any jobs yet. Go to 'Find Jobs' to start applying!</td></tr>`;
                return;
            }

            let appsList = [];
            snapshot.forEach((childSnapshot) => {
                const data = childSnapshot.val();
                appsList.push(data);
            });

            // Show newest submissions at the top
            appsList.reverse();

            appsList.forEach(app => {
                const row = document.createElement("tr");
                
                // Set badge design layout class based on server string state values
                let statusClass = "applied";
                if (app.status === "Interviewing") statusClass = "interview";
                if (app.status === "Under Review") statusClass = "reviewing";

                row.innerHTML = `
                    <td><strong>${app.company || 'Unknown Enterprise'}</strong></td>
                    <td>${app.title || 'General Position'}</td>
                    <td>${app.dateApplied || 'Recent'}</td>
                    <td><span class="status-badge ${statusClass}">${app.status || 'Submitted'}</span></td>
                `;
                tableBody.appendChild(row);
            });
        });
    }

    // Sidebar Logout Processing Anchor Click Handler
    const logoutBtn = document.getElementById("sidebarLogoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            if (confirm("Are you sure you want to log out of JoshiPro?")) {
                firebase.auth().signOut().then(() => { window.location.href = "login.html"; });
            }
        });
    }
});