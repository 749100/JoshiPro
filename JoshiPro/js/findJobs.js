document.addEventListener("DOMContentLoaded", () => {
    
    let isInitialCheck = true;
    firebase.auth().onAuthStateChanged((user) => {
        if (!user) { window.location.href = "login.html"; return; }
        if (isInitialCheck) {
            isInitialCheck = false;
            fetchAndRenderMarketplaceJobs();
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
function fetchAndRenderMarketplaceJobs(filterText = "") {
    const gridDisplayTarget = document.getElementById("jobsGridDisplay");
    if (!gridDisplayTarget) return;

    gridDisplayTarget.innerHTML = `<div class="loading-placeholder-message">Querying global jobs index...</div>`;

    const currentUser = firebase.auth().currentUser;
    const currentUserEmail = currentUser ? currentUser.email : "";

    firebase.database().ref("postedJobs").orderByChild("timestamp").once("value", (snapshot) => {
        let allJobs = [];
        
        snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            allJobs.push({
                title: data.title,
                company: data.company,
                location: data.location || "Remote",
                salary: data.salary || "Not Specified",
                desc: data.desc || "No description provided.",
                postedBy: data.postedBy || "" // <-- Pull the creator's email
            });
        });

        allJobs.reverse(); 
        gridDisplayTarget.innerHTML = ""; 

        const normalizedQuery = filterText.toLowerCase().trim();
        const filtered = allJobs.filter(job => {
            return job.title.toLowerCase().includes(normalizedQuery) || 
                   job.company.toLowerCase().includes(normalizedQuery);
        });

        if (filtered.length === 0) {
            gridDisplayTarget.innerHTML = `<div class="loading-placeholder-message">No listings found.</div>`;
            return;
        }

        filtered.forEach(job => {
            const card = document.createElement("div");
            card.className = "job-marketplace-card";
            
            // Determine button state based on ownership
            const isOwnJob = job.postedBy === currentUserEmail && currentUserEmail !== "";
            const buttonText = isOwnJob ? "Your Listing" : "Apply Now";
            const buttonDisabledAttr = isOwnJob ? "disabled" : "";
            const buttonCustomStyles = isOwnJob ? "background-color: #cbd5e1; color: #64748b; cursor: not-allowed; border-color: #cbd5e1;" : "";

            card.innerHTML = `
                <div class="job-card-header">
                    <h2>${job.title}</h2>
                    <div class="job-card-company">${job.company}</div>
                </div>
                <div class="job-card-details-meta">
                    <span class="job-meta-tag">${job.location}</span>
                    <span class="job-meta-tag">${job.salary}</span>
                </div>
                <p class="job-card-description">${job.desc}</p>
                <button class="apply-action-trigger-btn" ${buttonDisabledAttr} style="${buttonCustomStyles}">${buttonText}</button>
            `;

            // Only attach the application click handler if it isn't your own job listing!
            if (!isOwnJob) {
                card.querySelector(".apply-action-trigger-btn").addEventListener("click", (e) => {
                    e.target.disabled = true;
                    e.target.textContent = "Applying...";

                    const emailKey = currentUserEmail.replace(/\./g, "_").replace(/@/g, "_at_");
                    const newApplicationRef = firebase.database().ref("userApplications/" + emailKey).push();

                    newApplicationRef.set({
                        title: job.title,
                        company: job.company,
                        dateApplied: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                        status: "Submitted",
                        timestamp: firebase.database.ServerValue.TIMESTAMP
                    })
                    .then(() => {
                        alert(`Application for ${job.title} at ${job.company} submitted successfully!`);
                        e.target.textContent = "Applied";
                    })
                    .catch((error) => {
                        alert("Application submission failed: " + error.message);
                        e.target.disabled = false;
                        e.target.textContent = "Apply Now";
                    });
                });
            }

            gridDisplayTarget.appendChild(card);
        });
    });
}

    // Bind Search UI Event Controllers
    const searchInput = document.getElementById("jobSearchInput");
    const searchBtn = document.getElementById("searchButton");
    if (searchBtn && searchInput) {
        searchBtn.addEventListener("click", () => fetchAndRenderMarketplaceJobs(searchInput.value));
    }

    // Sidebar Logout Action Trigger
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