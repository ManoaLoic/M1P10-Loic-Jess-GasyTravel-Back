const { initializeApp } = require("firebase/app");
const { getAnalytics } = require("firebase/analytics");

const firebaseConfig = {
    apiKey: "AIzaSyBX_PrCCcillv6I9Z8-F07GQijxOYnsYko",
    authDomain: "gasytravel.firebaseapp.com",
    projectId: "gasytravel",
    storageBucket: "gasytravel.appspot.com",
    messagingSenderId: "497992565930",
    appId: "1:497992565930:web:f3e10033b3bcb1d8dd3cd3",
    measurementId: "G-K9RJRYKLKX"
};
  
  // Initialize Firebase
  const fireBaseApp = initializeApp(firebaseConfig);
  const analytics = getAnalytics(fireBaseApp);

module.exports = { fireBaseApp, analytics };