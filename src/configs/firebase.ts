// src/config/firebase.ts
import admin from 'firebase-admin';

import serviceAccount from '../probeauty-2025-firebase-adminsdk-fbsvc-09d925aa47.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

export default admin;
