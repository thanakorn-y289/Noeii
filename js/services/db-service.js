/**
 * Database Service (Cloud Firestore & LocalStorage Sync)
 * จัดการบันทึกประวัติการสนทนา คลังคำศัพท์ และสถิติการเรียน
 */

import { isFirebaseConfigured, getFirebaseConfig } from '../config/firebase-config.js';
import { authService } from './auth-service.js';

const FIREBASE_APP_URL = 'https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js';
const FIREBASE_FIRESTORE_URL = 'https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js';

class DbService {
  constructor() {
    this.db = null;
    this.firestoreMods = null;
  }

  async getFirestore() {
    if (this.db) return { db: this.db, mods: this.firestoreMods };
    if (!isFirebaseConfigured()) return null;

    try {
      const [appMod, firestoreMod] = await Promise.all([
        import(FIREBASE_APP_URL),
        import(FIREBASE_FIRESTORE_URL)
      ]);

      const config = getFirebaseConfig();
      const apps = appMod.getApps();
      const app = apps.length > 0 ? apps[0] : appMod.initializeApp(config);
      this.db = firestoreMod.getFirestore(app);
      this.firestoreMods = firestoreMod;
      return { db: this.db, mods: this.firestoreMods };
    } catch (error) {
      console.warn('Cannot load Firestore:', error);
      return null;
    }
  }

  // ===================== CONVERSATION SESSIONS =====================

  /**
   * บันทึกรอบการฝึกสนทนา
   */
  async saveConversation(sessionData) {
    const user = authService.getCurrentUser();
    const userId = user?.uid || 'guest';
    const timestamp = new Date().toISOString();
    const payload = {
      ...sessionData,
      timestamp,
      userId
    };

    // บันทึกลง LocalStorage เสมอ
    this.saveToLocalList(`history_${userId}`, payload);

    // ถ้าเชื่อมต่อ Firebase และไม่ได้เป็น Guest ให้อัปโหลดขึ้น Firestore
    if (user && !user.isGuest && isFirebaseConfigured()) {
      try {
        const fs = await this.getFirestore();
        if (fs) {
          const { collection, addDoc } = fs.mods;
          const userHistoryCol = collection(fs.db, 'users', userId, 'conversations');
          await addDoc(userHistoryCol, payload);
        }
      } catch (err) {
        console.error('Firestore save conversation error:', err);
      }
    }

    // อัปเดตสถิติ
    await this.updateStatsAfterSession(userId, sessionData);
    return payload;
  }

  /**
   * ดึงประวัติการสนทนาทั้งหมด
   */
  async getConversations() {
    const user = authService.getCurrentUser();
    const userId = user?.uid || 'guest';

    if (user && !user.isGuest && isFirebaseConfigured()) {
      try {
        const fs = await this.getFirestore();
        if (fs) {
          const { collection, getDocs, query, orderBy, limit } = fs.mods;
          const userHistoryCol = collection(fs.db, 'users', userId, 'conversations');
          const q = query(userHistoryCol, orderBy('timestamp', 'desc'), limit(50));
          const snapshot = await getDocs(q);
          const list = [];
          snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
          if (list.length > 0) return list;
        }
      } catch (err) {
        console.warn('Firestore fetch history error, using local:', err);
      }
    }

    return this.getLocalList(`history_${userId}`);
  }

  // ===================== VOCABULARY BANK =====================

  /**
   * บันทึกคำศัพท์ลงคลังคำศัพท์
   */
  async saveVocabulary(vocabItem) {
    const user = authService.getCurrentUser();
    const userId = user?.uid || 'guest';
    const item = {
      id: 'vocab_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      word: vocabItem.word.trim(),
      phonetic: vocabItem.phonetic || '',
      th: vocabItem.th || '',
      example: vocabItem.example || '',
      savedAt: new Date().toISOString()
    };

    // บันทึกลง LocalStorage
    const currentList = this.getLocalList(`vocab_${userId}`);
    // ป้องกันคำซ้ำ
    const filtered = currentList.filter(v => v.word.toLowerCase() !== item.word.toLowerCase());
    filtered.unshift(item);
    localStorage.setItem(`vocab_${userId}`, JSON.stringify(filtered));

    // บันทึกขึ้น Firestore
    if (user && !user.isGuest && isFirebaseConfigured()) {
      try {
        const fs = await this.getFirestore();
        if (fs) {
          const { doc, setDoc } = fs.mods;
          const vocabDoc = doc(fs.db, 'users', userId, 'vocabulary', item.word.toLowerCase());
          await setDoc(vocabDoc, item);
        }
      } catch (err) {
        console.error('Firestore save vocab error:', err);
      }
    }

    return item;
  }

  /**
   * ลบคำศัพท์ออกจากคลัง
   */
  async removeVocabulary(word) {
    const user = authService.getCurrentUser();
    const userId = user?.uid || 'guest';

    const currentList = this.getLocalList(`vocab_${userId}`);
    const filtered = currentList.filter(v => v.word.toLowerCase() !== word.toLowerCase());
    localStorage.setItem(`vocab_${userId}`, JSON.stringify(filtered));

    if (user && !user.isGuest && isFirebaseConfigured()) {
      try {
        const fs = await this.getFirestore();
        if (fs) {
          const { doc, deleteDoc } = fs.mods;
          await deleteDoc(doc(fs.db, 'users', userId, 'vocabulary', word.toLowerCase()));
        }
      } catch (err) {
        console.error('Firestore delete vocab error:', err);
      }
    }
  }

  /**
   * ดึงรายการคำศัพท์ทั้งหมด
   */
  async getVocabulary() {
    const user = authService.getCurrentUser();
    const userId = user?.uid || 'guest';

    if (user && !user.isGuest && isFirebaseConfigured()) {
      try {
        const fs = await this.getFirestore();
        if (fs) {
          const { collection, getDocs } = fs.mods;
          const vocabCol = collection(fs.db, 'users', userId, 'vocabulary');
          const snapshot = await getDocs(vocabCol);
          const list = [];
          snapshot.forEach(doc => list.push(doc.data()));
          if (list.length > 0) {
            // ซิงค์กลับลง local cache
            localStorage.setItem(`vocab_${userId}`, JSON.stringify(list));
            return list;
          }
        }
      } catch (err) {
        console.warn('Firestore fetch vocab error, using local:', err);
      }
    }

    return this.getLocalList(`vocab_${userId}`);
  }

  // ===================== STATS & STREAKS =====================

  async getUserStats() {
    const user = authService.getCurrentUser();
    const userId = user?.uid || 'guest';

    const defaultStats = {
      totalPractices: 0,
      totalMinutes: 0,
      streakDays: 1,
      lastPracticeDate: null,
      completedScenarios: []
    };

    const saved = localStorage.getItem(`stats_${userId}`);
    let stats = defaultStats;
    if (saved) {
      try {
        stats = { ...defaultStats, ...JSON.parse(saved) };
      } catch (e) {}
    }

    if (user && !user.isGuest && isFirebaseConfigured()) {
      try {
        const fs = await this.getFirestore();
        if (fs) {
          const { doc, getDoc } = fs.mods;
          const statsDoc = await getDoc(doc(fs.db, 'users', userId, 'meta', 'stats'));
          if (statsDoc.exists()) {
            stats = { ...stats, ...statsDoc.data() };
            localStorage.setItem(`stats_${userId}`, JSON.stringify(stats));
          }
        }
      } catch (e) {
        console.warn('Firestore get stats error:', e);
      }
    }

    return stats;
  }

  async updateStatsAfterSession(userId, sessionData) {
    const current = await this.getUserStats();
    const today = new Date().toISOString().split('T')[0];
    let newStreak = current.streakDays || 1;

    if (current.lastPracticeDate) {
      const last = new Date(current.lastPracticeDate);
      const now = new Date(today);
      const diffDays = Math.round((now - last) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
    }

    const durationMin = Math.max(1, Math.round((sessionData.durationSeconds || 60) / 60));
    const completedScenarios = Array.from(new Set([...(current.completedScenarios || []), sessionData.scenarioId]));

    const updated = {
      totalPractices: (current.totalPractices || 0) + 1,
      totalMinutes: (current.totalMinutes || 0) + durationMin,
      streakDays: newStreak,
      lastPracticeDate: today,
      completedScenarios
    };

    localStorage.setItem(`stats_${userId}`, JSON.stringify(updated));

    const user = authService.getCurrentUser();
    if (user && !user.isGuest && isFirebaseConfigured()) {
      try {
        const fs = await this.getFirestore();
        if (fs) {
          const { doc, setDoc } = fs.mods;
          await setDoc(doc(fs.db, 'users', userId, 'meta', 'stats'), updated, { merge: true });
        }
      } catch (e) {
        console.error('Firestore update stats error:', e);
      }
    }

    return updated;
  }

  // ===================== LOCAL STORAGE HELPERS =====================

  getLocalList(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  saveToLocalList(key, item) {
    const list = this.getLocalList(key);
    list.unshift(item);
    // เก็บสูงสุด 100 รายการ
    if (list.length > 100) list.pop();
    localStorage.setItem(key, JSON.stringify(list));
  }
}

export const dbService = new DbService();
