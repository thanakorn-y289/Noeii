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

    // Load custom scenarios from Firestore / Local cache
    const customList = await dbService.getCustomScenarios();
    this.allScenarios = [...customList, ...SCENARIOS];

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
        </div>
      `;
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
            <div style="display: flex; gap: 0.35rem;">
              <button class="btn btn-primary btn-sm btn-start-scenario" data-id="${s.id}">
                เริ่มเล่น 🎙️
              </button>
              ${s.isCustom ? `
                <button class="btn btn-secondary btn-sm btn-del-custom" data-id="${s.id}" title="ลบด่านนี้" style="color: var(--danger); padding: 0.4rem 0.6rem;">
                  🗑️
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach click events
    container.querySelectorAll('.scenario-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.btn-del-custom')) return;
        const id = card.getAttribute('data-id');
        this.startScenario(id);
      });
    });

    // Delete custom scenario
    container.querySelectorAll('.btn-del-custom').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        if (confirm('คุณต้องการลบด่านนี้ออกจากระบบหรือไม่?')) {
          await dbService.deleteCustomScenario(id);
          modalController.showToast('ลบด่านเรียบร้อยแล้ว', 'info');
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
      modalController.openRoleSelectionModal(scenario, (selectedRole) => {
        this.startScriptedScenario(scenario, selectedRole);
      });
      return;
    }

    // กรณีบทสนทนาแบบอิสระ (Custom Scenario ทั่วไป)
    this.startFreeScenario(scenario);
  }

  startScriptedScenario(scenario, userRole = 'Customer') {
    this.activeScenario = scenario;
    this.userRole = userRole;
    this.currentScript = scenario.script || [];
    this.currentScriptIndex = 0;
    this.messageHistory = [];
    this.sessionStartTime = new Date();

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
        document.getElementById('teleprompter-step-indicator').textContent = `ประโยคที่ ${this.currentScriptIndex + 1} / ${this.currentScript.length}`;
        document.getElementById('teleprompter-text').textContent = `"${currentLine.text}"`;
        document.getElementById('teleprompter-th').textContent = currentLine.textTh;

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
          btnSend.onclick = () => this.submitUserScriptLine(currentLine.text);
        }
      }

      if (statusText) statusText.textContent = 'อ่านออกเสียงประโยคนี้ได้เลยครับ 🎙️';

      const textInput = document.getElementById('chat-input-text');
      if (textInput) {
        textInput.placeholder = `กดไมค์พูดว่า: "${currentLine.text}"`;
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

  async submitUserScriptLine(text) {
    if (!this.activeScenario || this.isSubmittingScriptLine) return;
    this.isSubmittingScriptLine = true;

    speechService.stopListening();
    const teleprompter = document.getElementById('guided-teleprompter');
    if (teleprompter) teleprompter.style.display = 'none';

    // ใส่ Bubble ของผู้เรียน
    const userMsg = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      speaker: this.userRole,
      avatar: this.userAvatar || '👦',
      text: text,
      timestamp: new Date()
    };
    this.messageHistory.push(userMsg);
    this.appendMessageBubble(userMsg);

    modalController.showToast('🎉 เยี่ยมมาก! ออกเสียงประโยคสำเร็จ', 'success', 2000);

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

    // Clear input & stop mic if on
    const textInput = document.getElementById('chat-input-text');
    if (textInput) textInput.value = '';
    speechService.stopListening();

    // กรณีอยู่ในโหมดบทสนทนาแบบ Script
    if (this.currentScript) {
      await this.submitUserScriptLine(text);
      return;
    }

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
