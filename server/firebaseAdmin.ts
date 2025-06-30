import admin from 'firebase-admin';

// Initialize Firebase Admin with real credentials
if (!admin.apps.length) {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || "marketsentiment-c1c5e";

    // In production (like Vercel), use environment variables to create the credential
    if (process.env.FIREBASE_PRIVATE_KEY) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
        }),
        projectId: projectId
      });
      console.log('Firebase Admin initialized with service account credentials from environment variables.');
    } else {
      // Fallback for local development or demo mode where service account keys aren't set.
      // Note: verifyIdToken will not work in this mode without a real service account or emulator.
      console.warn('⚠️  Firebase Admin SDK credentials not found. Initializing in demo mode.');
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

export const auth: admin.auth.Auth = admin.auth();
export default admin;