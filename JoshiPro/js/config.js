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