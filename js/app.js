/**
 * Application Bootstrap
 * จุดเริ่มต้นการทำงานของแอพพลิเคชัน
 */

import { authService } from './services/auth-service.js';
import { dbService } from './services/db-service.js';
import { uiController } from './ui/ui-controller.js';
import { modalController } from './ui/modal-controller.js';
import { isFirebaseConfigured } from './config/firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Setup Theme (Dark / Light)
  initTheme();

  // 2. Wire Global Modal & Event Listeners ทันที (ไม่ต้องรอ Network/Firebase)
  wireGlobalEvents();

  // 3. Expose helpers to window
  window.modalController = modalController;
  window.openCustomScenarioModal = () => modalController.openCustomScenarioModal();

  // 4. Initialize UI Controller
  uiController.init();

  // 5. Initialize Firebase Auth (ทำงานใน Background)
  authService.init((user) => {
    uiController.updateUserUI(user);
  }).catch((e) => {
    console.warn('Auth init failed:', e);
  });
});

function initTheme() {
  const savedTheme = localStorage.getItem('eng_practice_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  const themeToggle = document.getElementById('btn-theme-toggle');
  if (themeToggle) {
    themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('eng_practice_theme', next);
      themeToggle.textContent = next === 'dark' ? '☀️' : '🌙';
    });
  }
}

function wireGlobalEvents() {
  // Firebase Modal buttons
  document.getElementById('btn-save-firebase')?.addEventListener('click', () => {
    modalController.saveFirebaseFromForm();
  });

  document.getElementById('btn-clear-firebase')?.addEventListener('click', () => {
    modalController.clearFirebase();
  });

  document.getElementById('btn-close-firebase-modal')?.addEventListener('click', () => {
    modalController.closeFirebaseModal();
  });

  // Settings Modal buttons
  document.getElementById('btn-save-settings')?.addEventListener('click', () => {
    modalController.saveSettings();
  });

  document.getElementById('btn-close-settings-modal')?.addEventListener('click', () => {
    modalController.closeSettingsModal();
  });

  document.getElementById('setting-rate')?.addEventListener('input', (e) => {
    const valEl = document.getElementById('setting-rate-val');
    if (valEl) valEl.textContent = `${e.target.value}x`;
  });

  // Profile Modal buttons
  document.getElementById('btn-close-profile-modal')?.addEventListener('click', () => {
    modalController.closeProfileModal();
  });

  document.getElementById('btn-modal-google-login')?.addEventListener('click', async () => {
    if (!isFirebaseConfigured()) {
      modalController.closeProfileModal();
      modalController.openFirebaseModal();
      modalController.showToast('กรุณาตั้งค่า Firebase Config ก่อนเข้าสู่ระบบด้วย Google', 'warning');
      return;
    }

    try {
      modalController.showToast('กำลังเปิดหน้าต่างเข้าสู่ระบบ Google...', 'info');
      await authService.signInWithGoogle();
      modalController.showToast('เข้าสู่ระบบสำเร็จด้วย Google!', 'success');
      modalController.closeProfileModal();
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') {
        modalController.showToast('ยกเลิกการเข้าสู่ระบบ', 'info');
      } else if (err.code === 'auth/unauthorized-domain') {
        modalController.showToast('โดเมนนี้ยังไม่ได้รับอนุญาตใน Firebase Console กรุณาเพิ่มใน Authorized Domains', 'error', 6000);
      } else {
        modalController.showToast('เกิดข้อผิดพลาดในการ Login: ' + err.message, 'error');
      }
    }
  });

  document.getElementById('btn-modal-logout')?.addEventListener('click', async () => {
    await authService.signOut();
    modalController.showToast('ออกจากระบบเรียบร้อย', 'info');
    modalController.closeProfileModal();
  });

  // Add Custom Vocab Modal
  const addVocabModal = document.getElementById('add-vocab-modal');
  document.getElementById('btn-open-add-vocab')?.addEventListener('click', () => {
    if (addVocabModal) addVocabModal.classList.add('active');
  });

  document.getElementById('btn-close-add-vocab-modal')?.addEventListener('click', () => {
    if (addVocabModal) addVocabModal.classList.remove('active');
  });

  document.getElementById('btn-save-custom-vocab')?.addEventListener('click', async () => {
    const word = document.getElementById('vocab-input-word')?.value.trim();
    const phonetic = document.getElementById('vocab-input-phonetic')?.value.trim();
    const th = document.getElementById('vocab-input-th')?.value.trim();
    const example = document.getElementById('vocab-input-example')?.value.trim();

    if (!word || !th) {
      modalController.showToast('กรุณากรอกคำศัพท์ภาษาอังกฤษและความหมายภาษาไทย', 'warning');
      return;
    }

    await dbService.saveVocabulary({ word, phonetic, th, example });
    modalController.showToast(`เพิ่มคำว่า "${word}" ลงคลังคำศัพท์แล้ว`, 'success');
    
    // Clear form & close
    document.getElementById('vocab-input-word').value = '';
    document.getElementById('vocab-input-phonetic').value = '';
    document.getElementById('vocab-input-th').value = '';
    document.getElementById('vocab-input-example').value = '';
    if (addVocabModal) addVocabModal.classList.remove('active');

    // Refresh if in word bank view
    uiController.renderWordBank();
  });

  // Custom Scenario Builder Modal (Teacher / Parent Mode)
  document.getElementById('btn-open-custom-scenario')?.addEventListener('click', () => {
    modalController.openCustomScenarioModal();
  });

  document.getElementById('btn-close-custom-scenario-modal')?.addEventListener('click', () => {
    modalController.closeCustomScenarioModal();
  });

  document.getElementById('btn-cancel-custom-scenario')?.addEventListener('click', () => {
    modalController.closeCustomScenarioModal();
  });

  document.getElementById('btn-save-custom-scenario')?.addEventListener('click', async () => {
    await modalController.saveCustomScenarioFromForm(() => {
      uiController.renderScenarios();
    });
  });

  // Close modals on clicking overlay background
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
      }
    });
  });
}
