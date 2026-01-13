/**
 * ElevenLabs TTS Service
 * 最自然的语音合成服务
 */

export interface ElevenLabsConfig {
  apiKey: string;
  voiceId?: string; // 默认使用 Rachel
  model?: string; // eleven_monolingual_v1 或 eleven_turbo_v2
}

export class ElevenLabsTTSService {
  private apiKey: string;
  private voiceId: string;
  private model: string;
  private audio: HTMLAudioElement | null = null;

  // 预设音色
  public static readonly VOICES = {
    rachel: '21m00Tcm4TlvDq8ikWAM', // 温柔友好的女声
    adam: 'pNInz6obpgDQGcFmaJgB', // 清晰专业的男声
    bella: 'EXAVITQu4vr4xnSDxMaL', // 活泼可爱的女声
    antoni: 'ErXwobaYiN019PkySvjV', // 温暖的男声
    elli: 'MF3mGyEYCl7XYWbV9V6O', // 年轻活力的女声
    josh: 'TxGEqnHWrfWFTfGW9XjX', // 深沉的男声
  };

  constructor(config: ElevenLabsConfig) {
    this.apiKey = config.apiKey;
    this.voiceId = config.voiceId || ElevenLabsTTSService.VOICES.rachel;
    this.model = config.model || 'eleven_turbo_v2'; // 使用 turbo 模型，速度快
  }

  /**
   * 检查是否支持
   */
  public isSupported(): boolean {
    return true; // ElevenLabs 是基于 API 的，总是支持
  }

  /**
   * 生成语音并播放
   */
  public async speak(text: string, lang: string = 'en-US'): Promise<void> {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key is required');
    }

    // 停止当前播放
    this.stop();

    try {
      console.log('🔊 [ElevenLabs] Generating speech:', text.substring(0, 50) + '...');

      // 调用 ElevenLabs API
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${this.voiceId}`,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKey,
          },
          body: JSON.stringify({
            text: text,
            model_id: this.model,
            voice_settings: {
              stability: 0.5, // 稳定性（0-1）
              similarity_boost: 0.75, // 相似度增强（0-1）
              style: 0.5, // 风格强度（0-1）
              use_speaker_boost: true, // 使用说话者增强
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`ElevenLabs API error: ${error.detail?.message || response.statusText}`);
      }

      // 获取音频数据
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // 播放音频
      return new Promise((resolve, reject) => {
        this.audio = new Audio(audioUrl);

        this.audio.onended = () => {
          console.log('🔊 [ElevenLabs] Speech ended');
          URL.revokeObjectURL(audioUrl);
          this.audio = null;
          resolve();
        };

        this.audio.onerror = (error) => {
          console.error('🔊 [ElevenLabs] Playback error:', error);
          URL.revokeObjectURL(audioUrl);
          this.audio = null;
          reject(new Error('Failed to play audio'));
        };

        console.log('🔊 [ElevenLabs] Starting playback');
        this.audio.play().catch(reject);
      });
    } catch (error) {
      console.error('🔊 [ElevenLabs] Error:', error);
      throw error;
    }
  }

  /**
   * 停止播放
   */
  public stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio = null;
    }
  }

  /**
   * 检查是否正在播放
   */
  public isSpeaking(): boolean {
    return this.audio !== null && !this.audio.paused;
  }

  /**
   * 设置音色
   */
  public setVoice(voiceId: string): void {
    this.voiceId = voiceId;
  }

  /**
   * 设置模型
   */
  public setModel(model: string): void {
    this.model = model;
  }

  /**
   * 获取可用音色列表
   */
  public static getAvailableVoices() {
    return [
      { id: ElevenLabsTTSService.VOICES.rachel, name: 'Rachel', description: '温柔友好的女声（推荐）' },
      { id: ElevenLabsTTSService.VOICES.bella, name: 'Bella', description: '活泼可爱的女声' },
      { id: ElevenLabsTTSService.VOICES.elli, name: 'Elli', description: '年轻活力的女声' },
      { id: ElevenLabsTTSService.VOICES.adam, name: 'Adam', description: '清晰专业的男声' },
      { id: ElevenLabsTTSService.VOICES.antoni, name: 'Antoni', description: '温暖的男声' },
      { id: ElevenLabsTTSService.VOICES.josh, name: 'Josh', description: '深沉的男声' },
    ];
  }
}
