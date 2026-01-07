/**
 * Replicate TTS Service
 * Uses Replicate API for high-quality text-to-speech
 */

export interface ReplicateTTSConfig {
  apiKey: string;
  model: 'turbo' | 'hd'; // turbo for speed, hd for quality
}

export class ReplicateTTSService {
  private config: ReplicateTTSConfig;
  private currentAudio: HTMLAudioElement | null = null;

  constructor(config: ReplicateTTSConfig) {
    this.config = config;
  }

  /**
   * Check if Replicate TTS is configured
   */
  public isConfigured(): boolean {
    return this.config.apiKey !== '';
  }

  /**
   * Speak the given text using Replicate API
   */
  public async speak(text: string, lang: string = 'en-US'): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error('Replicate API key is not configured.');
    }

    // Stop any ongoing speech
    this.stop();

    try {
      // Determine which model to use
      const modelVersion = this.config.model === 'turbo' 
        ? 'minimax/speech-02-turbo'
        : 'minimax/speech-02-hd';

      // Call Replicate API
      const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: modelVersion,
          input: {
            text: text,
            language: lang.startsWith('en') ? 'en' : lang,
            speed: 0.9, // Slightly slower for language learners
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Replicate API error: ${response.status} ${response.statusText}`);
      }

      const prediction = await response.json();

      // Poll for completion
      const audioUrl = await this.pollForCompletion(prediction.id);

      // Play the audio
      await this.playAudio(audioUrl);
    } catch (error) {
      console.error('Replicate TTS error:', error);
      throw new Error(`Failed to generate speech: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Poll Replicate API until prediction is complete
   */
  private async pollForCompletion(predictionId: string): Promise<string> {
    const maxAttempts = 30; // 30 seconds max
    const pollInterval = 1000; // 1 second

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: {
          'Authorization': `Token ${this.config.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to check prediction status: ${response.status}`);
      }

      const prediction = await response.json();

      if (prediction.status === 'succeeded') {
        return prediction.output; // Audio URL
      }

      if (prediction.status === 'failed') {
        throw new Error(`Prediction failed: ${prediction.error}`);
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error('Prediction timed out');
  }

  /**
   * Play audio from URL
   */
  private async playAudio(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio(url);
      
      audio.onended = () => {
        this.currentAudio = null;
        resolve();
      };

      audio.onerror = () => {
        this.currentAudio = null;
        reject(new Error('Failed to play audio'));
      };

      this.currentAudio = audio;
      audio.play().catch(reject);
    });
  }

  /**
   * Stop current speech
   */
  public stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }

  /**
   * Check if currently speaking
   */
  public isSpeaking(): boolean {
    return this.currentAudio !== null && !this.currentAudio.paused;
  }
}
