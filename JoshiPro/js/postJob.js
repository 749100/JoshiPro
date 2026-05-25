document.addEventListener("DOMContentLoaded", () => {
    
    // Auth security gateway access lock verification
    firebase.auth().onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = "login.html";
        }
    });

    const jobForm = document.getElementById("jobSubmissionForm");
    if (jobForm) {
        jobForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const title = document.getElementById("jobTitle").value.trim();
            const category = document.getElementById("jobCategory").value.trim();
            const company = document.getElementById("companyName").value.trim();
            const location = document.getElementById("jobLocation").value.trim();
            const salary = document.getElementById("jobSalary").value.trim();
            const jobType = document.getElementById("jobType").value.trim();
            const desc = document.getElementById("jobDescription").value.trim();
            
            const btnSubmit = document.getElementById("btnSubmitJob");
            btnSubmit.disabled = true;
            btnSubmit.textContent = "Publishing to Network...";

            // Push payload to global Firebase Realtime database tree
            const newJobRef = firebase.database().ref("postedJobs").push();
            const currentUser = firebase.auth().currentUser;
            const posterEmail = currentUser ? currentUser.email : "Unknown";
            
            newJobRef.set({
                title: title,
                category: category,
                company: company,
                location: location,
                salary: salary,
                jobType: jobType,
                desc: desc,
                timestamp: firebase.database.ServerValue.TIMESTAMP, // Exact Unix server execution mark
                datePosted: "Just Now",
                postedBy: posterEmail
            })
            .then(() => {
                alert("Success! Your job has been posted globally and added to the latest dashboard view feed.");
                window.location.href = "dashboard.html"; // Route back to latest summary metrics window
            })
            .catch((error) => {
                alert("Database Submission Failure: " + error.message);
                btnSubmit.disabled = false;
                btnSubmit.textContent = "Publish Position";
            });
        });
    }

    // Sidebar Logout logic processor block connection
    const logoutBtn = document.getElementById("sidebarLogoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            if (confirm("Are you sure you want to log out of JoshiPro?")) {
                firebase.auth().signOut()
                    .then(() => { window.location.href = "login.html"; })
                    .catch((err) => { alert("Logout Error: " + err.message); });
            }
        });
    }
});