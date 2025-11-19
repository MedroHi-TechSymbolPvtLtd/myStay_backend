import * as admin from 'firebase-admin';

/**
 * Firebase Admin Service
 * 
 * Handles Firebase Admin SDK initialization and biometric token verification
 */

export class FirebaseService {
  private app: admin.app.App | null = null;
  private initialized = false;

  /**
   * Initialize Firebase Admin SDK
   */
  initialize(): void {
    if (this.initialized && this.app) {
      return;
    }

    try {
      // Check if Firebase credentials are provided
      const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
      const firebaseProjectId = process.env.FIREBASE_PROJECT_ID;

      if (serviceAccountPath) {
        // Initialize with service account file
        const serviceAccount = require(serviceAccountPath);
        this.app = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: firebaseProjectId || serviceAccount.project_id,
        });
      } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        // Initialize with service account JSON string
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        this.app = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: firebaseProjectId || serviceAccount.project_id,
        });
      } else {
        // Try default credentials (for Google Cloud environments)
        try {
          this.app = admin.initializeApp({
            projectId: firebaseProjectId,
          });
        } catch (error) {
          console.warn('[Firebase Service] Firebase Admin not initialized. Biometric login will be disabled.');
          console.warn('[Firebase Service] Set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT env var to enable.');
          this.initialized = true; // Mark as initialized to prevent repeated warnings
          return;
        }
      }

      this.initialized = true;
      console.log('[Firebase Service] Firebase Admin initialized successfully');
    } catch (error) {
      console.error('[Firebase Service] Failed to initialize Firebase Admin:', error);
      this.initialized = true; // Mark as initialized to prevent repeated attempts
    }
  }

  /**
   * Verify Firebase ID token (for biometric authentication)
   */
  async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken | null> {
    if (!this.app) {
      this.initialize();
    }

    if (!this.app) {
      console.error('[Firebase Service] Firebase Admin not initialized');
      return null;
    }

    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      console.log('[Firebase Service] Token verified successfully for UID:', decodedToken.uid);
      return decodedToken;
    } catch (error) {
      console.error('[Firebase Service] Token verification failed:', error);
      return null;
    }
  }

  /**
   * Check if Firebase is initialized and available
   */
  isAvailable(): boolean {
    if (!this.initialized) {
      this.initialize();
    }
    return this.app !== null;
  }
}

export const firebaseService = new FirebaseService();

// Initialize on module load
firebaseService.initialize();

