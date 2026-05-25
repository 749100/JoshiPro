document.addEventListener("DOMContentLoaded", () => {
    
    const resetForm = document.getElementById("passwordResetForm");
    const submitBtn = document.getElementById("submitResetActionBtn");
    const googleBtn = document.getElementById("googleSignInBtn");

    // ==========================================================================
    // ACTION 1: FIREBASE EMAIL PASSWORD RESET
    // ==========================================================================
    // ==========================================================================
// ACTION 1: FIREBASE EMAIL PASSWORD RESET
// ==========================================================================
if (resetForm) {
    resetForm.addEventListener("submit", (event) => {
        event.preventDefault(); // Stop page from reloading instantly

        const emailInput = document.getElementById("resetUserEmail");
        if (!emailInput) {
            alert("Error: HTML input field with ID 'resetUserEmail' not found.");
            return;
        }
        
        const emailInputString = emailInput.value.trim();

        if (emailInputString === "") {
            alert("Please type a valid email address first!");
            return;
        }

        // Lock controls to prevent accidental double-clicks
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending Link...";
        if (googleBtn) googleBtn.disabled = true;

        firebase.auth().sendPasswordResetEmail(emailInputString)
            .then(() => {
                alert(`Success! A password recovery link has been safely sent to:\n${emailInputString}\n\nPlease check your email inbox and your Spam folder!`);
                window.location.href = "login.html";
            })
            .catch((error) => {
                // This will output the exact reason it failed (e.g., user-not-found)
                alert("Firebase Reset Error: " + error.message);
                console.error(error);
                
                // UNFREEZE the controls immediately on error so you can fix it
                submitBtn.disabled = false;
                submitBtn.textContent = "Send Recovery Link";
                if (googleBtn) googleBtn.disabled = false;
            });
    });
}

    // ==========================================================================
    // ACTION 2: GOOGLE BACKUP SYSTEM LOGIN FAILSAFE
    // ==========================================================================
    if (googleBtn) {
        googleBtn.addEventListener("click", () => {
            const googleProvider = new firebase.auth.GoogleAuthProvider();
            googleProvider.setCustomParameters({ prompt: 'select_account' });

            googleBtn.disabled = true;
            googleBtn.textContent = "Connecting to Google...";
            if (submitBtn) submitBtn.disabled = true;

            firebase.auth().signInWithPopup(googleProvider)
                .then((result) => {
                    alert(`Access Granted! Logged in as: ${result.user.displayName || result.user.email}`);
                    window.location.href = "dashboard.html";
                })
                .catch((error) => {
                    alert("Google Authentication Error: " + error.message);
                    
                    // Unfreeze buttons on failure
                    googleBtn.disabled = false;
                    googleBtn.innerHTML = `
                        <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google Logo">
                        Continue with Google
                    `;
                    if (submitBtn) submitBtn.disabled = false;
                });
        });
    }
});