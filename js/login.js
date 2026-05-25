document.addEventListener("DOMContentLoaded", () => {
    const btnLogin = document.getElementById("btnLogin");

    if (btnLogin) {
        btnLogin.addEventListener("click", (e) => {
            e.preventDefault(); // Prevents page reload

            const txtEmail = document.getElementById("txtEmail").value.trim();
            const txtPassword = document.getElementById("txtPassword").value;

            if (!txtEmail || !txtPassword) {
                alert("Please fill in all fields.");
                return; 
            }

            // Provide visual feedback while connecting
            btnLogin.disabled = true;
            btnLogin.innerHTML = "Logging in...";

            firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
                .then(() => {
                    return firebase.auth().signInWithEmailAndPassword(txtEmail, txtPassword);
                })
                .then((userCredential) => {
                    // Convert email to match your custom database path format
                    const emailid = txtEmail.replace(/\./g, "_").replace(/@/g, "_at_");
                    return firebase.database().ref("users/" + emailid).once("value");
                })
                .then((snapshot) => {
                    if (snapshot.exists()) {
                        const users = snapshot.val();
                        const role = users.Role;
                        const status = users.Status;

                        if (status === "Approved") {
                            if (role === "Admin") {
                                window.location.href = "dashboard.html";
                            } else if (role === "User") {
                                alert("Login successful! Redirecting to dashboard...");
                                window.location.href = "dashboard.html"; // Make sure user.html exists if you prefer separate dashboards!
                            } else {
                                alert("Unknown user role.");
                                resetLoginButton();
                            }
                        } else if (status === "Pending") {
                            alert("Your account is pending approval. Please wait for an administrator to approve your account.");
                            firebase.auth().signInWithEmailAndPassword(txtEmail, txtPassword);
                            resetLoginButton();
                        } else {
                            alert("Your account has been rejected. Please contact support for more information.");
                            firebase.auth().signInWithEmailAndPassword(txtEmail, txtPassword);
                            resetLoginButton();
                        }
                    } else {
                        alert("No profile data found in the database for this account.");
                        firebase.auth().signInWithEmailAndPassword(txtEmail, txtPassword);
                        resetLoginButton();
                    }
                })
                .catch((error) => {
                    alert("Error: " + error.message);
                    resetLoginButton(); // 🔒 FIXED: Re-enables the button so users can try logging in again
                });
        });
    }

    // Quick helper function to reset the button state easily
    function resetLoginButton() {
        btnLogin.disabled = false;
        btnLogin.innerHTML = "Login";
    }
});