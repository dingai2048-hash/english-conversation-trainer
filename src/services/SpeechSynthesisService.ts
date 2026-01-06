/**
 * Speech Synthesis Service
 * Wraps the Web Speech API for text-to-speech output
 */

export class SpeechSynthesisService {
  private synthesis: SpeechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    this.synthesis = window.speechSynthesis;
  }

  /**
   * Check if speech synthesis is supported
   */
  public isSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  /**
   * Speak the given text
   */
  public async speak(text: string, lang: string = 'en-US'): Promise<void> {
    if (!this.isSupported()) {
      throw new Error('Speech synthesis is not supported in this browser.');
    }

    // Cancel any ongoing speech
    this.stop();

    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.9; // Slightly slower for language learners
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onend = () => {
        this.currentUtterance = null;
        resolve();
      };

      utterance.onerror = (event) => {
        this.currentUtterance = null;
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      this.currentUtterance = utterance;
      this.synthesis.speak(utterance);
    });
  }

  /**
   * Stop current speech
   */
  public stop(): void {
    if (this.synthesis.speaking) {
      this.synthesis.cancel();
    }
    this.currentUtterance = null;
  }

  /**
   * Pause current speech
   */
  public pause(): void {
    if (this.synthesis.speaking && !this.synthesis.paused) {
      this.synthesis.pause();
    }
  }

  /**
   * Resume paused speech
   */
  public resume(): void {
    if (this.synthesis.paused) {
      this.synthesis.resume();
    }
  }

  /**
   * Check if currently speaking
   */
  public isSpeaking(): boolean {
    return this.synthesis.speaking;
  }

  /**
   * Get available voices
   */
  public getVoices(): SpeechSynthesisVoice[] {
    return this.synthesis.getVoices();
  }

  /**
   * Get English voices
   */
  public getEnglishVoices(): SpeechSynthesisVoice[] {
    return this.getVoices().filter(voice => voice.lang.startsWith('en'));
  }
}

/**
 * Create and export a singleton instance
 */
export const speechSynthesisService = new SpeechSynthesisService();
