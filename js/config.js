// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDB7q-liJN_98AKb57jBIb8yxB9OczDVq0",
  authDomain: "alphax-e8897.firebaseapp.com",
  databaseURL: "https://alphax-e8897-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "alphax-e8897",
  storageBucket: "alphax-e8897.firebasestorage.app",
  messagingSenderId: "497133559277",
  appId: "1:497133559277:web:effd91314ed118d3001be4"
};

// Initialize Firebase using the global compatibility bundle
firebase.initializeApp(firebaseConfig);

// Set up references for your login.js and register.js files to share
const auth = firebase.auth();
const database = firebase.database();

// ==========================================================================
// 📱 GLOBAL JOSHIPRO MOBILE SIDEBAR DRAWER TOGGLE UTILITY
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    const toggleButton = document.getElementById("mobileMenuToggleBtn");
    const sidebarContainer = document.querySelector(".sidebar");

    if (toggleButton && sidebarContainer) {
        toggleButton.addEventListener("click", (event) => {
            event.stopPropagation(); // Stops immediate closing actions
            sidebarContainer.classList.toggle("mobile-open");
        });

        // Smart Feature: Click anywhere on the dashboard content panel to auto-close the menu drawer!
        document.addEventListener("click", (event) => {
            if (!sidebarContainer.contains(event.target) && event.target !== toggleButton) {
                sidebarContainer.classList.remove("mobile-open");
            }
        });
    }
});