/**
 * Modal & Notification Controller
 * จัดการหน้าต่าง Popups (Firebase Setup, Settings, Add Vocab) และ Toast แจ้งเตือน
 */

import { getFirebaseConfig, saveFirebaseConfig, clearFirebaseConfig, isFirebaseConfigured } from '../config/firebase-config.js';
import { authService } from '../services/auth-service.js';
import { speechService } from '../services/speech-service.js';
import { aiService } from '../services/ai-service.js';

export class ModalController {
  constructor() {
    this.toastContainer = null;
    this.initToasts();
  }

  initToasts() {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    this.toastContainer = container;
  }

  showToast(message, type = 'info', duration = 3500) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'warning') icon = '⚠️';

    toast.innerHTML = `<span>${icon}</span><span style="flex:1;">${message}</span>`;
    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // ===================== FIREBASE SETUP MODAL =====================

  openFirebaseModal() {
    const modal = document.getElementById('firebase-modal');
    if (!modal) return;

    const config = getFirebaseConfig();
    document.getElementById('fb-api-key').value = config.apiKey || '';
    document.getElementById('fb-auth-domain').value = config.authDomain || '';
    document.getElementById('fb-project-id').value = config.projectId || '';
    document.getElementById('fb-storage-bucket').value = config.storageBucket || '';
    document.getElementById('fb-messaging-id').value = config.messagingSenderId || '';
    document.getElementById('fb-app-id').value = config.appId || '';

    modal.classList.add('active');
  }

  closeFirebaseModal() {
    const modal = document.getElementById('firebase-modal');
    if (modal) modal.classList.remove('active');
  }

  saveFirebaseFromForm() {
    const apiKey = document.getElementById('fb-api-key').value.trim();
    const authDomain = document.getElementById('fb-auth-domain').value.trim();
    const projectId = document.getElementById('fb-project-id').value.trim();
    const storageBucket = document.getElementById('fb-storage-bucket').value.trim();
    const messagingSenderId = document.getElementById('fb-messaging-id').value.trim();
    const appId = document.getElementById('fb-app-id').value.trim();

    if (!apiKey || !projectId) {
      this.showToast('กรุณากรอก API Key และ Project ID ให้ครบถ้วน', 'warning');
      return false;
    }

    try {
      saveFirebaseConfig({
        apiKey,
        authDomain,
        projectId,
        storageBucket,
        messagingSenderId,
        appId
      });
      this.showToast('บันทึกการตั้งค่า Firebase สำเร็จแล้ว! กำลังรีโหลด...', 'success');
      this.closeFirebaseModal();
      setTimeout(() => window.location.reload(), 1200);
      return true;
    } catch (e) {
      this.showToast('เกิดข้อผิดพลาด: ' + e.message, 'error');
      return false;
    }
  }

  clearFirebase() {
    if (confirm('คุณต้องการลบการตั้งค่า Firebase ทั้งหมดหรือไม่?')) {
      clearFirebaseConfig();
      this.showToast('ล้างการตั้งค่า Firebase แล้ว', 'info');
      this.closeFirebaseModal();
      setTimeout(() => window.location.reload(), 1000);
    }
  }

  // ===================== SETTINGS MODAL =====================

  openSettingsModal() {
    const modal = document.getElementById('settings-modal');
    if (!modal) return;

    // Accent
    const accentSelect = document.getElementById('setting-accent');
    if (accentSelect) accentSelect.value = speechService.accent;

    // Rate
    const rateRange = document.getElementById('setting-rate');
    const rateVal = document.getElementById('setting-rate-val');
    if (rateRange) {
      rateRange.value = speechService.speechRate;
      if (rateVal) rateVal.textContent = speechService.speechRate + 'x';
    }

    // Gemini API Key
    const geminiInput = document.getElementById('setting-gemini-key');
    if (geminiInput) geminiInput.value = aiService.getGeminiApiKey();

    modal.classList.add('active');
  }

  closeSettingsModal() {
    const modal = document.getElementById('settings-modal');
    if (modal) modal.classList.remove('active');
  }

  saveSettings() {
    const accent = document.getElementById('setting-accent')?.value;
    const rate = parseFloat(document.getElementById('setting-rate')?.value || 1.0);
    const geminiKey = document.getElementById('setting-gemini-key')?.value;

    if (accent) speechService.setAccent(accent);
    if (rate) speechService.setRate(rate);
    aiService.setGeminiApiKey(geminiKey);

    this.showToast('บันทึกการตั้งค่าเสียงและระบบเรียบร้อย', 'success');
    this.closeSettingsModal();
  }

  // ===================== USER PROFILE MODAL =====================

  openProfileModal() {
    const modal = document.getElementById('profile-modal');
    if (!modal) return;

    const user = authService.getCurrentUser();
    const nameEl = document.getElementById('modal-profile-name');
    const emailEl = document.getElementById('modal-profile-email');
    const avatarEl = document.getElementById('modal-profile-avatar');
    const googleBtn = document.getElementById('btn-modal-google-login');
    const logoutBtn = document.getElementById('btn-modal-logout');
    const fbWarning = document.getElementById('modal-profile-fb-notice');

    if (user) {
      if (nameEl) nameEl.textContent = user.displayName;
      if (emailEl) emailEl.textContent = user.isGuest ? 'Guest Mode (Offline/Local)' : user.email;
      if (avatarEl) avatarEl.src = user.photoURL;

      if (user.isGuest) {
        if (googleBtn) googleBtn.style.display = 'inline-flex';
        if (logoutBtn) logoutBtn.style.display = 'none';
      } else {
        if (googleBtn) googleBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'inline-flex';
      }
    }

    if (fbWarning) {
      fbWarning.style.display = isFirebaseConfigured() ? 'none' : 'block';
    }

    modal.classList.add('active');
  }

  closeProfileModal() {
    const modal = document.getElementById('profile-modal');
    if (modal) modal.classList.remove('active');
  }

  // ===================== CUSTOM SCENARIO BUILDER MODAL =====================

  openCustomScenarioModal() {
    const modal = document.getElementById('custom-scenario-modal');
    if (!modal) {
      console.error('Modal #custom-scenario-modal not found');
      return;
    }

    // Reset fields safely
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    };
    setVal('custom-title', '');
    setVal('custom-title-th', '');
    setVal('custom-partner-name', '');
    setVal('custom-partner-role', '');
    setVal('custom-description', '');
    setVal('custom-initial-msg', '');
    setVal('custom-initial-msg-th', '');
    setVal('custom-prompts', '');

    // Emoji picker setup
    const pills = document.querySelectorAll('#custom-emoji-picker .emoji-pill');
    pills.forEach(p => {
      p.onclick = () => {
        pills.forEach(el => el.classList.remove('selected'));
        p.classList.add('selected');
      };
    });

    modal.classList.add('active');
  }

  closeCustomScenarioModal() {
    const modal = document.getElementById('custom-scenario-modal');
    if (modal) modal.classList.remove('active');
  }

  async saveCustomScenarioFromForm(onSuccess) {
    const title = document.getElementById('custom-title')?.value.trim();
    const titleTh = document.getElementById('custom-title-th')?.value.trim();
    const level = document.getElementById('custom-level')?.value || 'ประถม 1 - 3';
    const partnerName = document.getElementById('custom-partner-name')?.value.trim();
    const partnerRole = document.getElementById('custom-partner-role')?.value.trim();
    const description = document.getElementById('custom-description')?.value.trim() || title;
    const initialMessage = document.getElementById('custom-initial-msg')?.value.trim();
    const initialMessageTh = document.getElementById('custom-initial-msg-th')?.value.trim();
    const promptsRaw = document.getElementById('custom-prompts')?.value.trim();

    const selectedEmojiEl = document.querySelector('#custom-emoji-picker .emoji-pill.selected');
    const icon = selectedEmojiEl ? selectedEmojiEl.getAttribute('data-emoji') : '🐻';

    if (!title || !titleTh || !partnerName || !partnerRole || !initialMessage || !initialMessageTh) {
      this.showToast('กรุณากรอกข้อมูลด่านให้ครบถ้วน (ชื่อด่าน, ตัวละคร, และประโยคทักทาย)', 'warning');
      return false;
    }

    const suggestedPrompts = promptsRaw
      ? promptsRaw.split('\n').map(p => p.trim()).filter(p => p.length > 0)
      : ["Hello!", "Nice to meet you!"];

    const scenarioData = {
      title,
      titleTh,
      level,
      category: 'Custom By Teacher',
      icon,
      partnerAvatar: icon,
      partnerName,
      partnerRole,
      description,
      descriptionTh: description,
      initialMessage,
      initialMessageTh,
      learningGoals: [title, `Talk with ${partnerName}`],
      suggestedPrompts,
      vocabularyList: []
    };

    try {
      const { dbService } = await import('../services/db-service.js');
      await dbService.saveCustomScenario(scenarioData);
      this.showToast('🎉 บันทึกด่านใหม่ขึ้น Cloud สำเร็จแล้ว! พร้อมให้เด็กๆ ฝึกพูดทันที', 'success');
      this.closeCustomScenarioModal();
      if (onSuccess) onSuccess();
      return true;
    } catch (err) {
      this.showToast('เกิดข้อผิดพลาดในการบันทึก: ' + err.message, 'error');
      return false;
    }
  }

  // ===================== ROLE SELECTION MODAL =====================

  openRoleSelectionModal(scenario, onRoleSelected) {
    const modal = document.getElementById('role-selection-modal');
    if (!modal) return;

    const btnCustomer = document.getElementById('btn-select-customer');
    const btnShopkeeper = document.getElementById('btn-select-shopkeeper');
    const closeBtn = document.getElementById('btn-close-role-modal');

    const handleSelect = (role) => {
      this.closeRoleSelectionModal();
      if (onRoleSelected) onRoleSelected(role);
    };

    if (btnCustomer) {
      btnCustomer.onclick = () => handleSelect('Customer');
    }
    if (btnShopkeeper) {
      btnShopkeeper.onclick = () => handleSelect('Shopkeeper');
    }
    if (closeBtn) {
      closeBtn.onclick = () => this.closeRoleSelectionModal();
    }

    modal.classList.add('active');
  }

  closeRoleSelectionModal() {
    const modal = document.getElementById('role-selection-modal');
    if (modal) modal.classList.remove('active');
  }
}

export const modalController = new ModalController();
