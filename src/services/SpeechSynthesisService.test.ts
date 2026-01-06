/**
 * Tests for Speech Synthesis Service
 */

import { SpeechSynthesisService } from './SpeechSynthesisService';

// Mock SpeechSynthesisUtterance
class MockSpeechSynthesisUtterance {
  text: string;
  lang: string = 'en-US';
  rate: number = 1;
  pitch: number = 1;
  volume: number = 1;
  onend: (() => void) | null = null;
  onerror: ((event: any) => void) | null = null;

  constructor(text: string) {
    this.text = text;
  }
}

global.SpeechSynthesisUtterance = MockSpeechSynthesisUtterance as any;

describe('SpeechSynthesisService', () => {
  let service: SpeechSynthesisService;

  beforeEach(() => {
    // Mock speechSynthesis API
    global.speechSynthesis = {
      speak: jest.fn(),
      cancel: jest.fn(),
      pause: jest.fn(),
      resume: jest.fn(),
      getVoices: jest.fn(() => []),
      speaking: false,
      paused: false,
      pending: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    } as any;

    service = new SpeechSynthesisService();
  });

  describe('isSupported', () => {
    it('should return true when speechSynthesis is available', () => {
      expect(service.isSupported()).toBe(true);
    });

    it('should return false when speechSynthesis is not available', () => {
      const originalSpeechSynthesis = (global as any).speechSynthesis;
      delete (global as any).speechSynthesis;
      
      const newService = new SpeechSynthesisService();
      expect(newService.isSupported()).toBe(false);
      
      (global as any).speechSynthesis = originalSpeechSynthesis;
    });
  });

  describe('speak', () => {
    it('should call speechSynthesis.speak with correct parameters', async () => {
      const text = 'Hello world';
      const speakPromise = service.speak(text);

      // Simulate successful speech
      const utterance = (global.speechSynthesis.speak as jest.Mock).mock.calls[0][0];
      if (utterance.onend) {
        utterance.onend();
      }

      await speakPromise;

      expect(global.speechSynthesis.speak).toHaveBeenCalled();
    });

    it('should use English language by default', async () => {
      const text = 'Hello';
      const speakPromise = service.speak(text);

      const utterance = (global.speechSynthesis.speak as jest.Mock).mock.calls[0][0];
      expect(utterance.lang).toBe('en-US');
      
      if (utterance.onend) {
        utterance.onend();
      }
      await speakPromise;
    });

    it('should handle speech errors', async () => {
      const text = 'Hello';
      const speakPromise = service.speak(text);

      const utterance = (global.speechSynthesis.speak as jest.Mock).mock.calls[0][0];
      if (utterance.onerror) {
        utterance.onerror({ error: 'test-error' });
      }

      await expect(speakPromise).rejects.toThrow('Speech synthesis error');
    });
  });

  describe('stop', () => {
    it('should call speechSynthesis.cancel', () => {
      (global.speechSynthesis as any).speaking = true;
      service.stop();
      expect(global.speechSynthesis.cancel).toHaveBeenCalled();
    });
  });

  describe('isSpeaking', () => {
    it('should return current speaking state', () => {
      (global.speechSynthesis as any).speaking = true;
      expect(service.isSpeaking()).toBe(true);

      (global.speechSynthesis as any).speaking = false;
      expect(service.isSpeaking()).toBe(false);
    });
  });
});
