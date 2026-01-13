/**
 * Hybrid STT Service
 * 混合模式：使用浏览器 STT 进行静音检测，使用 Whisper 进行最终识别
 * 
 * 工作流程：
 * 1. 同时启动浏览器 STT（静音检测）和 MediaRecorder（录音）
 * 2. 浏览器 STT 在后台运行，不显示临时结果
 * 3. 检测到 1.5 秒静音后，自动停止录音
 * 4. 将录音发送到 Whisper API 进行高精度识别
 * 5. 只显示 Whisper 的最终识别结果
 */

import { SpeechRecognitionService } from './SpeechRecognitionService';
import { WhisperSTTService } from './WhisperSTTService';

export interface HybridSTTConfig {
  apiKey: string;
  silenceThreshold?: number; // 静音检测阈值（毫秒），默认 1500ms
  language?: string; // 语言，默认 'en'
}

export class HybridSTTService {
  private browserSTT: SpeechRecognitionService;
  private whisperSTT: WhisperSTTService;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private mediaStream: MediaStream | null = null;
  private isRecording: boolean = false;
  private silenceThreshold: number;
  private silenceTimer: NodeJS.Timeout | null = null;
  private lastSpeechTime: number = 0;
  private autoStopCallback: (() => void) | null = null;
  private hasTriggeredStop: boolean = false; // 防止重复触发
  private recordingStartTime: number = 0; // 记录开始录音的时间
  private maxRecordingTime: number = 15000; // 最大录音时间 15 秒

  constructor(config: HybridSTTConfig) {
    this.silenceThreshold = config.silenceThreshold || 800; // 优化：从 1500ms 减少到 800ms
    
    // 初始化浏览器 STT（用于静音检测）
    this.browserSTT = new SpeechRecognitionService();
    
    // 初始化 Whisper STT（用于最终识别）
    this.whisperSTT = new WhisperSTTService({
      apiKey: config.apiKey,
      language: config.language || 'en',
      temperature: 0,
    });
  }

  /**
   * 检查是否支持
   */
  public isSupported(): boolean {
    return this.browserSTT.isSupported() && this.whisperSTT.isSupported();
  }

  /**
   * 开始录音
   */
  public async startRecording(): Promise<void> {
    if (!this.isSupported()) {
      throw new Error('浏览器不支持混合模式录音');
    }

    if (this.isRecording) {
      throw new Error('录音已在进行中');
    }

    try {
      // 1. 获取麦克风权限
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });

      // 2. 启动 MediaRecorder 录音
      this.audioChunks = [];
      const mimeType = this.getSupportedMimeType();
      this.mediaRecorder = new MediaRecorder(this.mediaStream, { mimeType });
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };
      
      this.mediaRecorder.start();

      // 3. 启动浏览器 STT（仅用于静音检测，不显示结果）
      // 只有在设置了自动停止回调时才启用静音检测
      if (this.autoStopCallback) {
        this.lastSpeechTime = Date.now();
        this.recordingStartTime = Date.now(); // 记录开始时间
        this.hasTriggeredStop = false; // 重置标志
        this.setupBrowserSTTForSilenceDetection();
      }
      
      // 尝试启动浏览器 STT，如果失败也继续（使用备用计时器）
      // 只有在设置了自动停止回调时才启动
      if (this.autoStopCallback) {
        try {
          await this.browserSTT.startRecording();
        } catch (error) {
          console.warn('[HybridSTT] Browser STT failed to start, using fallback timer:', error);
          // 如果浏览器 STT 启动失败，使用备用计时器
          this.startFallbackTimer();
        }
      }

      this.isRecording = true;
      console.log('[HybridSTT] Recording started (Browser STT + MediaRecorder)');
    } catch (error) {
      console.error('[HybridSTT] Failed to start recording:', error);
      this.cleanup();
      throw new Error('无法启动录音');
    }
  }

  /**
   * 启动备用计时器（当浏览器 STT 失败时使用）
   */
  private startFallbackTimer(): void {
    // 设置一个最大录音时间（10秒），防止永远卡住
    const maxRecordingTime = 10000;
    this.silenceTimer = setTimeout(() => {
      console.log('[HybridSTT] Fallback timer triggered, hasTriggeredStop:', this.hasTriggeredStop);
      if (!this.hasTriggeredStop && this.isRecording && this.autoStopCallback) {
        this.hasTriggeredStop = true;
        this.autoStopCallback();
      }
    }, maxRecordingTime);
  }

  /**
   * 设置浏览器 STT 用于静音检测
   */
  private setupBrowserSTTForSilenceDetection(): void {
    console.log('[HybridSTT] Setting up silence detection, threshold:', this.silenceThreshold, 'ms');
    
    // 使用 setInterval 持续检查，而不是 setTimeout 只检查一次
    // 每 200ms 检查一次是否应该停止
    const checkInterval = 200;
    this.silenceTimer = setInterval(() => {
      const timeSinceLastSpeech = Date.now() - this.lastSpeechTime;
      const totalRecordingTime = Date.now() - this.recordingStartTime;
      
      // 检查是否已经触发过停止，防止重复触发
      // 或者检查是否超过最大录音时间或静音时间
      if (!this.hasTriggeredStop && (timeSinceLastSpeech >= this.silenceThreshold || totalRecordingTime >= this.maxRecordingTime)) {
        console.log('[HybridSTT] Silence/timeout detected, time since last speech:', timeSinceLastSpeech, 'ms, total recording time:', totalRecordingTime, 'ms');
        
        if (totalRecordingTime >= this.maxRecordingTime) {
          console.log('[HybridSTT] Max recording time reached, triggering auto-stop');
        } else {
          console.log('[HybridSTT] Silence timeout, triggering auto-stop');
        }
        
        this.hasTriggeredStop = true; // 设置标志，防止重复触发
        
        // 清除计时器
        if (this.silenceTimer) {
          clearInterval(this.silenceTimer as any);
          this.silenceTimer = null;
        }
        
        if (this.autoStopCallback) {
          this.autoStopCallback();
        } else {
          console.warn('[HybridSTT] No autoStopCallback registered!');
        }
      }
    }, checkInterval) as any;
    
    // 监听浏览器 STT 的结果（用于更新最后语音时间）
    this.browserSTT.onResult((text: string) => {
      console.log('[HybridSTT] Browser STT result:', text, 'length:', text.trim().length);
      // 只有当识别出的文本长度 >= 2 个字符时，才认为是真正的语音
      // 这样可以过滤掉背景噪音导致的误识别（通常只有 1 个字符或空格）
      if (text.trim() && text.trim().length >= 2) {
        this.lastSpeechTime = Date.now();
        console.log('[HybridSTT] Valid speech detected (length >= 2), updating last speech time');
      } else if (text.trim()) {
        console.log('[HybridSTT] Ignoring short noise (length < 2):', text);
      }
    });

    // 监听错误（静默处理，不影响录音）
    this.browserSTT.onError((error: Error) => {
      console.warn('[HybridSTT] Browser STT error (ignored):', error.message);
      // 不要让浏览器 STT 的错误影响混合模式的录音状态
      // 即使浏览器 STT 失败，我们仍然有 MediaRecorder 在录音
      // 并且有初始计时器会触发自动停止
    });
  }

  /**
   * 停止录音并使用 Whisper 识别
   */
  public async stopRecording(): Promise<string> {
    if (!this.isRecording) {
      throw new Error('当前没有正在进行的录音');
    }

    console.log('[HybridSTT] Stopping recording...');

    try {
      // 1. 停止浏览器 STT
      if (this.browserSTT.getIsRecording()) {
        await this.browserSTT.stopRecording();
      }

      // 2. 清除静音计时器
      if (this.silenceTimer) {
        clearInterval(this.silenceTimer as any);
        this.silenceTimer = null;
      }

      // 3. 停止 MediaRecorder
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        await new Promise<void>((resolve) => {
          if (!this.mediaRecorder) {
            resolve();
            return;
          }

          this.mediaRecorder.onstop = () => {
            console.log('[HybridSTT] MediaRecorder stopped');
            resolve();
          };

          this.mediaRecorder.stop();
        });
      }

      // 4. 停止媒体流
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach(track => track.stop());
        this.mediaStream = null;
      }

      this.isRecording = false;
      this.hasTriggeredStop = false; // 重置标志，准备下次录音

      // 5. 创建音频 Blob
      if (this.audioChunks.length === 0) {
        console.log('[HybridSTT] No audio recorded');
        return '';
      }

      const audioBlob = new Blob(this.audioChunks, { type: this.audioChunks[0].type });
      console.log('[HybridSTT] Audio recorded, size:', audioBlob.size, 'bytes');

      // 6. 如果录音太短，返回空字符串
      // 提高阈值到 15KB，过滤掉背景噪音和环境音
      if (audioBlob.size < 15000) {
        console.log('[HybridSTT] Audio too short (size:', audioBlob.size, 'bytes), skipping transcription');
        return '';
      }

      // 7. 使用 Whisper 进行高精度识别
      console.log('[HybridSTT] Sending to Whisper API for transcription...');
      const text = await this.transcribeWithWhisper(audioBlob);
      
      console.log('[HybridSTT] Final transcription:', text);
      return text;
    } catch (error) {
      console.error('[HybridSTT] Stop recording error:', error);
      this.cleanup();
      throw error;
    }
  }

  /**
   * 使用 Whisper 转录音频（优化版：直接发送 WebM，跳过转换）
   */
  private async transcribeWithWhisper(audioBlob: Blob): Promise<string> {
    try {
      // 优化：直接使用原始格式，Whisper 支持 webm/ogg/mp3/wav 等多种格式
      // 跳过 WAV 转换可以节省 0.3-0.5 秒
      const fileName = audioBlob.type.includes('webm') ? 'audio.webm' : 
                       audioBlob.type.includes('ogg') ? 'audio.ogg' : 
                       'audio.wav';
      
      const audioFile = new File([audioBlob], fileName, { type: audioBlob.type });

      // 创建 FormData
      const formData = new FormData();
      formData.append('file', audioFile, fileName);
      formData.append('model', 'whisper-1');
      formData.append('language', 'en');
      formData.append('temperature', '0');  // 0 = 更快，更确定
      formData.append('response_format', 'json');

      // 发送到 Whisper API
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(this.whisperSTT as any).apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Whisper API error: ${error.error?.message || response.statusText}`);
      }

      const result = await response.json();
      return result.text.trim();
    } catch (error) {
      console.error('[HybridSTT] Whisper transcription error:', error);
      throw error;
    }
  }

  /**
   * 转换音频为 WAV 格式
   */
  private async convertToWav(blob: Blob): Promise<File> {
    if (blob.type.includes('wav')) {
      return new File([blob], 'audio.wav', { type: 'audio/wav' });
    }

    try {
      const audioContext = new AudioContext();
      const arrayBuffer = await blob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const wavBlob = await this.audioBufferToWav(audioBuffer);
      return new File([wavBlob], 'audio.wav', { type: 'audio/wav' });
    } catch (error) {
      console.warn('[HybridSTT] WAV conversion failed, using original format:', error);
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
        console.log('[HybridSTT] Using MIME type:', type);
        return type;
      }
    }

    console.warn('[HybridSTT] No supported MIME type found, using default');
    return '';
  }

  /**
   * 设置自动停止回调
   */
  public onAutoStop(callback: () => void): void {
    this.autoStopCallback = callback;
  }

  /**
   * 获取当前录音状态
   */
  public getIsRecording(): boolean {
    return this.isRecording;
  }

  /**
   * 获取音频 Blob
   */
  public getAudioBlob(): Blob | null {
    if (this.audioChunks.length === 0) {
      return null;
    }
    return new Blob(this.audioChunks, { type: this.audioChunks[0].type });
  }

  /**
   * 获取识别置信度（Whisper 默认高置信度）
   */
  public getConfidence(): number {
    return 0.95;
  }

  /**
   * 清理资源
   */
  private cleanup(): void {
    if (this.silenceTimer) {
      clearInterval(this.silenceTimer as any);
      this.silenceTimer = null;
    }

    if (this.browserSTT.getIsRecording()) {
      this.browserSTT.abort();
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    this.audioChunks = [];
    this.isRecording = false;
  }

  /**
   * 中止录音
   */
  public abort(): void {
    console.log('[HybridSTT] Aborting recording');
    this.cleanup();
  }
}
