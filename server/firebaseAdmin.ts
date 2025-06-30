import admin from 'firebase-admin';

// Initialize Firebase Admin with real credentials
if (!admin.apps.length) {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || "marketsentiment-c1c5e";
    
    // For development, you can use the Firebase emulator or initialize without credentials
    // For production, you MUST provide service account credentials
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      // Production setup with service account
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: projectId
      });
      console.log('Firebase Admin initialized with service account credentials');
    } else {
      // Development setup - Firebase emulator or demo mode
      console.warn('⚠️  No GOOGLE_APPLICATION_CREDENTIALS found. Running in demo mode.');
      console.warn('   For production, please set up Firebase service account credentials.');
      admin.initializeApp({
        projectId: projectId
      });
    }
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
    // Initialize with minimal config as fallback
    admin.initializeApp({
      projectId: "marketsentiment-c1c5e"
    });
  }
}

export const auth = admin.auth();
export default admin;