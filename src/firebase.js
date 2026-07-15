import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCbnOKapneQFTMlu2u4XeADe4Uja1EgUsA",
  authDomain: "electionotp-4db3a.firebaseapp.com",
  projectId: "electionotp-4db3a",
  storageBucket: "electionotp-4db3a.firebasestorage.app",
  messagingSenderId: "185988387100",
  appId: "1:185988387100:web:d9ac1e8a96c0bbe5b2ead9",
  measurementId: "G-W2GQNZ607V"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };