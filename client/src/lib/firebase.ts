import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyARpvrTagR2d-Lgz5ySCo466XI6nP_YJZs",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "marketsentiment-c1c5e.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "marketsentiment-c1c5e",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "marketsentiment-c1c5e.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "158454103325",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:158454103325:web:90ff5a5fb2ad08552435f4",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-LGRLYXL0Q5"
};

// Initialize Firebase
let app;
let firebaseAuth;
let firebaseAnalytics;

try {
  app = initializeApp(firebaseConfig);
  firebaseAuth = getAuth(app);
  
  // Only initialize analytics in browser environment
  if (typeof window !== 'undefined') {
    firebaseAnalytics = getAnalytics(app);
  }
  
  console.log('Firebase initialized successfully with project:', firebaseConfig.projectId);
} catch (error) {
  console.error('Firebase initialization failed:', error);
  console.log('Using config:', firebaseConfig);
}

export const auth = firebaseAuth!;
export const analytics = firebaseAnalytics;

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const signOut = () => firebaseSignOut(auth);

// Auth state listener
export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export default auth;
