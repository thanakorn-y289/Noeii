/**
 * Authentication Service (Firebase Google Auth & Guest Mode)
 * ให้บริการยืนยันตัวตนด้วย Google Sign-In ผ่าน Firebase Auth
 */

import { getFirebaseConfig, isFirebaseConfigured } from '../config/firebase-config.js';

// Firebase Modular SDK via Google CDN
const FIREBASE_APP_URL = 'https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js';
const FIREBASE_AUTH_URL = 'https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js';

class AuthService {
  constructor() {
    this.app = null;
    this.auth = null;
    this.currentUser = null;
    this.authStateListeners = [];
    this.isInitialized = false;
    this.firebaseModules = null;
  }

  /**
   * โหลด Firebase SDK แบบ Dynamic ESM
   */
  async loadFirebaseSDK() {
    if (this.firebaseModules) return this.firebaseModules;
    try {
      const [appMod, authMod] = await Promise.all([
        import(FIREBASE_APP_URL),
        import(FIREBASE_AUTH_URL)
      ]);
      this.firebaseModules = { ...appMod, ...authMod };
      return this.firebaseModules;
    } catch (error) {
      console.warn('Cannot load Firebase SDK from CDN (offline or blocked):', error);
      return null;
    }
  }

  /**
   * เริ่มต้นระบบ Auth
   */
  async init(onAuthStateChange) {
    if (onAuthStateChange) {
      this.authStateListeners.push(onAuthStateChange);
    }

    if (!isFirebaseConfigured()) {
      // โหมด Offline/Demo: โหลดข้อมูล Guest จาก localStorage
      this.loadGuestUser();
      this.isInitialized = true;
      this.notifyListeners(this.currentUser);
      return;
    }

    try {
      const fb = await this.loadFirebaseSDK();
      if (!fb) {
        this.loadGuestUser();
        this.isInitialized = true;
        this.notifyListeners(this.currentUser);
        return;
      }

      const config = getFirebaseConfig();
      // Initialize Firebase App
      const existingApps = fb.getApps();
      this.app = existingApps.length > 0 ? existingApps[0] : fb.initializeApp(config);
      this.auth = fb.getAuth(this.app);

      // Listen for auth state changes
      fb.onAuthStateChanged(this.auth, (user) => {
        if (user) {
          this.currentUser = {
            uid: user.uid,
            displayName: user.displayName || 'English Learner',
            email: user.email,
            photoURL: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
            isGuest: false
          };
          localStorage.setItem('eng_practice_last_user', JSON.stringify(this.currentUser));
        } else {
          // Check if guest user was stored
          this.loadGuestUser();
        }
        this.isInitialized = true;
        this.notifyListeners(this.currentUser);
      });
    } catch (error) {
      console.error('Firebase Auth initialization error:', error);
      this.loadGuestUser();
      this.isInitialized = true;
      this.notifyListeners(this.currentUser);
    }
  }

  loadGuestUser() {
    const cached = localStorage.getItem('eng_practice_guest_user');
    if (cached) {
      try {
        this.currentUser = JSON.parse(cached);
        return;
      } catch (e) {}
    }
    // Default guest
    this.currentUser = {
      uid: 'guest_user_' + Math.random().toString(36).substring(2, 8),
      displayName: 'Guest Learner',
      email: null,
      photoURL: 'https://api.dicebear.com/7.x/bottts/svg?seed=guest',
      isGuest: true
    };
    localStorage.setItem('eng_practice_guest_user', JSON.stringify(this.currentUser));
  }

  /**
   * เข้าสู่ระบบด้วย Google
   */
  async signInWithGoogle() {
    if (!isFirebaseConfigured()) {
      throw new Error('CONFIG_REQUIRED');
    }

    const fb = await this.loadFirebaseSDK();
    if (!fb || !this.auth) {
      throw new Error('SDK_NOT_LOADED');
    }

    const provider = new fb.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      const result = await fb.signInWithPopup(this.auth, provider);
      const user = result.user;
      this.currentUser = {
        uid: user.uid,
        displayName: user.displayName || 'English Learner',
        email: user.email,
        photoURL: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
        isGuest: false
      };
      this.notifyListeners(this.currentUser);
      return this.currentUser;
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      throw error;
    }
  }

  /**
   * ออกจากระบบ
   */
  async signOut() {
    try {
      if (this.auth && !this.currentUser?.isGuest) {
        const fb = await this.loadFirebaseSDK();
        if (fb) {
          await fb.signOut(this.auth);
        }
      }
    } catch (error) {
      console.warn('Sign out error:', error);
    }

    // Reset to fresh guest
    localStorage.removeItem('eng_practice_last_user');
    this.loadGuestUser();
    this.notifyListeners(this.currentUser);
  }

  /**
   * ดึง User ปัจจุบัน
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * ตรวจสอบว่าล็อกอินด้วย Google Account หรือไม่
   */
  isLoggedInWithGoogle() {
    return Boolean(this.currentUser && !this.currentUser.isGuest && this.currentUser.uid);
  }

  notifyListeners(user) {
    this.authStateListeners.forEach(listener => {
      try {
        listener(user);
      } catch (e) {
        console.error('Listener callback error:', e);
      }
    });
  }

  onAuthStateChanged(listener) {
    this.authStateListeners.push(listener);
    if (this.isInitialized) {
      listener(this.currentUser);
    }
  }
}

export const authService = new AuthService();
