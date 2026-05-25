// Ensure the script runs after the DOM loads
document.addEventListener("DOMContentLoaded", () => {
    // 1. Corrected case-sensitivity issue (btnRegister matches your HTML id)
    const btnRegister = document.getElementById("btnRegister");

    if (btnRegister) {
        btnRegister.addEventListener("click", (e) => {
            e.preventDefault(); // Prevents page reload

            // 2. Properly declared local variables using const
            const txtFullName = document.getElementById("txtFullName").value.trim();
            const txtId = document.getElementById("txtId").value.trim();
            const txtPhone = document.getElementById("txtPhone").value.trim();
            const txtEmail = document.getElementById("txtEmail").value.trim();
            const txtPassword = document.getElementById("txtPassword").value;
            const txtConfirmPassword = document.getElementById("txtConfirmPassword").value;

            // 3. Validation: Check empty fields
            if (!txtFullName || !txtId || !txtPhone || !txtEmail || !txtPassword || !txtConfirmPassword) {
                alert("Please fill in all fields.");
                return;
            }

            // 4. Fixed: Logic inverted so Firebase runs when passwords DO match
            if (txtPassword === txtConfirmPassword) {
               const emailid = txtEmail.replace(/\./g, "_").replace(/@/g, "_at_");
               const status = "Pending";
               const role = "User";
               const timestamp = new Date().toISOString();

               firebase.auth().createUserWithEmailAndPassword(txtEmail, txtPassword)
                   .then((userCredential) => {
                       return firebase.database().ref("users/" + emailid).set({
                           FullName: txtFullName,
                           Id: txtId,
                           Phone: txtPhone,
                           Email: txtEmail,
                           Role: role,
                           Status: status,
                           Timestamp: timestamp
                       });
                   })
                   .then(() => {
                       alert("Registration successful! Your account is pending approval.");
                       window.location.href = "login.html";
                   })
                   .catch((error) => {
                       alert("Error: " + error.message);
                   });
            } else {
                alert("Passwords do not match.");
            }
        });
    }
});