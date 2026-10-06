// Web Speech Synthesis helper for reading Thai instructions aloud to Grade 3 students

class SpeechReader {
  public enabled: boolean = true;

  speak(text: string) {
    if (!this.enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'th-TH';
      utterance.rate = 0.95; // slightly slower for young learners
      utterance.pitch = 1.1; // slightly cheerful tone

      // Try to find Thai voice
      const voices = window.speechSynthesis.getVoices();
      const thaiVoice = voices.find((v) => v.lang.startsWith('th') || v.name.includes('Thai'));
      if (thaiVoice) {
        utterance.voice = thaiVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      // Speech may not be supported or allowed
    }
  }

  stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const speech = new SpeechReader();
