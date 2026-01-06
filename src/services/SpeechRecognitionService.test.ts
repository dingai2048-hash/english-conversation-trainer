/**
 * Unit tests for SpeechRecognitionService
 * Tests various recognition scenarios and error handling
 * Requirements: 2.4, 3.1, 3.4
 */

import { SpeechRecognitionService } from './SpeechRecognitionService';

/**
 * Mock Web Speech API
 */
class MockSpeechRecognition {
  continuous = false;
  interimResults = false;
  lang = '';
  maxAlternatives = 1;
  
  onresult: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;
  onend: (() => void) | null = null;
  onaudiostart: (() => void) | null = null;
  onaudioend: (() => void) | null = null;
  onnomatch: (() => void) | null = null;
  onsoundstart: (() => void) | null = null;
  onsoundend: (() => void) | null = null;
  onspeechstart: (() => void) | null = null;
  onspeechend: (() => void) | null = null;
  onstart: (() => void) | null = null;

  private started = false;

  start() {
    if (this.started) {
      throw new Error('Recognition already started');
    }
    this.started = true;
    if (this.onstart) {
      this.onstart();
    }
  }

  stop() {
    this.started = false;
    if (this.onend) {
      this.onend();
    }
  }

  abort() {
    this.started = false;
    if (this.onend) {
      this.onend();
    }
  }

  // Helper method to simulate recognition result
  simulateResult(transcript: string, isFinal: boolean = true) {
    if (this.onresult) {
      const event = {
        results: [
          {
            0: { transcript, confidence: 0.9 },
            isFinal,
            length: 1,
            item: (index: number) => ({ transcript, confidence: 0.9 }),
          },
        ],
        resultIndex: 0,
      };
      this.onresult(event);
    }
  }

  // Helper method to simulate error
  simulateError(errorType: string) {
    if (this.onerror) {
      const event = {
        error: errorType,
        message: `Error: ${errorType}`,
      };
      this.onerror(event);
    }
  }
}

describe('SpeechRecognitionService', () => {
  let mockRecognition: MockSpeechRecognition;
  let originalSpeechRecognition: any;

  beforeEach(() => {
    // Create mock and store original
    mockRecognition = new MockSpeechRecognition();
    originalSpeechRecognition = (window as any).SpeechRecognition;
    
    // Set up mock
    (window as any).SpeechRecognition = jest.fn(() => mockRecognition);
    (window as any).webkitSpeechRecognition = jest.fn(() => mockRecognition);
  });

  afterEach(() => {
    // Restore original
    if (originalSpeechRecognition) {
      (window as any).SpeechRecognition = originalSpeechRecognition;
    } else {
      delete (window as any).SpeechRecognition;
    }
    delete (window as any).webkitSpeechRecognition;
  });

  describe('Browser Support', () => {
    it('should detect when speech recognition is supported', () => {
      const service = new SpeechRecognitionService();
      expect(service.isSupported()).toBe(true);
    });

    it('should detect when speech recognition is not supported', () => {
      delete (window as any).SpeechRecognition;
      delete (window as any).webkitSpeechRecognition;
      
      const service = new SpeechRecognitionService();
      expect(service.isSupported()).toBe(false);
    });

    it('should throw error when starting recording on unsupported browser', async () => {
      delete (window as any).SpeechRecognition;
      delete (window as any).webkitSpeechRecognition;
      
      const service = new SpeechRecognitionService();
      
      await expect(service.startRecording()).rejects.toThrow(
        'Speech recognition is not supported in this browser'
      );
    });
  });

  describe('Recording Control', () => {
    it('should start recording successfully', async () => {
      const service = new SpeechRecognitionService();
      
      await service.startRecording();
      
      expect(service.getIsRecording()).toBe(true);
    });

    it('should stop recording successfully', async () => {
      const service = new SpeechRecognitionService();
      
      await service.startRecording();
      await service.stopRecording();
      
      expect(service.getIsRecording()).toBe(false);
    });

    it('should throw error when starting recording while already recording', async () => {
      const service = new SpeechRecognitionService();
      
      await service.startRecording();
      
      await expect(service.startRecording()).rejects.toThrow(
        'Recording is already in progress'
      );
    });

    it('should handle stop when not recording', async () => {
      const service = new SpeechRecognitionService();
      
      const result = await service.stopRecording();
      
      expect(result).toBe('');
      expect(service.getIsRecording()).toBe(false);
    });

    it('should abort recording', async () => {
      const service = new SpeechRecognitionService();
      
      await service.startRecording();
      service.abort();
      
      expect(service.getIsRecording()).toBe(false);
    });
  });

  describe('Recognition Results', () => {
    it('should recognize speech and return transcript', async () => {
      const service = new SpeechRecognitionService();
      const expectedText = 'Hello, how are you?';
      
      let recognizedText = '';
      service.onResult((text) => {
        recognizedText = text;
      });
      
      await service.startRecording();
      mockRecognition.simulateResult(expectedText);
      
      expect(recognizedText).toBe(expectedText);
    });

    it('should return recognized text when stopping', async () => {
      const service = new SpeechRecognitionService();
      const expectedText = 'Test message';
      
      await service.startRecording();
      mockRecognition.simulateResult(expectedText);
      
      const result = await service.stopRecording();
      
      expect(result).toBe(expectedText);
    });

    it('should handle multiple recognition sessions', async () => {
      const service = new SpeechRecognitionService();
      
      // First session
      await service.startRecording();
      mockRecognition.simulateResult('First message');
      await service.stopRecording();
      
      // Second session
      await service.startRecording();
      mockRecognition.simulateResult('Second message');
      const result = await service.stopRecording();
      
      expect(result).toBe('Second message');
    });

    it('should only process final results', async () => {
      const service = new SpeechRecognitionService();
      
      let callCount = 0;
      service.onResult(() => {
        callCount++;
      });
      
      await service.startRecording();
      
      // Simulate interim result (should be ignored)
      mockRecognition.simulateResult('Interim', false);
      expect(callCount).toBe(0);
      
      // Simulate final result (should be processed)
      mockRecognition.simulateResult('Final', true);
      expect(callCount).toBe(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle no-speech error', async () => {
      const service = new SpeechRecognitionService();
      
      let errorMessage = '';
      service.onError((error) => {
        errorMessage = error.message;
      });
      
      await service.startRecording();
      mockRecognition.simulateError('no-speech');
      
      expect(errorMessage).toContain('No speech was detected');
      expect(service.getIsRecording()).toBe(false);
    });

    it('should handle audio-capture error', async () => {
      const service = new SpeechRecognitionService();
      
      let errorMessage = '';
      service.onError((error) => {
        errorMessage = error.message;
      });
      
      await service.startRecording();
      mockRecognition.simulateError('audio-capture');
      
      expect(errorMessage).toContain('No microphone was found');
    });

    it('should handle not-allowed error', async () => {
      const service = new SpeechRecognitionService();
      
      let errorMessage = '';
      service.onError((error) => {
        errorMessage = error.message;
      });
      
      await service.startRecording();
      mockRecognition.simulateError('not-allowed');
      
      expect(errorMessage).toContain('Microphone permission was denied');
    });

    it('should handle network error', async () => {
      const service = new SpeechRecognitionService();
      
      let errorMessage = '';
      service.onError((error) => {
        errorMessage = error.message;
      });
      
      await service.startRecording();
      mockRecognition.simulateError('network');
      
      expect(errorMessage).toContain('Network error occurred');
    });

    it('should handle aborted error', async () => {
      const service = new SpeechRecognitionService();
      
      let errorMessage = '';
      service.onError((error) => {
        errorMessage = error.message;
      });
      
      await service.startRecording();
      mockRecognition.simulateError('aborted');
      
      expect(errorMessage).toContain('Speech recognition was aborted');
    });

    it('should handle unknown error', async () => {
      const service = new SpeechRecognitionService();
      
      let errorMessage = '';
      service.onError((error) => {
        errorMessage = error.message;
      });
      
      await service.startRecording();
      mockRecognition.simulateError('unknown-error');
      
      expect(errorMessage).toContain('Speech recognition error');
    });

    it('should set recording to false after error', async () => {
      const service = new SpeechRecognitionService();
      
      await service.startRecording();
      expect(service.getIsRecording()).toBe(true);
      
      mockRecognition.simulateError('no-speech');
      
      expect(service.getIsRecording()).toBe(false);
    });
  });

  describe('Configuration', () => {
    it('should configure recognition for English language', () => {
      new SpeechRecognitionService();
      
      expect(mockRecognition.lang).toBe('en-US');
    });

    it('should configure recognition to be continuous', () => {
      new SpeechRecognitionService();
      
      expect(mockRecognition.continuous).toBe(true);
    });

    it('should configure recognition to use interim results', () => {
      new SpeechRecognitionService();
      
      expect(mockRecognition.interimResults).toBe(true);
    });

    it('should configure max alternatives to 1', () => {
      new SpeechRecognitionService();
      
      expect(mockRecognition.maxAlternatives).toBe(1);
    });
  });

  describe('Callback Registration', () => {
    it('should register result callback', async () => {
      const service = new SpeechRecognitionService();
      const callback = jest.fn();
      
      service.onResult(callback);
      
      await service.startRecording();
      mockRecognition.simulateResult('Test');
      
      expect(callback).toHaveBeenCalledWith('Test');
    });

    it('should register error callback', async () => {
      const service = new SpeechRecognitionService();
      const callback = jest.fn();
      
      service.onError(callback);
      
      await service.startRecording();
      mockRecognition.simulateError('no-speech');
      
      expect(callback).toHaveBeenCalled();
      expect(callback.mock.calls[0][0]).toBeInstanceOf(Error);
    });

    it('should allow updating callbacks', async () => {
      const service = new SpeechRecognitionService();
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      service.onResult(callback1);
      service.onResult(callback2);
      
      await service.startRecording();
      mockRecognition.simulateResult('Test');
      
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledWith('Test');
    });
  });
});
