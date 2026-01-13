/**
 * OpenAI TTS Service
 * 使用 OpenAI 的 Text-to-Speech API
 * 性价比最高，质量优秀
 */

export interface OpenAITTSConfig {
  apiKey: string;
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  model?: 'tts-1' | 'tts-1-hd'; // tts-1 便宜快速，tts-1-hd 质量更高
  speed?: number; // 0.25 - 4.0，默认 1.0
}

export class OpenAITTSService {
  private apiKey: string;
  private voice: string;
  private model: string;
  private speed: number;
  private audio: HTMLAudioElement | null = null;

  // 预设音色说明
  public static readonly VOICES = {
    alloy: { name: 'Alloy', description: '中性、清晰、适合教学' },
    echo: { name: 'Echo', description: '男声、专业、沉稳' },
    fable: { name: 'Fable', description: '英式口音、优雅' },
    onyx: { name: 'Onyx', description: '男声、深沉、权威' },
    nova: { name: 'Nova', description: '女声、友好、活泼（推荐）' },
    shimmer: { name: 'Shimmer', description: '女声、温柔、甜美' },
  };

  constructor(config: OpenAITTSConfig) {
    this.apiKey = config.apiKey;
    this.voice = config.voice || 'nova'; // 默认使用 Nova（友好活泼）
    this.model = config.model || 'tts-1-hd'; // 默认使用 HD 质量
    this.speed = config.speed || 0.9; // 稍微慢一点，适合学习
  }

  /**
   * 检查是否支持
   */
  public isSupported(): boolean {
    return true; // OpenAI TTS 是基于 API 的，总是支持
  }

  /**
   * 生成语音并播放
   */
  public async speak(text: string, lang: string = 'en-US'): Promise<void> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key is required');
    }

    // 停止当前播放
    this.stop();

    try {
      console.log('🔊 [OpenAI TTS] Generating speech:', text.substring(0, 50) + '...');
      console.log('🔊 [OpenAI TTS] Voice:', this.voice, 'Model:', this.model, 'Speed:', this.speed);

      // 调用 OpenAI TTS API
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          input: text,
          voice: this.voice,
          speed: this.speed,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
        throw new Error(`OpenAI TTS API error: ${error.error?.message || response.statusText}`);
      }

      // 获取音频数据
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // 播放音频
      return new Promise((resolve, reject) => {
        this.audio = new Audio(audioUrl);

        this.audio.onloadedmetadata = () => {
          console.log('🔊 [OpenAI TTS] Audio loaded, duration:', this.audio?.duration, 'seconds');
        };

        this.audio.onended = () => {
          console.log('🔊 [OpenAI TTS] Speech ended');
          URL.revokeObjectURL(audioUrl);
          this.audio = null;
          resolve();
        };

        this.audio.onerror = (error) => {
          console.error('🔊 [OpenAI TTS] Playback error:', error);
          URL.revokeObjectURL(audioUrl);
          this.audio = null;
          reject(new Error('Failed to play audio'));
        };

        console.log('🔊 [OpenAI TTS] Starting playback');
        this.audio.play().catch(reject);
      });
    } catch (error) {
      console.error('🔊 [OpenAI TTS] Error:', error);
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
   * 暂停播放
   */
  public pause(): void {
    if (this.audio && !this.audio.paused) {
      this.audio.pause();
    }
  }

  /**
   * 恢复播放
   */
  public resume(): void {
    if (this.audio && this.audio.paused) {
      this.audio.play();
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
  public setVoice(voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'): void {
    this.voice = voice;
  }

  /**
   * 设置模型
   */
  public setModel(model: 'tts-1' | 'tts-1-hd'): void {
    this.model = model;
  }

  /**
   * 设置语速
   */
  public setSpeed(speed: number): void {
    this.speed = Math.max(0.25, Math.min(4.0, speed));
  }

  /**
   * 获取可用音色列表
   */
  public static getAvailableVoices() {
    return [
      { id: 'nova', name: 'Nova', description: '女声、友好、活泼（推荐）', gender: 'female' },
      { id: 'shimmer', name: 'Shimmer', description: '女声、温柔、甜美', gender: 'female' },
      { id: 'alloy', name: 'Alloy', description: '中性、清晰、适合教学', gender: 'neutral' },
      { id: 'echo', name: 'Echo', description: '男声、专业、沉稳', gender: 'male' },
      { id: 'fable', name: 'Fable', description: '英式口音、优雅', gender: 'neutral' },
      { id: 'onyx', name: 'Onyx', description: '男声、深沉、权威', gender: 'male' },
    ];
  }

  /**
   * 获取可用模型列表
   */
  public static getAvailableModels() {
    return [
      { id: 'tts-1', name: 'Standard', description: '标准质量，速度快，价格便宜', price: '$0.015/1K字符' },
      { id: 'tts-1-hd', name: 'HD', description: '高清质量，更自然，推荐使用', price: '$0.030/1K字符' },
    ];
  }
}
