/**
 * Speech Service (Web Speech API: Speech-to-Text & Text-to-Speech)
 * จัดการการฟังเสียงผู้ใช้ และการออกเสียงของ AI Partner
 */

class SpeechService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.isSpeaking = false;
    this.selectedVoice = null;
    this.availableVoices = [];
    this.speechRate = 1.0; // 0.8 to 1.2
    this.accent = 'en-US'; // 'en-US' or 'en-GB'

    // Callbacks
    this.onSpeechResult = null; // (text, isFinal) => {}
    this.onSpeechStart = null;  // () => {}
    this.onSpeechEnd = null;    // () => {}
    this.onSpeechError = null;  // (error) => {}
    this.onTtsStart = null;     // () => {}
    this.onTtsEnd = null;       // () => {}

    this.initRecognition();
    this.initSynthesis();
  }

  // ===================== SPEECH RECOGNITION (STT) =====================

  initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition API is not supported in this browser.');
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false; // Turn-based for conversations
      this.recognition.interimResults = true;
      this.recognition.lang = this.accent;

      this.recognition.onstart = () => {
        this.isListening = true;
        if (this.onSpeechStart) this.onSpeechStart();
      };

      this.recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const currentText = finalTranscript || interimTranscript;
        const isFinal = Boolean(finalTranscript);

        if (this.onSpeechResult) {
          this.onSpeechResult(currentText, isFinal);
        }
      };

      this.recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        this.isListening = false;
        if (this.onSpeechError) {
          this.onSpeechError(event.error);
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (this.onSpeechEnd) this.onSpeechEnd();
      };
    } catch (e) {
      console.error('Error initializing SpeechRecognition:', e);
    }
  }

  isSttSupported() {
    return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  startListening() {
    if (!this.recognition) {
      this.initRecognition();
      if (!this.recognition) {
        throw new Error('NOT_SUPPORTED');
      }
    }

    // หยุดเสียงพูดก่อนเริ่มฟัง
    this.stopSpeaking();

    if (this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }

    this.recognition.lang = this.accent;
    try {
      this.recognition.start();
    } catch (e) {
      console.warn('Recognition start exception:', e);
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {}
      this.isListening = false;
    }
  }

  toggleListening() {
    if (this.isListening) {
      this.stopListening();
    } else {
      this.startListening();
    }
    return this.isListening;
  }

  // ===================== TEXT TO SPEECH (TTS) =====================

  initSynthesis() {
    if (!('speechSynthesis' in window)) {
      console.warn('SpeechSynthesis is not supported in this browser.');
      return;
    }

    const loadVoices = () => {
      this.availableVoices = window.speechSynthesis.getVoices();
      this.chooseBestVoice();
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  chooseBestVoice() {
    if (!this.availableVoices.length) return;

    // Filter by preferred accent
    const targetLang = this.accent.toLowerCase();
    const matchedVoices = this.availableVoices.filter(v => v.lang.toLowerCase().replace('_', '-').startsWith(targetLang));

    // Prefer high quality / natural voices
    const preferredNames = ['Google', 'Natural', 'Samantha', 'Daniel', 'Karen', 'Moira', 'Arthur'];
    let best = matchedVoices.find(v => preferredNames.some(p => v.name.includes(p)));

    if (!best && matchedVoices.length > 0) {
      best = matchedVoices[0];
    } else if (!best) {
      best = this.availableVoices.find(v => v.lang.startsWith('en')) || this.availableVoices[0];
    }

    this.selectedVoice = best;
  }

  isTtsSupported() {
    return 'speechSynthesis' in window;
  }

  speak(text, options = {}) {
    if (!('speechSynthesis' in window)) return;
    this.stopSpeaking();
    this.stopListening();

    if (!text || !text.trim()) return;

    const utterance = new SpeechSynthesisUtterance(text.trim());
    utterance.rate = options.rate || this.speechRate;
    utterance.pitch = options.pitch || 1.0;
    utterance.lang = options.lang || this.accent;

    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (this.onTtsStart) this.onTtsStart();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      if (this.onTtsEnd) this.onTtsEnd();
      if (options.onComplete) options.onComplete();
    };

    utterance.onerror = (e) => {
      console.warn('TTS error:', e);
      this.isSpeaking = false;
      if (this.onTtsEnd) this.onTtsEnd();
    };

    window.speechSynthesis.speak(utterance);
  }

  stopSpeaking() {
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
      if (this.onTtsEnd) this.onTtsEnd();
    }
  }

  setAccent(accent) {
    this.accent = accent; // 'en-US' or 'en-GB'
    if (this.recognition) {
      this.recognition.lang = accent;
    }
    this.chooseBestVoice();
  }

  setRate(rate) {
    this.speechRate = Math.min(1.5, Math.max(0.6, rate));
  }
}

export const speechService = new SpeechService();
