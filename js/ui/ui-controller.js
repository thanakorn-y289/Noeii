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
      this.updateStatsBanner();
    } else if (viewName === 'wordbank') {
      this.renderWordBank();
    } else if (viewName === 'history') {
      this.renderHistory();
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
        textEl.textContent = 'Firebase Synced';
      } else {
        badge.className = 'firebase-indicator warning';
        textEl.textContent = 'Firebase Connected (Click to Login)';
      }
    } else {
      badge.className = 'firebase-indicator warning';
      textEl.textContent = 'Setup Firebase';
    }
  }

  // ===================== SCENARIOS LIST =====================

  renderScenarios() {
    const container = document.getElementById('scenarios-container');
    if (!container) return;

    const filtered = SCENARIOS.filter(s => {
      const matchLevel = this.filterLevel === 'all' || s.level.toLowerCase() === this.filterLevel.toLowerCase() || s.level === 'All Levels';
      const matchSearch = !this.searchQuery || 
        s.title.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
        s.titleTh.includes(this.searchQuery) ||
        s.category.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchLevel && matchSearch;
    });

    container.innerHTML = filtered.map(s => {
      const levelClass = s.level.toLowerCase().replace(' ', '-');
      return `
        <div class="scenario-card" data-id="${s.id}">
          <div class="scenario-header">
            <div class="scenario-icon">${s.icon}</div>
            <div class="scenario-badges">
              <span class="badge-level ${levelClass}">${s.level}</span>
              <span class="scenario-category">${s.category}</span>
            </div>
          </div>
          <h3 class="scenario-title">${s.title}</h3>
          <p class="scenario-title-th">${s.titleTh}</p>
          <p class="scenario-description">${s.description}</p>
          <div class="scenario-footer">
            <div class="scenario-partner">
              <span class="scenario-partner-avatar">${s.partnerAvatar}</span>
              <span><strong>${s.partnerName}</strong> (${s.partnerRole})</span>
            </div>
            <button class="btn btn-primary btn-sm btn-start-scenario" data-id="${s.id}">
              ฝึกสนทนา 🎙️
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach click events
    container.querySelectorAll('.scenario-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const id = card.getAttribute('data-id');
        this.startScenario(id);
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

  async updateStatsBanner() {
    const stats = await dbService.getUserStats();
    const streakEl = document.getElementById('stat-streak');
    const countEl = document.getElementById('stat-practices');
    const minEl = document.getElementById('stat-minutes');

    if (streakEl) streakEl.textContent = `${stats.streakDays || 1} 🔥`;
    if (countEl) countEl.textContent = stats.totalPractices || 0;
    if (minEl) minEl.textContent = `${stats.totalMinutes || 0} นาที`;
  }

  // ===================== CHAT PRACTICE ROOM =====================

  startScenario(scenarioId) {
    const scenario = SCENARIOS.find(s => s.id === scenarioId);
    if (!scenario) return;

    this.activeScenario = scenario;
    this.messageHistory = [];
    this.sessionStartTime = new Date();

    // Update Chat Header Info
    const avatarEl = document.getElementById('chat-partner-avatar');
    const nameEl = document.getElementById('chat-partner-name');
    const roleEl = document.getElementById('chat-partner-role');
    const titleEl = document.getElementById('chat-scenario-title');

    if (avatarEl) avatarEl.textContent = scenario.partnerAvatar;
    if (nameEl) nameEl.textContent = scenario.partnerName;
    if (roleEl) roleEl.textContent = scenario.partnerRole;
    if (titleEl) titleEl.textContent = `${scenario.icon} ${scenario.title}`;

    // Clear feed
    const messagesFeed = document.getElementById('chat-messages-feed');
    if (messagesFeed) messagesFeed.innerHTML = '';

    // Switch View
    this.switchView('chat');

    // Add partner's opening line
    const initialMsg = {
      id: 'msg_' + Date.now(),
      sender: 'partner',
      text: scenario.initialMessage,
      textTh: scenario.initialMessageTh,
      timestamp: new Date()
    };
    this.messageHistory.push(initialMsg);
    this.appendMessageBubble(initialMsg);

    // Render suggested prompts
    this.renderSuggestedPrompts(scenario.suggestedPrompts);

    // Speak partner's opening message automatically
    speechService.speak(scenario.initialMessage);
  }

  appendMessageBubble(msg) {
    const feed = document.getElementById('chat-messages-feed');
    if (!feed) return;

    const isPartner = msg.sender === 'partner';
    const row = document.createElement('div');
    row.className = `message-row ${isPartner ? 'partner' : 'user'}`;
    row.id = msg.id;

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
        ${isPartner ? this.activeScenario.partnerAvatar : '👤'}
      </div>
      <div class="message-content">
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
        if (statusText) statusText.textContent = 'กดส่งหรือพูดต่อ';
      }
    };

    speechService.onSpeechEnd = () => {
      micBtn?.classList.remove('recording');
      if (statusText) statusText.textContent = 'แตะไมค์เพื่อพูด';
    };

    speechService.onSpeechError = (err) => {
      micBtn?.classList.remove('recording');
      if (statusText) statusText.textContent = 'แตะไมค์เพื่อพูด';
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
    modalController.showToast(`🎉 ฝึกสนทนาสำเร็จ! พูดไปทั้งหมด ${userTurns} ประโยค บันทึกสถิติแล้ว`, 'success');

    if (returnToScenarios) {
      this.activeScenario = null;
      this.messageHistory = [];
      this.switchView('scenarios');
    }
  }

  // ===================== WORD BANK =====================

  async renderWordBank() {
    const container = document.getElementById('wordbank-list-container');
    const countEl = document.getElementById('wordbank-count');
    if (!container) return;

    const list = await dbService.getVocabulary();
    if (countEl) countEl.textContent = `${list.length} คำ`;

    if (list.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-muted);">
          <div style="font-size: 3rem; margin-bottom: 1rem;">📖</div>
          <h3>ยังไม่มีคำศัพท์ในคลัง</h3>
          <p>คุณสามารถกดเพิ่มคำศัพท์ใหม่ได้จากปุ่ม "เพิ่มคำศัพท์ใหม่" ด้านบน</p>
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(item => `
      <div class="vocab-card">
        <div class="vocab-word-row">
          <div class="vocab-word">${this.escapeHtml(item.word)}</div>
          <div class="vocab-phonetic">${this.escapeHtml(item.phonetic || '')}</div>
        </div>
        <div class="vocab-th">${this.escapeHtml(item.th || '')}</div>
        ${item.example ? `<div style="font-size: 0.8rem; color: var(--text-muted); font-style: italic;">"${this.escapeHtml(item.example)}"</div>` : ''}
        <div class="vocab-actions">
          <button class="btn btn-secondary btn-sm btn-speak-vocab" data-word="${this.escapeHtml(item.word)}">
            🔊 ออกเสียง
          </button>
          <button class="btn btn-secondary btn-sm btn-del-vocab" data-word="${this.escapeHtml(item.word)}" style="color: var(--danger);">
            🗑️ ลบ
          </button>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.btn-speak-vocab').forEach(btn => {
      btn.addEventListener('click', () => {
        const word = btn.getAttribute('data-word');
        speechService.speak(word);
      });
    });

    container.querySelectorAll('.btn-del-vocab').forEach(btn => {
      btn.addEventListener('click', async () => {
        const word = btn.getAttribute('data-word');
        if (confirm(`ลบคำว่า "${word}" ออกจากคลัง?`)) {
          await dbService.removeVocabulary(word);
          this.renderWordBank();
          modalController.showToast(`ลบคำว่า "${word}" แล้ว`, 'info');
        }
      });
    });
  }

  // ===================== HISTORY =====================

  async renderHistory() {
    const container = document.getElementById('history-list-container');
    if (!container) return;

    const list = await dbService.getConversations();

    if (list.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: var(--text-muted);">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🗓️</div>
          <h3>ยังไม่มีประวัติการฝึกสนทนา</h3>
          <p>เริ่มฝึกพูดในสถานการณ์จำลองเพื่อบันทึกสถิติและความก้าวหน้า</p>
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(item => {
      const dateStr = item.timestamp ? new Date(item.timestamp).toLocaleString('th-TH') : 'ไม่ระบุเวลา';
      const durationMin = Math.max(1, Math.round((item.durationSeconds || 60) / 60));
      return `
        <div class="history-card">
          <div class="history-meta">
            <h4>${item.scenarioTitle || 'Conversation Practice'}</h4>
            <div style="font-size: 0.85rem; color: var(--text-muted);">${item.scenarioTitleTh || ''}</div>
          </div>
          <div class="history-details">
            <span>📅 ${dateStr}</span>
            <span>💬 ${item.turns || 0} ประโยค</span>
            <span>⏱️ ${durationMin} นาที</span>
          </div>
        </div>
      `;
    }).join('');
  }

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

export const uiController = new UIController();
