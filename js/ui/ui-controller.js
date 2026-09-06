/**
 * UI Controller
 * ควบคุมการแสดงผลหน้าจอ สลับวิว และจัดการการสนทนาโต้ตอบ
 */

import { SCENARIOS } from '../data/scenarios.js';
import { speechService } from '../services/speech-service.js';
import { aiService } from '../services/ai-service.js';
import { dbService } from '../services/db-service.js';
import { authService } from '../services/auth-service.js';
import { modalController } from './modal-controller.js';
import { isFirebaseConfigured } from '../config/firebase-config.js';

export class UIController {
  constructor() {
    this.currentView = 'scenarios';
    this.activeScenario = null;
    this.messageHistory = [];
    this.sessionStartTime = null;
    this.filterLevel = 'all';
    this.searchQuery = '';
  }

  init() {
    this.setupViewNavigation();
    this.setupSpeechEvents();
    this.renderScenarios();
    this.updateFirebaseBadge();
    this.setupHeaderActions();
  }

  // ===================== NAVIGATION & VIEWS =====================

  setupViewNavigation() {
    const navTabs = document.querySelectorAll('.nav-tab');
    navTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const view = tab.getAttribute('data-view');
        this.switchView(view);
      });
    });

    // Brand click back to scenarios
    document.getElementById('brand-btn')?.addEventListener('click', () => {
      this.switchView('scenarios');
    });
  }

  switchView(viewName) {
    if (this.currentView === 'chat' && viewName !== 'chat' && this.messageHistory.length > 1) {
      // Prompt before leaving active chat
      if (!confirm('คุณต้องการออกจากการสนทนาปัจจุบันหรือไม่?')) {
        return;
      }
      this.finishSession(false);
    }

    this.currentView = viewName;
    document.body.classList.toggle('in-chat-view', viewName === 'chat');

    if (viewName !== 'chat') {
      const catalogBar = document.getElementById('chat-catalog-bar');
      if (catalogBar) catalogBar.style.display = 'none';
    }

    // Update active tab styles
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.toggle('active', tab.getAttribute('data-view') === viewName);
    });

    // Hide all views, show active
    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.remove('active');
    });

    const activeEl = document.getElementById(`view-${viewName}`);
    if (activeEl) activeEl.classList.add('active');

    // View specific hooks
    if (viewName === 'scenarios') {
      this.renderScenarios();
    }
  }

  // ===================== HEADER & AUTH UI =====================

  setupHeaderActions() {
    // User profile click
    document.getElementById('user-profile-badge')?.addEventListener('click', () => {
      modalController.openProfileModal();
    });

    // Firebase indicator click
    document.getElementById('firebase-indicator')?.addEventListener('click', () => {
      modalController.openFirebaseModal();
    });

    // Firebase config button in Settings
    document.getElementById('btn-open-firebase-config')?.addEventListener('click', () => {
      modalController.closeSettingsModal();
      modalController.openFirebaseModal();
    });

    // Settings icon click
    document.getElementById('btn-header-settings')?.addEventListener('click', () => {
      modalController.openSettingsModal();
    });

    // Auth state changed listener
    authService.onAuthStateChanged((user) => {
      this.updateUserUI(user);
    });
  }

  updateUserUI(user) {
    const avatarEl = document.getElementById('header-user-avatar');
    const nameEl = document.getElementById('header-user-name');
    if (user) {
      if (avatarEl) avatarEl.src = user.photoURL;
      if (nameEl) nameEl.textContent = user.displayName;
    }
    this.updateFirebaseBadge();
  }

  updateFirebaseBadge() {
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

  // ===================== SCENARIOS LIST (KIDS & CUSTOM) =====================

  async renderScenarios() {
    const container = document.getElementById('scenarios-container');
    if (!container) return;

    // Load all active scenarios (built-ins + custom - deleted)
    this.allScenarios = await dbService.getAllScenarios();

    // Check if any default scenarios were deleted to toggle the restore button
    const hasDeleted = await dbService.hasDeletedScenarios();
    const restoreBtn = document.getElementById('btn-restore-defaults');
    if (restoreBtn) {
      restoreBtn.style.display = hasDeleted ? 'inline-flex' : 'none';
      restoreBtn.onclick = async () => {
        if (confirm('คุณต้องการคืนค่าบทสนทนาเริ่มต้นทั้งหมดหรือไม่?')) {
          await dbService.restoreDefaultScenarios();
          modalController.showToast('คืนค่าบทสนทนาเริ่มต้นทั้งหมดเรียบร้อยแล้ว 🌈', 'success');
          this.renderScenarios();
        }
      };
    }

    const filtered = this.allScenarios.filter(s => {
      let matchLevel = true;
      if (this.filterLevel === 'p1-p3') {
        matchLevel = (s.level || '').includes('1 - 3') || (s.level || '').includes('เริ่มต้น');
      } else if (this.filterLevel === 'p4-p6') {
        matchLevel = (s.level || '').includes('4 - 6') || (s.level || '').includes('ปานกลาง');
      } else if (this.filterLevel === 'custom') {
        matchLevel = Boolean(s.isCustom);
      }

      const matchSearch = !this.searchQuery || 
        s.title.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
        (s.titleTh && s.titleTh.includes(this.searchQuery)) ||
        (s.category && s.category.toLowerCase().includes(this.searchQuery.toLowerCase()));

      return matchLevel && matchSearch;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: #ffffff; border-radius: var(--radius-lg); border: 2px dashed #cbd5e1;">
          <div style="font-size: 3rem; margin-bottom: 0.75rem;">🎨</div>
          <h3>ยังไม่มีบทสนทนาในหมวดนี้</h3>
          <p style="color: var(--text-muted); font-size: 0.95rem;">คุณครูหรือผู้ปกครองสามารถกดปุ่ม "สร้างบทสนทนาใหม่" ด้านบนเพื่อเพิ่มด่านได้เลยจ้า</p>
          ${hasDeleted ? `
            <div style="margin-top: 1.25rem;">
              <button class="btn btn-secondary btn-sm" id="btn-empty-restore-defaults">
                🔄 คืนค่าบทสนทนาเริ่มต้นทั้งหมด
              </button>
            </div>
          ` : ''}
        </div>
      `;

      const emptyRestoreBtn = document.getElementById('btn-empty-restore-defaults');
      if (emptyRestoreBtn) {
        emptyRestoreBtn.onclick = async () => {
          await dbService.restoreDefaultScenarios();
          modalController.showToast('คืนค่าบทสนทนาเริ่มต้นทั้งหมดเรียบร้อยแล้ว 🌈', 'success');
          this.renderScenarios();
        };
      }
      return;
    }

    container.innerHTML = filtered.map(s => {
      const isP1 = (s.level || '').includes('1 - 3');
      const levelClass = isP1 ? 'p1-p3' : 'p4-p6';
      return `
        <div class="scenario-card ${s.isCustom ? 'custom-scenario' : ''}" data-id="${s.id}">
          <div class="scenario-header">
            <div class="scenario-icon">${s.icon || '🐻'}</div>
            <div class="scenario-badges">
              <span class="badge-level ${levelClass}">${s.level || 'ประถม'}</span>
              ${s.isCustom ? '<span class="badge-custom-tag">โดยคุณครู 🎨</span>' : ''}
            </div>
          </div>
          <h3 class="scenario-title">${this.escapeHtml(s.title)}</h3>
          <p class="scenario-title-th">${this.escapeHtml(s.titleTh || '')}</p>
          <p class="scenario-description">${this.escapeHtml(s.description || '')}</p>
          <div class="scenario-footer">
            <div class="scenario-partner">
              <span class="scenario-partner-avatar">${s.partnerAvatar || '🐻'}</span>
              <span><strong>${this.escapeHtml(s.partnerName)}</strong> (${this.escapeHtml(s.partnerRole)})</span>
            </div>
            <div class="scenario-actions-group">
              <button class="btn btn-primary btn-sm btn-start-scenario" data-id="${s.id}" title="เริ่มเล่นบทสนทนานี้">
                เริ่มเล่น 🎙️
              </button>
              <button class="btn btn-secondary btn-sm btn-edit-scenario" data-id="${s.id}" title="แก้ไขบทสนทนานี้">
                ✏️ แก้ไข
              </button>
              <button class="btn btn-secondary btn-sm btn-del-scenario" data-id="${s.id}" title="ลบบทสนทนานี้">
                🗑️
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach click events
    container.querySelectorAll('.scenario-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.btn-edit-scenario') || e.target.closest('.btn-del-scenario')) return;
        const id = card.getAttribute('data-id');
        this.startScenario(id);
      });
    });

    // Edit scenario (both default and custom)
    container.querySelectorAll('.btn-edit-scenario').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const scenario = this.allScenarios.find(s => s.id === id);
        if (scenario) {
          modalController.openCustomScenarioModal(scenario);
        }
      });
    });

    // Delete scenario (both default and custom)
    container.querySelectorAll('.btn-del-scenario').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const scenario = this.allScenarios.find(s => s.id === id);
        const name = scenario ? scenario.title : 'บทสนทนานี้';
        if (confirm(`คุณต้องการลบบทสนทนา "${name}" ออกจากระบบหรือไม่?`)) {
          await dbService.deleteScenario(id);
          modalController.showToast(`ลบบทสนทนา "${name}" เรียบร้อยแล้ว 🗑️`, 'info');
          this.renderScenarios();
        }
      });
    });

    this.setupFilterButtons();
  }

  setupFilterButtons() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
      btn.onclick = () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.filterLevel = btn.getAttribute('data-level');
        this.renderScenarios();
      };
    });

    const searchInput = document.getElementById('search-scenarios-input');
    if (searchInput) {
      searchInput.oninput = (e) => {
        this.searchQuery = e.target.value.trim();
        this.renderScenarios();
      };
    }
  }

  // ===================== CHAT PRACTICE ROOM =====================

  startScenario(scenarioId) {
    const scenario = (this.allScenarios || SCENARIOS).find(s => s.id === scenarioId) || SCENARIOS[0];
    if (!scenario) return;

    // ถ้าเป็นบทสนทนาที่มี Script ลำดับบทพูด ให้เปิดหน้าต่างเลือกบทบาทก่อน
    if (scenario.script && scenario.script.length > 0) {
      modalController.openRoleSelectionModal(scenario, (options) => {
        const userRole = typeof options === 'string' ? options : (options?.role || 'Customer');
        const accuracyThreshold = typeof options === 'object' && options?.accuracyThreshold ? options.accuracyThreshold : 100;
        const hidePromptText = typeof options === 'object' && options?.hidePromptText !== undefined ? options.hidePromptText : false;
        this.startScriptedScenario(scenario, userRole, { accuracyThreshold, hidePromptText });
      });
      return;
    }

    // กรณีบทสนทนาแบบอิสระ (Custom Scenario ทั่วไป)
    this.startFreeScenario(scenario);
  }

  startScriptedScenario(scenario, userRole = 'Customer', preferences = {}) {
    this.activeScenario = scenario;
    this.userRole = userRole;
    this.currentScript = scenario.script || [];
    this.currentScriptIndex = 0;
    this.messageHistory = [];
    this.sessionStartTime = new Date();

    // Accuracy Threshold (50% - 100%) and Prompt Visibility preferences
    this.accuracyThreshold = preferences.accuracyThreshold || 100;
    this.hidePromptText = Boolean(preferences.hidePromptText);

    const myFirstLine = this.currentScript.find(s => s.speaker === userRole);
    this.userAvatar = myFirstLine?.avatar || '👦';

    const otherFirstLine = this.currentScript.find(s => s.speaker !== userRole);
    this.partnerRole = otherFirstLine ? otherFirstLine.speaker : 'AI Partner';
    this.partnerAvatar = otherFirstLine?.avatar || '🧑‍🍳';

    // Update Chat Header Info
    const avatarEl = document.getElementById('chat-partner-avatar');
    const nameEl = document.getElementById('chat-partner-name');
    const roleEl = document.getElementById('chat-partner-role');
    const myRoleEl = document.getElementById('chat-my-role-badge');
    const titleEl = document.getElementById('chat-scenario-title');

    if (avatarEl) avatarEl.textContent = this.partnerAvatar;
    if (nameEl) nameEl.textContent = this.partnerRole;
    if (roleEl) roleEl.textContent = otherFirstLine?.speakerTh || 'ตัวละคร AI';
    if (myRoleEl) myRoleEl.textContent = `คุณเล่นเป็น: ${userRole} ${this.userAvatar}`;
    if (titleEl) titleEl.textContent = `${scenario.icon || '🏪'} ${scenario.title}`;

    // Hide suggested prompts scroller for scripted mode
    const promptsBar = document.getElementById('suggested-prompts-bar');
    if (promptsBar) promptsBar.style.display = 'none';

    const catalogBar = document.getElementById('chat-catalog-bar');
    if (catalogBar) catalogBar.style.display = 'none';

    // Clear feed
    const messagesFeed = document.getElementById('chat-messages-feed');
    if (messagesFeed) messagesFeed.innerHTML = '';

    // Switch View
    this.switchView('chat');

    // Start running the script
    this.processNextScriptTurn();
  }

  startFreeScenario(scenario) {
    this.currentScript = null;
    this.activeScenario = scenario;
    this.messageHistory = [];
    this.sessionStartTime = new Date();

    const avatarEl = document.getElementById('chat-partner-avatar');
    const nameEl = document.getElementById('chat-partner-name');
    const roleEl = document.getElementById('chat-partner-role');
    const myRoleEl = document.getElementById('chat-my-role-badge');
    const titleEl = document.getElementById('chat-scenario-title');

    if (avatarEl) avatarEl.textContent = scenario.partnerAvatar || '🐻';
    if (nameEl) nameEl.textContent = scenario.partnerName;
    if (roleEl) roleEl.textContent = scenario.partnerRole;
    if (myRoleEl) myRoleEl.textContent = `โหมดคุยอิสระ 💬`;
    if (titleEl) titleEl.textContent = `${scenario.icon || '💬'} ${scenario.title}`;

    const teleprompter = document.getElementById('guided-teleprompter');
    if (teleprompter) teleprompter.style.display = 'none';

    const messagesFeed = document.getElementById('chat-messages-feed');
    if (messagesFeed) messagesFeed.innerHTML = '';

    // Render Price Board / Catalog bar if present
    this.renderCatalogBar(scenario.itemsCatalog);

    this.switchView('chat');

    const initialMsg = {
      id: 'msg_' + Date.now(),
      sender: 'partner',
      speaker: scenario.partnerName,
      avatar: scenario.partnerAvatar || '🐻',
      text: scenario.initialMessage,
      textTh: scenario.initialMessageTh,
      timestamp: new Date()
    };
    this.messageHistory.push(initialMsg);
    this.appendMessageBubble(initialMsg);
    this.renderSuggestedPrompts(scenario.suggestedPrompts);
    speechService.speak(scenario.initialMessage);
  }

  processNextScriptTurn() {
    this.isSubmittingScriptLine = false;
    if (!this.currentScript || this.currentScriptIndex >= this.currentScript.length) {
      this.handleScriptCompleted();
      return;
    }

    const currentLine = this.currentScript[this.currentScriptIndex];
    const isMyTurn = currentLine.speaker === this.userRole;
    this.currentExpectedLine = currentLine;

    const teleprompter = document.getElementById('guided-teleprompter');
    const statusText = document.getElementById('speech-status-indicator');

    if (isMyTurn) {
      // ตาผู้เรียนพูด: แสดง Teleprompter แนะนำคำพูด
      if (teleprompter) {
        teleprompter.style.display = 'flex';
        teleprompter.classList.remove('shake-error');

        // รีเซ็ต feedback ของข้อก่อนหน้า
        const feedbackBox = document.getElementById('teleprompter-feedback');
        if (feedbackBox) feedbackBox.style.display = 'none';

        document.getElementById('teleprompter-step-indicator').textContent = `ประโยคที่ ${this.currentScriptIndex + 1} / ${this.currentScript.length}`;
        document.getElementById('teleprompter-th').textContent = currentLine.textTh;

        // Teleprompter Target Accuracy Badge (ปรับ % ได้แบบ on-the-fly)
        const targetBadge = document.getElementById('teleprompter-target-badge');
        if (targetBadge) {
          targetBadge.textContent = `🎯 เกณฑ์: ${this.accuracyThreshold || 100}%`;
          targetBadge.onclick = () => {
            const input = prompt('ปรับเกณฑ์ % ความถูกต้องของเสียงพูด (50 - 100%):', this.accuracyThreshold || 100);
            if (input !== null) {
              const val = parseInt(input, 10);
              if (!isNaN(val) && val >= 50 && val <= 100) {
                this.accuracyThreshold = val;
                targetBadge.textContent = `🎯 เกณฑ์: ${this.accuracyThreshold}%`;
                modalController.showToast(`ปรับเกณฑ์ความถูกต้องเป็น ${this.accuracyThreshold}% แล้ว 🎯`, 'info', 2500);
              } else {
                modalController.showToast('กรุณาระบุตัวเลขระหว่าง 50 ถึง 100 ครับ', 'warning', 3000);
              }
            }
          };
        }

        // Toggle Hide/Show Prompt Text
        const teleTextEl = document.getElementById('teleprompter-text');
        const btnToggleView = document.getElementById('btn-tele-toggle-view');
        const toggleIcon = document.getElementById('btn-tele-toggle-icon');
        const toggleText = document.getElementById('btn-tele-toggle-text');

        const updateVisibility = () => {
          if (!teleTextEl) return;
          if (this.hidePromptText) {
            teleTextEl.classList.add('prompt-hidden');
            teleTextEl.innerHTML = `<span class="prompt-hidden-overlay">🙈 ซ่อนประโยคไว้เพื่อฝึกจำ (แตะเพื่อดูเฉลย)</span>`;
            if (toggleIcon) toggleIcon.textContent = '👁️';
            if (toggleText) toggleText.textContent = 'แสดงประโยค';
            if (btnToggleView) btnToggleView.title = 'เปิดดูตัวอย่างประโยค';
          } else {
            teleTextEl.classList.remove('prompt-hidden');
            teleTextEl.textContent = `"${currentLine.text}"`;
            if (toggleIcon) toggleIcon.textContent = '🙈';
            if (toggleText) toggleText.textContent = 'ซ่อนประโยค';
            if (btnToggleView) btnToggleView.title = 'ซ่อนประโยคเพื่อฝึกจำ';
          }
        };

        updateVisibility();

        if (btnToggleView) {
          btnToggleView.onclick = () => {
            this.hidePromptText = !this.hidePromptText;
            updateVisibility();
          };
        }

        if (teleTextEl) {
          teleTextEl.onclick = () => {
            if (this.hidePromptText) {
              this.hidePromptText = false;
              updateVisibility();
            }
          };
        }

        const btnListen = document.getElementById('btn-tele-listen');
        if (btnListen) {
          btnListen.onclick = () => speechService.speak(currentLine.text);
        }

        const btnMic = document.getElementById('btn-tele-mic');
        if (btnMic) {
          btnMic.onclick = () => {
            if (!speechService.isListening) {
              speechService.startListening();
            }
          };
        }

        const btnSend = document.getElementById('btn-tele-send');
        if (btnSend) {
          btnSend.onclick = () => {
            const textInput = document.getElementById('chat-input-text');
            const val = textInput ? textInput.value.trim() : '';
            if (!val) {
              modalController.showToast('กรุณากดไมค์อ่านออกเสียง หรือพิมพ์ประโยคก่อนกดส่งตรวจครับ 🎙️', 'warning');
              return;
            }
            this.submitUserScriptLine(val);
          };
        }
      }

      if (statusText) statusText.textContent = 'อ่านออกเสียงประโยคนี้ได้เลยครับ 🎙️';

      const textInput = document.getElementById('chat-input-text');
      if (textInput) {
        textInput.placeholder = this.hidePromptText 
          ? '🙈 ซ่อนประโยคไว้ ลองนึกคำพูดแล้วกดไมค์พูดดูเลย!' 
          : `กดไมค์พูดว่า: "${currentLine.text}"`;
        textInput.value = '';
      }

      // พยายามเปิดไมค์ให้อัตโนมัติ เพื่อให้เด็กๆ อ่านออกเสียงได้ทันที
      setTimeout(() => {
        try {
          if (!speechService.isListening && !speechService.isSpeaking) {
            speechService.startListening();
          }
        } catch (e) {
          console.log('Mic autostart deferred:', e);
        }
      }, 300);
    } else {
      // ตา AI พูด (ตัวละครที่ไม่ใช่ผู้เรียน)
      if (teleprompter) teleprompter.style.display = 'none';
      if (statusText) statusText.textContent = `${currentLine.speaker} กำลังพูด...`;

      const avatarEl = document.getElementById('chat-partner-avatar');
      const nameEl = document.getElementById('chat-partner-name');
      if (avatarEl) avatarEl.textContent = currentLine.avatar || '🧑‍🍳';
      if (nameEl) nameEl.textContent = currentLine.speaker;

      setTimeout(() => {
        const partnerMsg = {
          id: 'msg_' + Date.now(),
          sender: 'partner',
          speaker: currentLine.speaker,
          avatar: currentLine.avatar || '🧑‍🍳',
          text: currentLine.text,
          textTh: currentLine.textTh,
          timestamp: new Date()
        };
        this.messageHistory.push(partnerMsg);
        this.appendMessageBubble(partnerMsg);

        // ออกเสียง AI
        speechService.speak(currentLine.text);

        // เลื่อนไปยังประโยคถัดไป
        this.currentScriptIndex++;

        setTimeout(() => {
          this.processNextScriptTurn();
        }, 1400);
      }, 400);
    }
  }

  /**
   * ตรวจสอบความถูกต้องของเสียงพูดแบบ 100% (Strict Matching)
   */
  verifySpeechAccuracy(spokenText, expectedText) {
    const NUM_MAP = {
      '0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four',
      '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', '10': 'ten'
    };

    const cleanWord = (w) => {
      let cleaned = (w || '').toLowerCase().trim();
      cleaned = cleaned.replace(/[^a-z0-9]/g, '');
      return NUM_MAP[cleaned] || cleaned;
    };

    const tokenize = (text) => {
      if (!text) return [];
      let t = text.toLowerCase();
      // จัดการคำที่มีการแปลงเสียงพูดบ่อยๆ
      t = t.replace(/goodbye/gi, 'good bye');
      t = t.replace(/['’]/g, ''); // Contractions: don't -> dont, I'm -> Im
      const tokens = t.split(/\s+/)
        .map(tok => cleanWord(tok))
        .filter(tok => tok.length > 0);
      return tokens;
    };

    const expectedTokens = tokenize(expectedText);
    const spokenTokens = tokenize(spokenText);

    if (spokenTokens.length === 0) {
      return {
        isMatch: false,
        accuracy: 0,
        spokenText,
        expectedText,
        expectedTokens,
        spokenTokens,
        diffDetails: expectedTokens.map(tok => ({ word: tok, matched: false }))
      };
    }

    // ตรวจสอบความถูกต้องแบบ 100% คำต่อคำ
    const isMatch = (expectedTokens.length === spokenTokens.length) &&
      expectedTokens.every((tok, idx) => tok === spokenTokens[idx]);

    // สร้างรายละเอียดคำศัพท์ที่พูดถูก vs พูดผิด/ขาดไป
    const spokenSet = [...spokenTokens];
    const diffDetails = expectedTokens.map(tok => {
      const foundIdx = spokenSet.indexOf(tok);
      if (foundIdx !== -1) {
        spokenSet.splice(foundIdx, 1);
        return { word: tok, matched: true };
      }
      return { word: tok, matched: false };
    });

    const matchedCount = diffDetails.filter(d => d.matched).length;
    const accuracy = Math.round((matchedCount / Math.max(expectedTokens.length, 1)) * 100);

    return {
      isMatch,
      accuracy,
      spokenText,
      expectedText,
      expectedTokens,
      spokenTokens,
      diffDetails
    };
  }

  async submitUserScriptLine(text) {
    if (!this.activeScenario || !this.currentExpectedLine || this.isSubmittingScriptLine) return;

    const currentLine = this.currentExpectedLine;
    const check = this.verifySpeechAccuracy(text, currentLine.text);
    const targetThreshold = this.accuracyThreshold || 100;
    const isPassed = targetThreshold === 100 ? check.isMatch : (check.accuracy >= targetThreshold);

    const feedbackBox = document.getElementById('teleprompter-feedback');
    const feedbackTitle = document.getElementById('teleprompter-feedback-title');
    const feedbackDesc = document.getElementById('teleprompter-feedback-desc');
    const wordDiffContainer = document.getElementById('teleprompter-word-diff');
    const teleprompter = document.getElementById('guided-teleprompter');
    const statusText = document.getElementById('speech-status-indicator');

    // ❌ หากคะแนนความถูกต้องยังไม่ถึงเกณฑ์ บล็อกไม่ให้ไปต่อ ต้องให้พูดใหม่!
    if (!isPassed) {
      this.isSubmittingScriptLine = false;

      // แสดง Animation สั่นเตือน
      if (teleprompter) {
        teleprompter.classList.remove('shake-error');
        void teleprompter.offsetWidth; // trigger reflow
        teleprompter.classList.add('shake-error');
      }

      // แสดงกล่อง Feedback รายละเอียดคำพูด
      if (feedbackBox) {
        feedbackBox.style.display = 'flex';
        if (feedbackTitle) {
          feedbackTitle.innerHTML = `<span>❌ ความถูกต้องยังไม่ถึงเกณฑ์นะจ๊ะ (ได้ยินว่า: "<em>${this.escapeHtml(text || 'ยังไม่ได้ยินเสียง')}</em>")</span>`;
        }
        if (feedbackDesc) {
          feedbackDesc.innerHTML = `ความถูกต้องอยู่ที่ <strong>${check.accuracy}%</strong> (เกณฑ์ผ่านกำหนดไว้ <strong>${targetThreshold}%</strong>) 👉 ลองฟังเสียงตัวอย่าง 🔊 แล้วกดไมค์พูดใหม่นะจ๊ะ!`;
        }
        if (wordDiffContainer) {
          wordDiffContainer.innerHTML = check.diffDetails.map(d => `
            <span class="word-chip ${d.matched ? 'word-correct' : 'word-missing'}" title="${d.matched ? 'พูดถูกต้องแล้ว' : 'ยังไม่ได้ยินคำนี้'}">
              ${d.matched ? '✓' : '✗'} ${this.escapeHtml(d.word)}
            </span>
          `).join('');
        }
      }

      if (statusText) {
        statusText.textContent = `❌ ทำได้ ${check.accuracy}% (เกณฑ์ ${targetThreshold}%) แตะไมค์เพื่อพูดใหม่ 🎙️`;
      }

      modalController.showToast(`❌ ความถูกต้องยังไม่ถึงเกณฑ์ (ทำได้ ${check.accuracy}% / เกณฑ์ ${targetThreshold}%) ลองพูดใหม่อีกครั้งนะจ๊ะ! 🎙️`, 'warning', 3500);
      return;
    }

    // ✅ เมื่อพูดผ่านเกณฑ์ความถูกต้องที่กำหนด
    this.isSubmittingScriptLine = true;
    speechService.stopListening();

    if (feedbackBox) feedbackBox.style.display = 'none';
    if (teleprompter) {
      teleprompter.classList.remove('shake-error');
      teleprompter.style.display = 'none';
    }

    // ใส่ Bubble ของผู้เรียน
    const userMsg = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      speaker: this.userRole,
      avatar: this.userAvatar || '👦',
      text: currentLine.text,
      timestamp: new Date()
    };
    this.messageHistory.push(userMsg);
    this.appendMessageBubble(userMsg);

    const toastMsg = targetThreshold === 100 
      ? '🎉 เก่งมากคนเก่ง! ออกเสียงถูกต้อง 100% ครบถ้วน!' 
      : `🎉 ผ่านเกณฑ์แล้ว! ความถูกต้อง ${check.accuracy}% (เกณฑ์ ${targetThreshold}%) ยอดเยี่ยมมาก!`;
    modalController.showToast(toastMsg, 'success', 2500);

    // เลื่อนบรรทัดสคริปต์
    this.currentScriptIndex++;

    const textInput = document.getElementById('chat-input-text');
    if (textInput) textInput.value = '';

    setTimeout(() => {
      this.processNextScriptTurn();
    }, 700);
  }

  async handleScriptCompleted() {
    const teleprompter = document.getElementById('guided-teleprompter');
    if (teleprompter) teleprompter.style.display = 'none';

    const statusText = document.getElementById('speech-status-indicator');
    if (statusText) statusText.textContent = '🎉 ผ่านด่านสำเร็จ!';

    modalController.showToast('🎉 ยอดเยี่ยมมากๆ เลย! พูดจบครบทั้งบทสนทนาแล้ว', 'success', 5000);

    const durationSeconds = this.sessionStartTime ? Math.round((new Date() - this.sessionStartTime) / 1000) : 60;
    await dbService.saveConversation({
      scenarioId: this.activeScenario.id,
      scenarioTitle: this.activeScenario.title,
      scenarioTitleTh: this.activeScenario.titleTh,
      turns: this.messageHistory.filter(m => m.sender === 'user').length,
      durationSeconds,
      messagesCount: this.messageHistory.length
    });
  }

  appendMessageBubble(msg) {
    const feed = document.getElementById('chat-messages-feed');
    if (!feed) return;

    const isPartner = msg.sender === 'partner';
    const row = document.createElement('div');
    row.className = `message-row ${isPartner ? 'partner' : 'user'}`;
    row.id = msg.id;

    const speakerName = msg.speaker || (isPartner ? (this.partnerRole || 'AI') : (this.userRole || 'You'));
    const avatar = msg.avatar || (isPartner ? (this.partnerAvatar || this.activeScenario?.partnerAvatar || '🧑‍🍳') : (this.userAvatar || '👦'));

    let partnerActionsHtml = '';
    if (isPartner) {
      partnerActionsHtml = `
        <div class="message-actions">
          <button class="action-chip btn-replay-audio" title="ฟังเสียงอ่าน">
            🔊 ฟังเสียง
          </button>
          <button class="action-chip btn-toggle-translation" title="ดูคำแปลไทย">
            🌐 แปลไทย
          </button>
        </div>
        <div class="translation-box">${msg.textTh || 'ไม่มีคำแปล'}</div>
      `;
    }

    let grammarHtml = '';
    if (!isPartner && msg.grammarFeedback) {
      const fb = msg.grammarFeedback;
      if (fb.status === 'has_suggestion') {
        const item = fb.items[0];
        grammarHtml = `
          <div class="grammar-card suggestion">
            <div class="grammar-card-header">💡 คำแนะนำไวยากรณ์ & สำนวน</div>
            <div class="grammar-diff">
              ${item.better ? `ควรพูดว่า: <span class="grammar-better">${item.better}</span><br>` : ''}
              ${item.explanation}
            </div>
          </div>
        `;
      } else if (fb.status === 'great') {
        grammarHtml = `
          <div class="grammar-card">
            <div class="grammar-card-header">✨ เยี่ยมมาก!</div>
            <div>${fb.items[0].explanation}</div>
          </div>
        `;
      }
    }

    row.innerHTML = `
      <div class="message-avatar">
        ${avatar}
      </div>
      <div class="message-content">
        <div class="message-speaker-label" style="font-size: 0.78rem; font-weight: 800; color: var(--text-muted); margin-bottom: 0.2rem;">
          ${this.escapeHtml(speakerName)}
        </div>
        <div class="bubble">${this.escapeHtml(msg.text)}</div>
        ${partnerActionsHtml}
        ${grammarHtml}
      </div>
    `;

    // Hook buttons
    if (isPartner) {
      row.querySelector('.btn-replay-audio')?.addEventListener('click', () => {
        speechService.speak(msg.text);
      });

      row.querySelector('.btn-toggle-translation')?.addEventListener('click', (e) => {
        const box = row.querySelector('.translation-box');
        box.classList.toggle('show');
        e.currentTarget.classList.toggle('active');
      });
    }

    feed.appendChild(row);
    feed.scrollTop = feed.scrollHeight;
  }

  renderSuggestedPrompts(prompts) {
    const bar = document.getElementById('suggested-prompts-bar');
    if (!bar) return;

    if (!prompts || prompts.length === 0) {
      bar.style.display = 'none';
      return;
    }

    bar.style.display = 'flex';
    bar.innerHTML = prompts.map(p => `
      <button class="prompt-chip" data-prompt="${this.escapeHtml(p)}">
        💬 "${this.escapeHtml(p)}"
      </button>
    `).join('');

    bar.querySelectorAll('.prompt-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const text = chip.getAttribute('data-prompt');
        this.sendUserMessage(text);
      });
    });
  }

  renderCatalogBar(catalog) {
    const bar = document.getElementById('chat-catalog-bar');
    const container = document.getElementById('catalog-scroll-container');
    if (!bar || !container) return;

    if (!catalog || catalog.length === 0) {
      bar.style.display = 'none';
      container.innerHTML = '';
      return;
    }

    bar.style.display = 'flex';
    container.innerHTML = catalog.map(item => {
      const fullName = item.unit ? `a ${item.unit} of ${item.name}` : `a ${item.name}`;
      return `
        <button class="catalog-item-chip" type="button" data-name="${this.escapeHtml(item.name)}" data-unit="${this.escapeHtml(item.unit || '')}" data-price="${item.price}" data-fullname="${this.escapeHtml(fullName)}" title="กดเพื่อใส่ลงในช่องประโยค">
          <span class="item-emoji">${item.emoji || '📦'}</span>
          <span class="item-info">
            <span class="item-name">${this.escapeHtml(fullName)}</span>
            <span class="item-name-th">${this.escapeHtml(item.nameTh || '')}</span>
          </span>
          <span class="price-tag">${item.price} ฿</span>
        </button>
      `;
    }).join('');

    container.querySelectorAll('.catalog-item-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const fullName = chip.getAttribute('data-fullname');
        const textInput = document.getElementById('chat-input-text');
        if (!textInput) return;

        const currentVal = textInput.value.trim();
        if (!currentVal) {
          textInput.value = `I would like to buy ${fullName}, please.`;
        } else if (currentVal.endsWith('.')) {
          textInput.value = currentVal.slice(0, -1) + ` and ${fullName}.`;
        } else {
          textInput.value = currentVal + ` and ${fullName}`;
        }
        textInput.focus();
      });
    });
  }

  // ===================== SPEECH & INPUT HANDLING =====================

  setupSpeechEvents() {
    const micBtn = document.getElementById('btn-mic-toggle');
    const textInput = document.getElementById('chat-input-text');
    const sendBtn = document.getElementById('btn-chat-send');
    const statusText = document.getElementById('speech-status-indicator');
    const finishBtn = document.getElementById('btn-finish-practice');

    // Mic Click
    micBtn?.addEventListener('click', () => {
      if (!speechService.isSttSupported()) {
        modalController.showToast('เบราว์เซอร์นี้ไม่รองรับ Web Speech Recognition แนะนำให้ใช้ Google Chrome หรือ Safari', 'warning');
        return;
      }
      speechService.toggleListening();
    });

    // Speech Service Callbacks
    speechService.onSpeechStart = () => {
      micBtn?.classList.add('recording');
      if (statusText) statusText.innerHTML = 'กำลังฟัง... <span class="sound-bars"><span class="sound-bar"></span><span class="sound-bar"></span><span class="sound-bar"></span></span>';
    };

    speechService.onSpeechResult = (text, isFinal) => {
      if (textInput) textInput.value = text;
      if (isFinal) {
        if (this.currentScript) {
          if (statusText) statusText.textContent = '✨ รับเสียงสำเร็จ กำลังตรวจสอบ...';
          setTimeout(() => {
            if (this.currentScript && !this.isSubmittingScriptLine && textInput && textInput.value.trim()) {
              this.submitUserScriptLine(textInput.value.trim());
            }
          }, 600);
        } else {
          if (statusText) statusText.textContent = 'กดส่งหรือพูดต่อ';
        }
      }
    };

    speechService.onSpeechEnd = () => {
      micBtn?.classList.remove('recording');
      if (statusText) {
        statusText.textContent = this.currentScript ? 'แตะไมค์เพื่ออ่านออกเสียง 🎙️' : 'แตะไมค์เพื่อพูด';
      }
    };

    speechService.onSpeechError = (err) => {
      micBtn?.classList.remove('recording');
      if (statusText) {
        statusText.textContent = this.currentScript ? 'แตะไมค์เพื่ออ่านออกเสียง 🎙️' : 'แตะไมค์เพื่อพูด';
      }
      if (err === 'not-allowed') {
        modalController.showToast('กรุณาอนุญาตการเข้าถึงไมโครโฟนบนเบราว์เซอร์ของคุณ', 'warning');
      }
    };

    speechService.onTtsStart = () => {
      const dot = document.getElementById('chat-speaking-dot');
      if (dot) dot.classList.add('active');
    };

    speechService.onTtsEnd = () => {
      const dot = document.getElementById('chat-speaking-dot');
      if (dot) dot.classList.remove('active');
    };

    // Send on click or Enter
    sendBtn?.addEventListener('click', () => {
      const text = textInput?.value.trim();
      if (text) this.sendUserMessage(text);
    });

    textInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const text = textInput?.value.trim();
        if (text) this.sendUserMessage(text);
      }
    });

    // Finish session button
    finishBtn?.addEventListener('click', () => {
      this.finishSession(true);
    });
  }

  async sendUserMessage(text) {
    if (!text || !this.activeScenario) return;

    speechService.stopListening();

    // กรณีอยู่ในโหมดบทสนทนาแบบ Script
    if (this.currentScript) {
      await this.submitUserScriptLine(text);
      return;
    }

    // Clear input for free chat mode
    const textInput = document.getElementById('chat-input-text');
    if (textInput) textInput.value = '';

    // 1. Append User Message
    const userMsg = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: text,
      timestamp: new Date()
    };
    this.messageHistory.push(userMsg);

    // 2. Generate AI Reply and Grammar Feedback
    const statusText = document.getElementById('speech-status-indicator');
    if (statusText) statusText.textContent = 'กำลังคิดคำตอบ...';

    try {
      const result = await aiService.generateReply(this.activeScenario, this.messageHistory, text);
      
      // Attach grammar feedback to user's bubble
      userMsg.grammarFeedback = result.grammarFeedback;
      this.appendMessageBubble(userMsg);

      // Append Partner Reply
      const partnerMsg = {
        id: 'msg_' + (Date.now() + 1),
        sender: 'partner',
        text: result.replyText,
        textTh: result.replyTextTh,
        timestamp: new Date()
      };
      this.messageHistory.push(partnerMsg);
      this.appendMessageBubble(partnerMsg);

      // Update prompts
      this.renderSuggestedPrompts(result.suggestedPrompts);

      // Speak partner reply
      speechService.speak(result.replyText);

      if (statusText) statusText.textContent = 'แตะไมค์เพื่อพูด';
    } catch (e) {
      console.error('Error generating reply:', e);
      this.appendMessageBubble(userMsg);
      if (statusText) statusText.textContent = 'แตะไมค์เพื่อพูด';
    }
  }

  async finishSession(returnToScenarios = true) {
    if (!this.activeScenario || this.messageHistory.length <= 1) {
      if (returnToScenarios) this.switchView('scenarios');
      return;
    }

    const durationSeconds = this.sessionStartTime ? Math.round((new Date() - this.sessionStartTime) / 1000) : 60;
    const userTurns = this.messageHistory.filter(m => m.sender === 'user').length;

    const sessionData = {
      scenarioId: this.activeScenario.id,
      scenarioTitle: this.activeScenario.title,
      scenarioTitleTh: this.activeScenario.titleTh,
      turns: userTurns,
      durationSeconds: durationSeconds,
      messagesCount: this.messageHistory.length
    };

    await dbService.saveConversation(sessionData);

    modalController.showToast('🎉 เก่งมากคนเก่ง! จบการฝึกสนทนาด่านนี้แล้ว', 'success', 3500);

    if (returnToScenarios) {
      this.activeScenario = null;
      this.messageHistory = [];
      this.switchView('scenarios');
    }
  }

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

export const uiController = new UIController();
