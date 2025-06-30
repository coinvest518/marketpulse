# 🔐 Firebase Authentication Setup Guide

## Current Status
Your Firebase project is configured with ID: `marketsentiment-c1c5e`

## To Fix Authentication Issues:

### 1. Enable Google Authentication
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `marketsentiment-c1c5e`
3. Go to **Authentication** → **Sign-in method**
4. Click **Google** and **Enable** it
5. Add your domain `localhost` to authorized domains for development

### 2. Check Web App Configuration
1. In Firebase Console, go to **Project Settings** → **General**
2. Scroll down to **Your apps** section
3. Make sure you have a Web app configured
4. Copy the config and verify it matches your `.env` file

### 3. For Production (Optional for now)
To use Firebase Admin features in production:
1. Go to **Project Settings** → **Service accounts**
2. Click **Generate new private key**
3. Download the JSON file
4. Set `GOOGLE_APPLICATION_CREDENTIALS` environment variable to the file path

## Current Environment Variables
Your `.env` file has these Firebase settings:
- Project ID: `marketsentiment-c1c5e`
- Auth Domain: `marketsentiment-c1c5e.firebaseapp.com`
- API Key: `AIzaSyARpvrTagR2d-Lgz5ySCo466XI6nP_YJZs`

## Debugging
Check the browser console for detailed error messages when clicking the login button.

## Quick Test Options

### Option 1: Use Development Login (Immediate Testing)
I've added a "🚧 Dev Login (Testing)" button on the landing page that bypasses Firebase for immediate testing. This creates a mock user session so you can test the dashboard features right away.

### Option 2: Fix Firebase Authentication (Recommended for Production)
Follow steps 1-2 above to enable Google Authentication in your Firebase Console.

## Common Issues & Solutions

### "auth/operation-not-allowed"
- Google sign-in is not enabled in Firebase Console
- Go to Authentication → Sign-in method → Enable Google

### "auth/unauthorized-domain" 
- Add `localhost` to authorized domains in Firebase Console
- Go to Authentication → Settings → Authorized domains

### "Firebase initialization failed"
- Check that all environment variables in `.env` are correct
- Verify the Firebase project exists and is active

## Status Check
- ✅ Firebase project configured: `marketsentiment-c1c5e`
- ✅ Environment variables set up
- ✅ Development login bypass available
- ⚠️  Google Authentication needs to be enabled in Firebase Console
- ✅ Server shows localhost URLs on startup
- ✅ Backend routes updated to use real authentication
