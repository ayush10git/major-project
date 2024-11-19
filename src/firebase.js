// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDG7PZqWE6glaRL0uZzVavjjy4AtG6Mut8",
  authDomain: "majorproject-4aa9d.firebaseapp.com",
  databaseURL: "https://majorproject-4aa9d-default-rtdb.firebaseio.com",
  projectId: "majorproject-4aa9d",
  storageBucket: "majorproject-4aa9d.firebasestorage.app",
  messagingSenderId: "465178625589",
  appId: "1:465178625589:web:784ea8da5cd4326384137c",
  measurementId: "G-RPL958XRR1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };
