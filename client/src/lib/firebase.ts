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
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate Firebase configuration
const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
const missingKeys = requiredKeys.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig]);

if (missingKeys.length > 0) {
  console.warn('Missing Firebase configuration keys:', missingKeys);
  console.warn('Firebase functionality may be limited. Please set all VITE_FIREBASE_* environment variables.');
}

// Initialize Firebase
let app;
let firebaseAuth;
let firebaseAnalytics;

try {
  // Only initialize if we have the required configuration
  if (firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId) {
    app = initializeApp(firebaseConfig);
    firebaseAuth = getAuth(app);
    
    // Only initialize analytics in browser environment
    if (typeof window !== 'undefined') {
      firebaseAnalytics = getAnalytics(app);
    }
    
    console.log('Firebase initialized successfully with project:', firebaseConfig.projectId);
  } else {
    console.warn('Firebase not initialized due to missing configuration');
  }
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
