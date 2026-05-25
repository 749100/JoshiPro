document.addEventListener("DOMContentLoaded", () => {
    
    let globalBase64ImageString = ""; // Cache string variable across memory
    let isInitialFetchCheck = true;

    // Secure Authenticated Route Guards 
    firebase.auth().onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = "login.html";
            return;
        }

        if (isInitialFetchCheck) {
            isInitialFetchCheck = false;
            loadUserProfileData(user);
        }
    });

    const filePicker = document.getElementById("imageFileInputPicker");
    const profileForm = document.getElementById("profileFormDetails");

    // ==========================================================================
    // LOCAL FILE READER PROCESSOR (Converts Device Image -> Base64 Data)
    // ==========================================================================
    if (filePicker) {
        filePicker.addEventListener("change", (event) => {
            const targetFile = event.target.files[0];
            if (!targetFile) return;

            // Enforcement Check: 1MB file size limits cap
            if (targetFile.size > 1024 * 1024) {
                alert("File vector asset is too massive! Please choose an alternate option scaled under 1MB.");
                filePicker.value = "";
                return;
            }

            const clientReaderEngine = new FileReader();
            clientReaderEngine.onloadend = () => {
                globalBase64ImageString = clientReaderEngine.result;
                
                // Show instant preview locally on the layout page workspace
                document.getElementById("profileWorkspaceAvatar").src = globalBase64ImageString;
                document.getElementById("topHeaderAvatar").src = globalBase64ImageString;
                
                // Live calculate progress updates immediately on image selection
                evaluateProgressMetrics();
            };
            clientReaderEngine.readAsDataURL(targetFile);
        });
    }

    // ==========================================================================
    // REALTIME PROGRESS BAR CALCULATION STACK ENGINE
    // ==========================================================================
    function evaluateProgressMetrics() {
        const nameVal = document.getElementById("profileFullName").value.trim();
        const titleVal = document.getElementById("profileProfessionalTitle").value.trim();
        const bioVal = document.getElementById("profileBioSummary").value.trim();
        const imageVal = globalBase64ImageString;
        const phoneVal = document.getElementById("profilePhoneNumber") ? document.getElementById("profilePhoneNumber").value.trim() : "";
        const emailVal = document.getElementById("profileEmail") ? document.getElementById("profileEmail").value.trim() : "";

        let structuralPoints = 0;

        // Key fields to evaluate.
        if (nameVal !== "") structuralPoints += 20;
        if (titleVal !== "") structuralPoints += 20;
        if (bioVal !== "") structuralPoints += 20;
        if (imageVal !== "") structuralPoints += 20;
        if (phoneVal !== "" || emailVal !== "") structuralPoints += 20;

        // UI Target Modifications
        const progressFill = document.getElementById("profileProgressBarFill");
        const percentText = document.getElementById("progressPercentageText");
        const feedbackMessage = document.getElementById("progressFeedbackMessage");

        if (progressFill && percentText) {
            progressFill.style.width = `${structuralPoints}%`;
            percentText.textContent = `${structuralPoints}%`;
        }

        // Contextual messaging recommendations mapping rules
        if (feedbackMessage) {
            if (structuralPoints === 0) feedbackMessage.textContent = "Begin your onboarding by filling out information blocks.";
            else if (structuralPoints < 60) feedbackMessage.textContent = "Great start! Fill out your title or bio summary to double your search traction.";
            else if (structuralPoints < 100) feedbackMessage.textContent = "Almost complete! Complete the missing links to lock 100% network strength.";
            else feedbackMessage.textContent = "Brilliant! Your professional profile parameters are completely locked and fully optimized.";
        }
    }

    // Bind real-time input event checks to shift progress bars fluidly as you type
    ["profileFullName", "profileProfessionalTitle", "profileBioSummary", "profilePhoneNumber", "profileEmail"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener("input", evaluateProgressMetrics);
    });

    // ==========================================================================
    // DATA LAYER NETWORK HANDLERS (Fetch & Save Tasks)
    // ==========================================================================
    function loadUserProfileData(user) {
        const emailKey = user.email.replace(/\./g, "_").replace(/@/g, "_at_");

        firebase.database().ref("userProfiles/" + emailKey).once("value", (snapshot) => {
            if (!snapshot.exists()) {
                evaluateProgressMetrics(); // Display default zero state metrics
                return;
            }

            const data = snapshot.val();
            
            // Re-populate text boxes inputs smoothly
            if (data.fullName) document.getElementById("profileFullName").value = data.fullName;
            if (data.headline) document.getElementById("profileProfessionalTitle").value = data.headline;
            if (data.bio) document.getElementById("profileBioSummary").value = data.bio;
            if (data.phoneNumber && document.getElementById("profilePhoneNumber")) document.getElementById("profilePhoneNumber").value = data.phoneNumber;
            if (data.emailAddress && document.getElementById("profileEmail")) document.getElementById("profileEmail").value = data.emailAddress;
            
            if (data.avatarBase64) {
                globalBase64ImageString = data.avatarBase64;
                document.getElementById("profileWorkspaceAvatar").src = globalBase64ImageString;
                document.getElementById("topHeaderAvatar").src = globalBase64ImageString;
            }

            // Fire an initial progress evaluation setup call
            evaluateProgressMetrics();
        });
    }

    if (profileForm) {
        profileForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const user = firebase.auth().currentUser;
            if (!user) return;

            const emailKey = user.email.replace(/\./g, "_").replace(/@/g, "_at_");
            const btnSave = document.getElementById("saveProfileBtn");

            btnSave.disabled = true;
            btnSave.textContent = "Syncing profile data matrix...";

            const phoneEl = document.getElementById("profilePhoneNumber");
            const emailEl = document.getElementById("profileEmail");

            firebase.database().ref("userProfiles/" + emailKey).set({
                fullName: document.getElementById("profileFullName").value.trim(),
                headline: document.getElementById("profileProfessionalTitle").value.trim(),
                bio: document.getElementById("profileBioSummary").value.trim(),
                phoneNumber: phoneEl ? phoneEl.value.trim() : "",
                emailAddress: emailEl ? emailEl.value.trim() : "",
                avatarBase64: globalBase64ImageString,
                lastUpdated: firebase.database.ServerValue.TIMESTAMP
            })
            .then(() => {
                alert("Success! Your profile adjustments have been securely synchronized across JoshiPro.");
                btnSave.disabled = false;
                btnSave.textContent = "Save Changes";
                
                // ==========================================================================
                // FIXED: Connects seamlessly with your Realtime Database notifications feed
                // ==========================================================================
                if (window.logAndShowNotification) {
                    window.logAndShowNotification(
                        "Account Profile Updated", 
                        "Your professional profile parameters were successfully updated and synchronized.", 
                        "security", 
                        "Account"
                    );
                } else {
                    // Fail-safe direct write fallback if navigating away or script binding is delayed
                    firebase.database().ref("notifications/" + emailKey).push({
                        title: "Account Profile Updated",
                        message: "Your professional profile parameters were successfully updated and synchronized.",
                        badgeClass: "security",
                        badgeLabel: "Account",
                        timestamp: firebase.database.ServerValue.TIMESTAMP
                    });
                }
            })
            .catch((err) => {
                alert("Sync Error Failure: " + err.message);
                btnSave.disabled = false;
                btnSave.textContent = "Save Changes";
            });
        });
    }

    // Sidebar Session Termination Trigger
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