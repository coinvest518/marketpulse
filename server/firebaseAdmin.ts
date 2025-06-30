import admin from 'firebase-admin';

// Firebase Admin configuration
const firebaseConfig = {
  projectId: "market-research-app",
  // In production, you would use a service account key file
  // For development, we'll use the Firebase emulator or a demo config
};

// Initialize Firebase Admin
if (!admin.apps.length) {
  // For demo purposes, we'll initialize without credentials
  // In production, you should use proper service account credentials
  admin.initializeApp(firebaseConfig);
}

export const auth = admin.auth();
export default admin;