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
   * Wait for voices to be loaded
   */
  private async waitForVoices(): Promise<void> {
    return new Promise((resolve) => {
      const voices = this.synthesis.getVoices();
      if (voices.length > 0) {
        resolve();
        return;
      }

      // Wait for voiceschanged event
      const handleVoicesChanged = () => {
        this.synthesis.removeEventListener('voiceschanged', handleVoicesChanged);
        resolve();
      };

      this.synthesis.addEventListener('voiceschanged', handleVoicesChanged);

      // Fallback timeout
      setTimeout(() => {
        this.synthesis.removeEventListener('voiceschanged', handleVoicesChanged);
        resolve();
      }, 1000);
    });
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

    // Wait for voices to be loaded
    await this.waitForVoices();

    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.9; // Slightly slower for language learners
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Try to use a better English voice if available
      const voices = this.synthesis.getVoices();
      const englishVoice = voices.find(voice => 
        voice.lang.startsWith('en') && voice.localService
      ) || voices.find(voice => voice.lang.startsWith('en'));
      
      if (englishVoice) {
        utterance.voice = englishVoice;
        console.log('🔊 Using voice:', englishVoice.name);
      }

      console.log('🔊 Starting TTS:', text.substring(0, 50) + '...');

      utterance.onstart = () => {
        console.log('🔊 TTS started');
      };

      utterance.onend = () => {
        console.log('🔊 TTS ended');
        this.currentUtterance = null;
        resolve();
      };

      utterance.onerror = (event) => {
        console.error('🔊 TTS Error:', event.error);
        this.currentUtterance = null;
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      this.currentUtterance = utterance;
      
      // Speak immediately
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
