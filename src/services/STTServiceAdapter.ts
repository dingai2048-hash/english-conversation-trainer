/**
 * STT Service Adapter
 * 统一 SpeechRecognitionService 和 WhisperSTTService 的接口
 */

import { SpeechRecognitionService } from './SpeechRecognitionService';
import { WhisperSTTService } from './WhisperSTTService';

export type STTService = SpeechRecognitionService | WhisperSTTService;

/**
 * 检查服务是否支持
 */
export function isSTTSupported(service: STTService): boolean {
  return service.isSupported();
}

/**
 * 开始录音
 */
export async function startSTTRecording(service: STTService): Promise<void> {
  return service.startRecording();
}

/**
 * 停止录音并获取文本
 */
export async function stopSTTRecording(service: STTService): Promise<string> {
  return service.stopRecording();
}

/**
 * 获取录音状态
 */
export function getSTTIsRecording(service: STTService): boolean {
  return service.getIsRecording();
}

/**
 * 获取音频 Blob（用于发音评估）
 */
export function getSTTAudioBlob(service: STTService): Blob | null {
  return service.getAudioBlob();
}

/**
 * 获取识别置信度（仅 SpeechRecognitionService 支持）
 */
export function getSTTConfidence(service: STTService): number {
  if (service instanceof SpeechRecognitionService) {
    return service.getConfidence();
  }
  // Whisper 没有置信度，返回默认高置信度
  return 0.95;
}

/**
 * 设置自动停止回调（仅 SpeechRecognitionService 支持）
 */
export function setSTTAutoStopCallback(
  service: STTService,
  callback: () => void
): void {
  if (service instanceof SpeechRecognitionService) {
    service.onAutoStop(callback);
  }
  // Whisper 不支持自动停止，忽略
}

/**
 * 检查是否支持自动停止
 */
export function supportsAutoStop(service: STTService): boolean {
  return service instanceof SpeechRecognitionService;
}
