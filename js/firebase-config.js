// =============================================
// Firebase Configuration - FREE TIER (Spark Plan)
// =============================================
// HOW TO SETUP (takes ~5 minutes):
//
// 1. Go to https://console.firebase.google.com
// 2. Click "Add project" → name it anything → Create
// 3. Click the Web icon (</>) → register app name "GlassCalc"
// 4. Copy the config object below from Firebase console
// 5. Paste your values into the config below
//
// AUTHENTICATION SETUP:
// 6. Firebase Console → Build → Authentication → Get Started
// 7. Enable "Email/Password" sign-in provider
// 8. Enable "Phone" sign-in provider (for OTP)
//
// STORAGE SETUP:
// 9. Firebase Console → Build → Storage → Get Started
// 10. Start in test mode → Select a location → Done
//
// SECURITY RULES (for private gallery):
// 11. Go to Storage → Rules → Replace with:
//     rules_version = '2';
//     service firebase.storage {
//       match /b/{bucket}/o {
//         match /gallery/{userId}/{allPaths=**} {
//           allow read, write: if request.auth != null && request.auth.uid == userId;
//         }
//       }
//     }
// 12. Publish rules
//
// FREE TIER LIMITS (Spark Plan):
// - 1 GB storage (enough for ~5000 photos)
// - 10 GB/month downloads
// - 50K reads/day
// - Email + Phone auth included
// - NO credit card required
// =============================================

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyAMgbauxbWdq3Xqeym04ZsRcaVvT6Y1UrE",
    authDomain: "calci-52026.firebaseapp.com",
    projectId: "calci-52026",
    storageBucket: "calci-52026.firebasestorage.app",
    messagingSenderId: "734747306225",
    appId: "1:734747306225:web:8a221c4ea95aa9e276e150"
};
