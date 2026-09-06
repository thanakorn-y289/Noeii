/**
 * Modal & Notification Controller
 * จัดการหน้าต่าง Popups (Firebase Setup, Settings, Profile, Role Selection, และ Custom Scenario Builder)
 */

import { getFirebaseConfig, saveFirebaseConfig, clearFirebaseConfig, isFirebaseConfigured } from '../config/firebase-config.js';
import { authService } from '../services/auth-service.js';
import { speechService } from '../services/speech-service.js';
import { aiService } from '../services/ai-service.js';

const CHAR_AVATARS = ['🧑‍🍳', '👦', '👧', '👩‍🏫', '👨‍🚀', '🐻', '🐱', '🐶', '🤖', '🦄', '🦊', '🦁'];

export class ModalController {
  constructor() {
    this.toastContainer = null;
    this.scenarioCharacters = ['Shopkeeper', 'Customer'];
    this.dialogueLines = [];
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

    // Firebase Indicator in Settings
    this.updateSettingsFirebaseStatus();

    modal.classList.add('active');
  }

  closeSettingsModal() {
    const modal = document.getElementById('settings-modal');
    if (modal) modal.classList.remove('active');
  }

  updateSettingsFirebaseStatus() {
    const badge = document.getElementById('firebase-indicator');
    const textEl = document.getElementById('firebase-status-text');
    if (!badge || !textEl) return;

    if (isFirebaseConfigured()) {
      const user = authService.getCurrentUser();
      if (user && !user.isGuest) {
        badge.className = 'firebase-indicator';
        textEl.textContent = 'Firebase Synced (เชื่อมต่อแล้ว)';
      } else {
        badge.className = 'firebase-indicator warning';
        textEl.textContent = 'Firebase Ready (กด Login Google)';
      }
    } else {
      badge.className = 'firebase-indicator warning';
      textEl.textContent = 'ยังไม่ได้ตั้งค่า Firebase';
    }
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
      if (emailEl) emailEl.textContent = user.isGuest ? 'Guest Mode (ไม่ได้เข้าสู่ระบบ)' : user.email;
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

  openCustomScenarioModal(scenarioToEdit = null) {
    // บังคับให้ Login ด้วย Google Account ก่อนสร้าง/แก้ไขบทสนทนา
    if (!authService.isLoggedInWithGoogle()) {
      this.showToast('⚠️ กรุณาเข้าสู่ระบบด้วย Google Account ก่อนจัดการบทสนทนา เพื่อบันทึกและซิงค์ข้อมูลของคุณขึ้น Cloud', 'warning', 4500);
      this.openProfileModal();
      return;
    }

    const modal = document.getElementById('custom-scenario-modal');
    if (!modal) return;

    this.editingScenarioId = scenarioToEdit ? scenarioToEdit.id : null;

    // Update Modal Title and Save Button Text
    const headerTitle = modal.querySelector('.modal-header h3');
    const saveBtn = document.getElementById('btn-save-custom-scenario');
    if (headerTitle) {
      headerTitle.textContent = scenarioToEdit ? '✏️ แก้ไขบทสนทนา (Edit Scenario)' : '🎨 สร้างบทสนทนาใหม่ (Custom Scenario Builder)';
    }
    if (saveBtn) {
      saveBtn.textContent = scenarioToEdit ? '💾 บันทึกการแก้ไขบทสนทนา' : '💾 บันทึกบทสนทนาขึ้น Cloud';
    }

    // Populate Form fields
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    };
    setVal('custom-title', scenarioToEdit ? (scenarioToEdit.title || '') : '');
    setVal('custom-title-th', scenarioToEdit ? (scenarioToEdit.titleTh || '') : '');
    setVal('custom-description', scenarioToEdit ? (scenarioToEdit.description || '') : '');
    setVal('custom-level', scenarioToEdit ? (scenarioToEdit.level || 'ประถม 1 - 3') : 'ประถม 1 - 3');
    setVal('custom-new-char-input', '');

    // Reset / Select Emoji Picker
    const targetEmoji = scenarioToEdit ? (scenarioToEdit.icon || '🐻') : '🐻';
    const pills = document.querySelectorAll('#custom-emoji-picker .emoji-pill');
    let emojiMatched = false;
    pills.forEach((p) => {
      const emoji = p.getAttribute('data-emoji');
      const isMatch = emoji === targetEmoji;
      if (isMatch) emojiMatched = true;
      p.classList.toggle('selected', isMatch);
      p.onclick = () => {
        pills.forEach(el => el.classList.remove('selected'));
        p.classList.add('selected');
      };
    });
    if (!emojiMatched && pills.length > 0) {
      pills[0].classList.add('selected');
    }

    // Initialize Characters
    if (scenarioToEdit && scenarioToEdit.characters && scenarioToEdit.characters.length >= 2) {
      this.scenarioCharacters = [...scenarioToEdit.characters];
    } else if (scenarioToEdit && scenarioToEdit.script && scenarioToEdit.script.length > 0) {
      const speakers = [...new Set(scenarioToEdit.script.map(s => s.speaker))];
      this.scenarioCharacters = speakers.length >= 2 ? speakers : [...speakers, 'Customer'];
    } else if (scenarioToEdit) {
      this.scenarioCharacters = [scenarioToEdit.partnerName || 'Shopkeeper', 'Customer'];
    } else {
      this.scenarioCharacters = ['Shopkeeper', 'Customer'];
    }
    this.renderCharactersList();

    // Initialize Dialogue Lines
    if (scenarioToEdit && scenarioToEdit.script && scenarioToEdit.script.length > 0) {
      this.dialogueLines = scenarioToEdit.script.map((s, idx) => ({
        id: 'line_' + Date.now() + '_' + idx,
        speaker: s.speaker,
        text: s.text,
        textTh: s.textTh || ''
      }));
    } else if (scenarioToEdit) {
      this.dialogueLines = [
        {
          id: 'line_' + Date.now() + '_1',
          speaker: this.scenarioCharacters[0],
          text: scenarioToEdit.initialMessage || 'Good afternoon! Can I help you?',
          textTh: scenarioToEdit.initialMessageTh || 'สวัสดีครับ! มีอะไรให้ผมช่วยไหมครับ?'
        },
        {
          id: 'line_' + Date.now() + '_2',
          speaker: this.scenarioCharacters[1] || 'Customer',
          text: scenarioToEdit.suggestedPrompts?.[0] || 'Yes, I want to buy a carton of milk.',
          textTh: 'ครับ ผมอยากซื้อนมหนึ่งกล่องครับ'
        }
      ];
    } else {
      this.dialogueLines = [
        {
          id: 'line_' + Date.now() + '_1',
          speaker: 'Shopkeeper',
          text: 'Hello! How are you today?',
          textTh: 'สวัสดีครับ! วันนี้เป็นอย่างไรบ้างครับ?'
        },
        {
          id: 'line_' + Date.now() + '_2',
          speaker: 'Customer',
          text: 'I am doing great, thank you!',
          textTh: 'สบายดีมาก ขอบคุณครับ!'
        }
      ];
    }
    this.renderDialogueLines();

    // Hook sub-actions
    this.wireScenarioBuilderEvents();

    modal.classList.add('active');
  }

  closeCustomScenarioModal() {
    this.editingScenarioId = null;
    const modal = document.getElementById('custom-scenario-modal');
    if (modal) modal.classList.remove('active');
  }

  wireScenarioBuilderEvents() {
    // Add character button
    const btnAddChar = document.getElementById('btn-add-character');
    const inputChar = document.getElementById('custom-new-char-input');
    if (btnAddChar && inputChar) {
      btnAddChar.onclick = () => {
        const name = inputChar.value.trim();
        if (name) {
          this.addCharacter(name);
          inputChar.value = '';
        }
      };
      inputChar.onkeydown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const name = inputChar.value.trim();
          if (name) {
            this.addCharacter(name);
            inputChar.value = '';
          }
        }
      };
    }

    // Add dialogue line button
    const btnAddLine = document.getElementById('btn-add-dialogue-line');
    if (btnAddLine) {
      btnAddLine.onclick = () => {
        this.syncDialogueLinesFromDOM();
        this.addDialogueLine();
      };
    }

    // AI translate all button
    const btnTranslateAll = document.getElementById('btn-ai-translate-all');
    if (btnTranslateAll) {
      btnTranslateAll.onclick = () => this.translateAllLines();
    }

    // Load example script button
    const btnLoadExample = document.getElementById('btn-load-script-example');
    if (btnLoadExample) {
      btnLoadExample.onclick = () => this.loadExampleScript();
    }
  }

  // --- Characters Manager ---

  renderCharactersList() {
    const container = document.getElementById('custom-characters-list');
    if (!container) return;

    container.innerHTML = this.scenarioCharacters.map((char, index) => {
      const avatar = CHAR_AVATARS[index % CHAR_AVATARS.length];
      const canDelete = this.scenarioCharacters.length > 2;
      return `
        <div class="character-pill" data-name="${this.escapeHtml(char)}">
          <span>${avatar}</span>
          <span>${this.escapeHtml(char)}</span>
          ${canDelete ? `<button type="button" class="btn-del-char" data-name="${this.escapeHtml(char)}" title="ลบตัวละครนี้">&times;</button>` : ''}
        </div>
      `;
    }).join('');

    container.querySelectorAll('.btn-del-char').forEach(btn => {
      btn.onclick = () => {
        const name = btn.getAttribute('data-name');
        this.removeCharacter(name);
      };
    });
  }

  addCharacter(name) {
    if (this.scenarioCharacters.includes(name)) {
      this.showToast(`มีตัวละครชื่อ "${name}" อยู่แล้ว`, 'warning');
      return;
    }
    this.scenarioCharacters.push(name);
    this.renderCharactersList();
    this.updateSpeakerDropdowns();
    this.showToast(`เพิ่มตัวละคร "${name}" สำเร็จ`, 'info', 2000);
  }

  removeCharacter(name) {
    if (this.scenarioCharacters.length <= 2) {
      this.showToast('ต้องมีตัวละครอย่างน้อย 2 ตัวในบทสนทนาครับ', 'warning');
      return;
    }

    this.syncDialogueLinesFromDOM();
    this.scenarioCharacters = this.scenarioCharacters.filter(c => c !== name);

    // Update lines that were using this character to fallback to first character
    this.dialogueLines.forEach(l => {
      if (l.speaker === name) {
        l.speaker = this.scenarioCharacters[0];
      }
    });

    this.renderCharactersList();
    this.renderDialogueLines();
    this.showToast(`ลบตัวละคร "${name}" แล้ว`, 'info', 2000);
  }

  updateSpeakerDropdowns() {
    document.querySelectorAll('.dialogue-speaker-select').forEach(select => {
      const currentVal = select.value;
      select.innerHTML = this.scenarioCharacters.map(c => `
        <option value="${this.escapeHtml(c)}" ${c === currentVal ? 'selected' : ''}>${this.escapeHtml(c)}</option>
      `).join('');
    });
  }

  // --- Dialogue Lines Manager ---

  syncDialogueLinesFromDOM() {
    const cards = document.querySelectorAll('#dialogue-lines-list .dialogue-line-card');
    const updated = [];
    cards.forEach((card, idx) => {
      const speakerSelect = card.querySelector('.dialogue-speaker-select');
      const enInput = card.querySelector('.dialogue-english-input');
      const thInput = card.querySelector('.dialogue-thai-input');

      const existingId = this.dialogueLines[idx]?.id || ('line_' + Date.now() + '_' + idx);
      updated.push({
        id: existingId,
        speaker: speakerSelect ? speakerSelect.value : (this.scenarioCharacters[0] || 'Speaker'),
        text: enInput ? enInput.value.trim() : '',
        textTh: thInput ? thInput.value.trim() : ''
      });
    });
    this.dialogueLines = updated;
  }

  renderDialogueLines() {
    const container = document.getElementById('dialogue-lines-list');
    if (!container) return;

    if (this.dialogueLines.length === 0) {
      this.addDialogueLine();
      return;
    }

    container.innerHTML = this.dialogueLines.map((line, idx) => {
      const speakerOptions = this.scenarioCharacters.map(c => `
        <option value="${this.escapeHtml(c)}" ${c === line.speaker ? 'selected' : ''}>${this.escapeHtml(c)}</option>
      `).join('');

      return `
        <div class="dialogue-line-card" data-index="${idx}">
          <div class="dialogue-line-top">
            <span class="dialogue-line-num">#${idx + 1}</span>
            <select class="dialogue-speaker-select">
              ${speakerOptions}
            </select>
            <input type="text" class="form-control dialogue-english-input" placeholder="ประโยคภาษาอังกฤษที่ตัวละครนี้จะพูด..." value="${this.escapeHtml(line.text)}">
            <button type="button" class="btn-delete-line" title="ลบประโยคนี้">&times;</button>
          </div>
          <div class="dialogue-line-bottom">
            <input type="text" class="form-control dialogue-thai-input" placeholder="คำแปลภาษาไทย..." value="${this.escapeHtml(line.textTh)}">
            <button type="button" class="btn btn-secondary btn-sm btn-line-ai-translate">
              ✨ AI แปลไทย
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Wire line card events
    container.querySelectorAll('.dialogue-line-card').forEach(card => {
      const index = parseInt(card.getAttribute('data-index'), 10);
      const btnDelete = card.querySelector('.btn-delete-line');
      const btnAiTranslate = card.querySelector('.btn-line-ai-translate');
      const enInput = card.querySelector('.dialogue-english-input');
      const thInput = card.querySelector('.dialogue-thai-input');

      // Delete line
      if (btnDelete) {
        btnDelete.onclick = () => {
          if (this.dialogueLines.length <= 1) {
            this.showToast('ต้องมีบทสนทนาอย่างน้อย 1 ประโยคครับ', 'warning');
            return;
          }
          this.syncDialogueLinesFromDOM();
          this.dialogueLines.splice(index, 1);
          this.renderDialogueLines();
        };
      }

      // Single line AI translate
      if (btnAiTranslate && enInput && thInput) {
        btnAiTranslate.onclick = async () => {
          const enText = enInput.value.trim();
          if (!enText) {
            this.showToast('กรุณาพิมพ์ประโยคภาษาอังกฤษก่อนให้ AI แปลครับ', 'warning');
            return;
          }
          btnAiTranslate.disabled = true;
          btnAiTranslate.textContent = '⏳ กำลังแปล...';
          try {
            const translated = await aiService.translateToThai(enText);
            thInput.value = translated;
            if (this.dialogueLines[index]) {
              this.dialogueLines[index].textTh = translated;
            }
            this.showToast('แปลภาษาไทยสำเร็จ! ✨', 'success', 2000);
          } catch (e) {
            this.showToast('ไม่สามารถแปลได้: ' + e.message, 'error');
          } finally {
            btnAiTranslate.disabled = false;
            btnAiTranslate.textContent = '✨ AI แปลไทย';
          }
        };
      }
    });
  }

  addDialogueLine(speaker = '', text = '', textTh = '') {
    const nextSpeaker = speaker || 
      this.scenarioCharacters[this.dialogueLines.length % this.scenarioCharacters.length] || 
      this.scenarioCharacters[0] || 
      'Speaker';

    this.dialogueLines.push({
      id: 'line_' + Date.now() + '_' + (this.dialogueLines.length + 1),
      speaker: nextSpeaker,
      text: text,
      textTh: textTh
    });
    this.renderDialogueLines();

    // Scroll last line into view
    setTimeout(() => {
      const container = document.getElementById('dialogue-lines-list');
      if (container && container.lastElementChild) {
        container.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  }

  async translateAllLines() {
    this.syncDialogueLinesFromDOM();
    const btn = document.getElementById('btn-ai-translate-all');
    if (btn) {
      btn.disabled = true;
      btn.textContent = '⏳ AI กำลังแปลทุกประโยค...';
    }

    let translatedCount = 0;
    try {
      for (let i = 0; i < this.dialogueLines.length; i++) {
        const item = this.dialogueLines[i];
        if (item.text && !item.textTh) {
          const th = await aiService.translateToThai(item.text);
          item.textTh = th;
          translatedCount++;
        }
      }
      this.renderDialogueLines();
      if (translatedCount > 0) {
        this.showToast(`✨ AI แปลภาษาไทยให้แล้ว ${translatedCount} ประโยค`, 'success');
      } else {
        this.showToast('ทุกประโยคมีคำแปลภาษาไทยเรียบร้อยแล้ว', 'info');
      }
    } catch (e) {
      this.showToast('เกิดข้อผิดพลาดในการแปล: ' + e.message, 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = '✨ AI ช่วยแปลไทยทั้งหมด';
      }
    }
  }

  loadExampleScript() {
    this.scenarioCharacters = ['Teacher', 'Lilly', 'Leo'];
    this.renderCharactersList();

    const titleEl = document.getElementById('custom-title');
    const titleThEl = document.getElementById('custom-title-th');
    const descEl = document.getElementById('custom-description');
    if (titleEl) titleEl.value = 'Favorite Animals in Class';
    if (titleThEl) titleThEl.value = 'สัตว์ตัวโปรดในห้องเรียน 🐾';
    if (descEl) descEl.value = 'คุณครูและเพื่อนๆ พูดคุยเกี่ยวกับสัตว์ที่ชอบ';

    this.dialogueLines = [
      {
        id: 'line_ex_1',
        speaker: 'Teacher',
        text: 'Good morning class! What is your favorite animal?',
        textTh: 'สวัสดีตอนเช้าจ้าทุกคน! สัตว์ตัวโปรดของแต่ละคนคืออะไรเอ่ย?'
      },
      {
        id: 'line_ex_2',
        speaker: 'Lilly',
        text: 'Good morning teacher! My favorite animal is a fluffy rabbit!',
        textTh: 'สวัสดีค่ะคุณครู! สัตว์ตัวโปรดของหนูคือน้องกระต่ายขนนุ่มฟูค่ะ!'
      },
      {
        id: 'line_ex_3',
        speaker: 'Leo',
        text: 'I love dolphins! They are super smart and can swim very fast!',
        textTh: 'ผมชอบปลาโลมาครับ! มันฉลาดมากๆ และว่ายน้ำได้เร็วสุดๆ เลย!'
      },
      {
        id: 'line_ex_4',
        speaker: 'Teacher',
        text: 'That sounds amazing! Let us read a wonderful storybook together!',
        textTh: 'ยอดเยี่ยมไปเลยจ้า! มาเปิดอ่านหนังสือนิทานสัตว์ด้วยกันเถอะ!'
      }
    ];

    this.renderDialogueLines();
    this.showToast('โหลดตัวอย่างบทสนทนา 3 ตัวละครสำเร็จ! 🎨', 'success');
  }

  async saveCustomScenarioFromForm(onSuccess) {
    this.syncDialogueLinesFromDOM();

    const title = document.getElementById('custom-title')?.value.trim();
    const titleTh = document.getElementById('custom-title-th')?.value.trim();
    const level = document.getElementById('custom-level')?.value || 'ประถม 1 - 3';
    const description = document.getElementById('custom-description')?.value.trim() || title;

    const selectedEmojiEl = document.querySelector('#custom-emoji-picker .emoji-pill.selected');
    const icon = selectedEmojiEl ? selectedEmojiEl.getAttribute('data-emoji') : '🐻';

    if (!title || !titleTh) {
      this.showToast('กรุณากรอกชื่อด่านภาษาอังกฤษและภาษาไทยให้ครบถ้วน', 'warning');
      return false;
    }

    if (this.scenarioCharacters.length < 2) {
      this.showToast('ต้องมีตัวละครอย่างน้อย 2 ตัว', 'warning');
      return false;
    }

    const validLines = this.dialogueLines.filter(l => l.text.trim().length > 0);
    if (validLines.length < 2) {
      this.showToast('กรุณาเพิ่มประโยคบทสนทนาภาษาอังกฤษอย่างน้อย 2 ประโยค', 'warning');
      return false;
    }

    // Auto-translate any missing Thai lines before saving
    for (const line of validLines) {
      if (!line.textTh) {
        try {
          line.textTh = await aiService.translateToThai(line.text);
        } catch (e) {
          line.textTh = line.text;
        }
      }
    }

    const script = validLines.map((line) => {
      const charIdx = this.scenarioCharacters.indexOf(line.speaker);
      const avatar = charIdx >= 0 ? CHAR_AVATARS[charIdx % CHAR_AVATARS.length] : '🧑‍🍳';
      return {
        speaker: line.speaker,
        speakerTh: line.speaker,
        avatar: avatar,
        text: line.text,
        textTh: line.textTh
      };
    });

    const scenarioData = {
      title,
      titleTh,
      level,
      category: 'Custom By Teacher',
      icon,
      partnerAvatar: icon,
      partnerName: this.scenarioCharacters[0],
      partnerRole: this.scenarioCharacters[0],
      description,
      descriptionTh: description,
      characters: [...this.scenarioCharacters],
      script: script,
      initialMessage: script[0]?.text || 'Hello!',
      initialMessageTh: script[0]?.textTh || 'สวัสดีครับ!',
      learningGoals: [title, ...this.scenarioCharacters.map(c => `Roleplay as ${c}`)],
      suggestedPrompts: script.map(s => s.text).slice(0, 4),
      vocabularyList: []
    };

    if (this.editingScenarioId) {
      scenarioData.id = this.editingScenarioId;
    }

    try {
      const { dbService } = await import('../services/db-service.js');
      await dbService.saveScenario(scenarioData);
      this.showToast(this.editingScenarioId ? '🎉 บันทึกการแก้ไขบทสนทนาเรียบร้อยแล้ว!' : '🎉 บันทึกบทสนทนาใหม่ขึ้น Cloud สำเร็จแล้ว! พร้อมให้ฝึกพูดทันที', 'success');
      this.editingScenarioId = null;
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

    const subtitle = document.getElementById('role-selection-modal-subtitle');
    const grid = document.getElementById('role-selection-grid');
    const closeBtn = document.getElementById('btn-close-role-modal');

    if (subtitle) {
      subtitle.innerHTML = `${scenario.icon || '🏪'} ด่าน: <strong>${this.escapeHtml(scenario.title)}</strong> (${this.escapeHtml(scenario.titleTh || '')})<br>หนูอยากสวมบทบาทเป็นใครในบทสนทนานี้ดีเอ่ย?`;
    }

    // Determine characters in this scenario
    let characters = [];
    if (scenario.characters && scenario.characters.length > 0) {
      characters = scenario.characters;
    } else if (scenario.script && scenario.script.length > 0) {
      characters = [...new Set(scenario.script.map(s => s.speaker))];
    } else {
      characters = [scenario.partnerName || 'Character 1', 'Student'];
    }

    if (grid) {
      grid.innerHTML = characters.map((charName, index) => {
        // Find avatar and thai title from first line matching this speaker
        const firstLine = (scenario.script || []).find(s => s.speaker === charName);
        const avatar = firstLine?.avatar || CHAR_AVATARS[index % CHAR_AVATARS.length];
        const speakerTh = firstLine?.speakerTh || charName;

        return `
          <div class="role-card-select" data-role="${this.escapeHtml(charName)}">
            <div class="role-avatar-big">${avatar}</div>
            <div class="role-name-big">${this.escapeHtml(charName)}</div>
            <div class="role-desc-small">
              สวมบทบาทเป็น ${this.escapeHtml(speakerTh)}<br>
              ฝึกพูดตามบทสนทนาในด่านนี้
            </div>
            <button type="button" class="btn btn-primary btn-sm" style="margin-top: 0.85rem; width: 100%;">
              เล่นเป็น ${this.escapeHtml(charName)} 🎭
            </button>
          </div>
        `;
      }).join('');

      // Wire card click events
      grid.querySelectorAll('.role-card-select').forEach(card => {
        card.onclick = () => {
          const role = card.getAttribute('data-role');
          this.closeRoleSelectionModal();
          if (onRoleSelected) onRoleSelected(role);
        };
      });
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

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

export const modalController = new ModalController();
