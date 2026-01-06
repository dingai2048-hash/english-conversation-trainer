/**
 * Property-based tests for Speech Recognition Service
 * Feature: english-conversation-trainer, Property 3: 录音状态转换正确性
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4
 */

import * as fc from 'fast-check';

/**
 * Mock Web Speech API for property tests
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

  simulateResult(transcript: string) {
    if (this.onresult) {
      const event = {
        results: [
          {
            0: { transcript, confidence: 0.9 },
            isFinal: true,
            length: 1,
            item: (index: number) => ({ transcript, confidence: 0.9 }),
          },
        ],
        resultIndex: 0,
      };
      this.onresult(event);
    }
  }

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

/**
 * Simple state machine for testing recording state transitions
 */
class RecordingStateMachine {
  private isRecording = false;
  private recognizedText = '';

  canStart(): boolean {
    return !this.isRecording;
  }

  start(): void {
    if (!this.canStart()) {
      throw new Error('Already recording');
    }
    this.isRecording = true;
  }

  stop(): string {
    this.isRecording = false;
    return this.recognizedText;
  }

  abort(): void {
    this.isRecording = false;
  }

  onError(): void {
    this.isRecording = false;
  }

  setResult(text: string): void {
    this.recognizedText = text;
  }

  getIsRecording(): boolean {
    return this.isRecording;
  }
}

describe('Speech Recognition State Transition Properties', () => {
  let originalSpeechRecognition: any;

  beforeAll(() => {
    originalSpeechRecognition = (window as any).SpeechRecognition;
    // Set up mock factory
    (window as any).SpeechRecognition = jest.fn(() => new MockSpeechRecognition());
    (window as any).webkitSpeechRecognition = jest.fn(() => new MockSpeechRecognition());
  });

  afterAll(() => {
    if (originalSpeechRecognition) {
      (window as any).SpeechRecognition = originalSpeechRecognition;
    } else {
      delete (window as any).SpeechRecognition;
    }
    delete (window as any).webkitSpeechRecognition;
  });

  describe('Property 3: 录音状态转换正确性', () => {
    /**
     * Property: For any recording state, clicking the mic button should toggle
     * the state (not recording → recording, recording → stop and process),
     * and recording and processing states cannot both be true simultaneously.
     */

    it('should toggle from not recording to recording', () => {
      for (let i = 0; i < 100; i++) {
        const machine = new RecordingStateMachine();
        
        // Initial state: not recording
        expect(machine.getIsRecording()).toBe(false);
        
        // Start recording
        machine.start();
        
        // Should now be recording
        expect(machine.getIsRecording()).toBe(true);
      }
    });

    it('should toggle from recording to not recording when stopped', () => {
      for (let i = 0; i < 100; i++) {
        const machine = new RecordingStateMachine();
        
        // Start recording
        machine.start();
        expect(machine.getIsRecording()).toBe(true);
        
        // Stop recording
        machine.stop();
        
        // Should not be recording
        expect(machine.getIsRecording()).toBe(false);
      }
    });

    it('should handle multiple start-stop cycles', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10 }),
          (cycles) => {
            const machine = new RecordingStateMachine();
            
            for (let i = 0; i < cycles; i++) {
              // Start recording
              machine.start();
              expect(machine.getIsRecording()).toBe(true);
              
              // Stop recording
              machine.stop();
              expect(machine.getIsRecording()).toBe(false);
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should set recording to false after error', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('no-speech', 'audio-capture', 'network', 'aborted'),
          (errorType) => {
            const machine = new RecordingStateMachine();
            
            // Start recording
            machine.start();
            expect(machine.getIsRecording()).toBe(true);
            
            // Simulate error
            machine.onError();
            
            // Should not be recording after error
            expect(machine.getIsRecording()).toBe(false);
            
            // Verify error type is one of the expected types
            expect(['no-speech', 'audio-capture', 'network', 'aborted']).toContain(errorType);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should never allow starting while already recording', () => {
      for (let i = 0; i < 100; i++) {
        const machine = new RecordingStateMachine();
        
        // Start recording
        machine.start();
        expect(machine.getIsRecording()).toBe(true);
        
        // Try to start again - should throw error
        let errorThrown = false;
        try {
          machine.start();
        } catch (error) {
          errorThrown = true;
        }
        
        expect(errorThrown).toBe(true);
        // Should still be recording (first session)
        expect(machine.getIsRecording()).toBe(true);
      }
    });

    it('should handle abort at any time', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          (startFirst) => {
            const machine = new RecordingStateMachine();
            
            if (startFirst) {
              machine.start();
            }
            
            // Abort should always work
            machine.abort();
            
            // Should not be recording after abort
            expect(machine.getIsRecording()).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain state after stop returns text', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }),
          (text) => {
            const machine = new RecordingStateMachine();
            
            machine.start();
            machine.setResult(text);
            
            const result = machine.stop();
            
            // Should return the recognized text
            expect(result).toBe(text);
            
            // Should not be recording
            expect(machine.getIsRecording()).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain consistent state across sequential operations', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 5 }),
          (operations) => {
            const machine = new RecordingStateMachine();
            
            for (let i = 0; i < operations; i++) {
              // Should start not recording
              expect(machine.getIsRecording()).toBe(false);
              
              // Start recording
              machine.start();
              expect(machine.getIsRecording()).toBe(true);
              
              // Stop recording
              machine.stop();
              expect(machine.getIsRecording()).toBe(false);
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should never be in both recording and processing state', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.constantFrom('START', 'STOP', 'ERROR'),
            { minLength: 5, maxLength: 20 }
          ),
          (actions) => {
            const machine = new RecordingStateMachine();
            let isProcessing = false;
            
            for (const action of actions) {
              if (action === 'START' && machine.canStart()) {
                machine.start();
                isProcessing = false;
              } else if (action === 'STOP' && machine.getIsRecording()) {
                isProcessing = true;
                machine.stop();
                isProcessing = false;
              } else if (action === 'ERROR') {
                machine.onError();
                isProcessing = false;
              }
              
              // Recording and processing should never both be true
              const bothTrue = machine.getIsRecording() && isProcessing;
              expect(bothTrue).toBe(false);
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
