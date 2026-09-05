/**
 * Firebase Configuration Manager
 * จัดการและบันทึกการตั้งค่า Firebase (Auth & Firestore)
 */

// ใส่ค่า Config จาก Firebase Console ของคุณที่นี่ (หรือกรอกผ่านหน้าต่าง Settings บนเว็บ)
export const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

const STORAGE_KEY = 'eng_practice_firebase_config';

/**
 * ดึงค่า Firebase Config ปัจจุบัน (จาก LocalStorage ก่อน หากไม่มีจะใช้ค่าเริ่มต้น)
 */
export function getFirebaseConfig() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Unable to read firebase config from localStorage:', e);
  }
  return DEFAULT_FIREBASE_CONFIG;
}

/**
 * บันทึกค่า Firebase Config ลง LocalStorage
 */
export function saveFirebaseConfig(config) {
  if (!config || !config.apiKey || !config.projectId) {
    throw new Error('Invalid Firebase Config: apiKey and projectId are required.');
  }
  const cleanConfig = {
    apiKey: config.apiKey.trim(),
    authDomain: (config.authDomain || '').trim(),
    projectId: config.projectId.trim(),
    storageBucket: (config.storageBucket || '').trim(),
    messagingSenderId: (config.messagingSenderId || '').trim(),
    appId: (config.appId || '').trim()
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanConfig));
  return cleanConfig;
}

/**
 * ล้างค่า Firebase Config
 */
export function clearFirebaseConfig() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * ตรวจสอบว่าตั้งค่า Firebase แล้วหรือไม่
 */
export function isFirebaseConfigured() {
  const config = getFirebaseConfig();
  return Boolean(config && config.apiKey && config.projectId && config.apiKey.length > 5);
}
