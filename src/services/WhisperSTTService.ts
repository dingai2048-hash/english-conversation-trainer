/**
 * OpenAI Whisper Speech-to-Text Service
 * 使用 OpenAI Whisper API 进行高精度语音识别
 */

export interface WhisperSTTConfig {
  apiKey: string;
  model?: 'whisper-1';
  language?: string; // 'en' for English
  temperature?: number; // 0-1, 控制随机性
}

export class WhisperSTTService {
  private apiKey: string;
  private model: string;
  private language: string;
  private temperature: number;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isRecording: boolean = false;
  private stream: MediaStream | null = null;

  constructor(config: WhisperSTTConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model || 'whisper-1';
    this.language = config.language || 'en';
    this.temperature = config.temperature || 0;
  }

  /**
   * 检查浏览器是否支持录音
   */
  public isSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  /**
   * 开始录音
   */
  public async startRecording(): Promise<void> {
    if (!this.isSupported()) {
      throw new Error('浏览器不支持录音功能');
    }

    try {
      // 获取麦克风权限
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });

      // 创建 MediaRecorder
      const mimeType = this.getSupportedMimeType();
      this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });
      this.audioChunks = [];

      // 监听数据
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      // 开始录音
      this.mediaRecorder.start();
      this.isRecording = true;

      console.log('[WhisperSTT] Recording started');
    } catch (error) {
      console.error('[WhisperSTT] Failed to start recording:', error);
      throw new Error('无法访问麦克风');
    }
  }

  /**
   * 停止录音并识别
   */
  public async stopRecording(): Promise<string> {
    if (!this.mediaRecorder || !this.isRecording) {
      throw new Error('当前没有正在进行的录音');
    }

    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('MediaRecorder not initialized'));
        return;
      }

      this.mediaRecorder.onstop = async () => {
        try {
          // 创建音频 Blob
          const audioBlob = new Blob(this.audioChunks, { type: this.audioChunks[0].type });
          
          console.log('[WhisperSTT] Audio recorded, size:', audioBlob.size, 'bytes');

          // 停止所有音轨
          if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
          }

          this.isRecording = false;

          // 如果录音太短，返回空字符串
          if (audioBlob.size < 1000) {
            console.log('[WhisperSTT] Audio too short, skipping transcription');
            resolve('');
            return;
          }

          // 发送到 Whisper API 进行识别
          const text = await this.transcribe(audioBlob);
          resolve(text);
        } catch (error) {
          console.error('[WhisperSTT] Transcription failed:', error);
          reject(error);
        }
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * 使用 Whisper API 转录音频
   */
  private async transcribe(audioBlob: Blob): Promise<string> {
    try {
      // 转换为 WAV 格式（Whisper 支持多种格式，但 WAV 最稳定）
      const audioFile = await this.convertToWav(audioBlob);

      // 创建 FormData
      const formData = new FormData();
      formData.append('file', audioFile, 'audio.wav');
      formData.append('model', this.model);
      formData.append('language', this.language);
      formData.append('temperature', this.temperature.toString());
      formData.append('response_format', 'json');

      console.log('[WhisperSTT] Sending to Whisper API...');

      // 发送请求
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('[WhisperSTT] API error:', error);
        throw new Error(`Whisper API error: ${error.error?.message || response.statusText}`);
      }

      const result = await response.json();
      const text = result.text.trim();

      console.log('[WhisperSTT] Transcription result:', text);

      return text;
    } catch (error) {
      console.error('[WhisperSTT] Transcription error:', error);
      throw error;
    }
  }

  /**
   * 转换音频为 WAV 格式
   */
  private async convertToWav(blob: Blob): Promise<File> {
    // 如果已经是 WAV 格式，直接返回
    if (blob.type.includes('wav')) {
      return new File([blob], 'audio.wav', { type: 'audio/wav' });
    }

    // 否则，使用 Web Audio API 转换
    try {
      const audioContext = new AudioContext();
      const arrayBuffer = await blob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // 转换为 WAV
      const wavBlob = await this.audioBufferToWav(audioBuffer);
      return new File([wavBlob], 'audio.wav', { type: 'audio/wav' });
    } catch (error) {
      console.warn('[WhisperSTT] WAV conversion failed, using original format:', error);
      // 如果转换失败，使用原始格式
      return new File([blob], 'audio.webm', { type: blob.type });
    }
  }

  /**
   * 将 AudioBuffer 转换为 WAV Blob
   */
  private async audioBufferToWav(audioBuffer: AudioBuffer): Promise<Blob> {
    const numberOfChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    const bytesPerSample = bitDepth / 8;
    const blockAlign = numberOfChannels * bytesPerSample;

    const data = [];
    for (let i = 0; i < numberOfChannels; i++) {
      data.push(audioBuffer.getChannelData(i));
    }

    const interleaved = this.interleave(data);
    const dataLength = interleaved.length * bytesPerSample;
    const buffer = new ArrayBuffer(44 + dataLength);
    const view = new DataView(buffer);

    // WAV header
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    this.writeString(view, 8, 'WAVE');
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    this.writeString(view, 36, 'data');
    view.setUint32(40, dataLength, true);

    // Write PCM samples
    this.floatTo16BitPCM(view, 44, interleaved);

    return new Blob([buffer], { type: 'audio/wav' });
  }

  /**
   * 交错音频通道
   */
  private interleave(channelData: Float32Array[]): Float32Array {
    const length = channelData[0].length;
    const numberOfChannels = channelData.length;
    const result = new Float32Array(length * numberOfChannels);

    let inputIndex = 0;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        result[inputIndex++] = channelData[channel][i];
      }
    }

    return result;
  }

  /**
   * 写入字符串到 DataView
   */
  private writeString(view: DataView, offset: number, string: string): void {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  /**
   * 转换 Float32 到 16-bit PCM
   */
  private floatTo16BitPCM(view: DataView, offset: number, input: Float32Array): void {
    for (let i = 0; i < input.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, input[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
  }

  /**
   * 获取支持的 MIME 类型
   */
  private getSupportedMimeType(): string {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/ogg',
      'audio/wav',
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        console.log('[WhisperSTT] Using MIME type:', type);
        return type;
      }
    }

    console.warn('[WhisperSTT] No supported MIME type found, using default');
    return '';
  }

  /**
   * 获取当前录音状态
   */
  public getIsRecording(): boolean {
    return this.isRecording;
  }

  /**
   * 获取音频 Blob（用于发音评估等）
   */
  public getAudioBlob(): Blob | null {
    if (this.audioChunks.length === 0) {
      return null;
    }
    return new Blob(this.audioChunks, { type: this.audioChunks[0].type });
  }

  /**
   * 清理资源
   */
  public cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
    }
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isRecording = false;
  }
}
