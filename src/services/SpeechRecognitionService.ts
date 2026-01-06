/**
 * Speech Recognition Service
 * Wraps the Web Speech API for voice input recognition
 * Requirements: 2.1, 2.3, 2.4, 3.1, 3.4, 3.5
 */

import { SpeechRecognitionService as ISpeechRecognitionService } from '../types';

/**
 * Type definitions for Web Speech API
 * (These are not included in standard TypeScript definitions)
 */
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onaudiostart: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onaudioend: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onend: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: ISpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onnomatch: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: ISpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onsoundstart: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onsoundend: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onstart: ((this: ISpeechRecognition, ev: Event) => any) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }
}

/**
 * Implementation of Speech Recognition Service using Web Speech API
 */
export class SpeechRecognitionService implements ISpeechRecognitionService {
  private recognition: ISpeechRecognition | null = null;
  private isRecording: boolean = false;
  private recognizedText: string = '';
  private resultCallback: ((text: string) => void) | null = null;
  private errorCallback: ((error: Error) => void) | null = null;

  constructor() {
    if (this.isSupported()) {
      this.initializeRecognition();
    }
  }

  /**
   * Check if speech recognition is supported in the current browser
   */
  public isSupported(): boolean {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  /**
   * Initialize the speech recognition instance
   */
  private initializeRecognition(): void {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognitionAPI();

    // Configure recognition settings
    this.recognition.continuous = true; // Continue listening
    this.recognition.interimResults = true; // Show interim results
    this.recognition.lang = 'en-US'; // English language
    this.recognition.maxAlternatives = 1;

    // Set up event handlers
    this.recognition.onresult = this.handleResult.bind(this);
    this.recognition.onerror = this.handleError.bind(this);
    this.recognition.onend = this.handleEnd.bind(this);
  }

  /**
   * Handle recognition results
   */
  private handleResult(event: SpeechRecognitionEvent): void {
    const results = event.results;
    
    if (results.length > 0) {
      // Get the latest result
      let transcript = '';
      
      // Collect all final results
      for (let i = event.resultIndex; i < results.length; i++) {
        const result = results[i];
        if (result.isFinal) {
          transcript += result[0].transcript + ' ';
        }
      }
      
      // Update recognized text if we have final results
      if (transcript.trim()) {
        this.recognizedText += transcript;
        
        if (this.resultCallback) {
          this.resultCallback(this.recognizedText.trim());
        }
      }
    }
  }

  /**
   * Handle recognition errors
   */
  private handleError(event: SpeechRecognitionErrorEvent): void {
    let errorMessage: string;

    switch (event.error) {
      case 'no-speech':
        errorMessage = 'No speech was detected. Please try again.';
        break;
      case 'audio-capture':
        errorMessage = 'No microphone was found. Please ensure a microphone is connected.';
        break;
      case 'not-allowed':
        errorMessage = 'Microphone permission was denied. Please allow microphone access.';
        break;
      case 'network':
        errorMessage = 'Network error occurred. Please check your connection.';
        break;
      case 'aborted':
        errorMessage = 'Speech recognition was aborted.';
        break;
      default:
        errorMessage = `Speech recognition error: ${event.error}`;
    }

    const error = new Error(errorMessage);
    
    if (this.errorCallback) {
      this.errorCallback(error);
    }

    this.isRecording = false;
  }

  /**
   * Handle recognition end
   */
  private handleEnd(): void {
    this.isRecording = false;
  }

  /**
   * Start recording voice input
   */
  public async startRecording(): Promise<void> {
    if (!this.isSupported()) {
      throw new Error('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
    }

    if (this.isRecording) {
      throw new Error('Recording is already in progress.');
    }

    if (!this.recognition) {
      this.initializeRecognition();
    }

    try {
      this.recognizedText = '';
      this.isRecording = true;
      this.recognition!.start();
    } catch (error) {
      this.isRecording = false;
      throw new Error('Failed to start speech recognition. Please try again.');
    }
  }

  /**
   * Stop recording and return the recognized text
   */
  public async stopRecording(): Promise<string> {
    if (!this.isRecording) {
      return this.recognizedText;
    }

    if (this.recognition) {
      this.recognition.stop();
    }

    // Wait for the final result to be processed
    await new Promise(resolve => setTimeout(resolve, 500));

    const result = this.recognizedText.trim();
    this.isRecording = false;

    return result;
  }

  /**
   * Register a callback for recognition results
   */
  public onResult(callback: (text: string) => void): void {
    this.resultCallback = callback;
  }

  /**
   * Register a callback for errors
   */
  public onError(callback: (error: Error) => void): void {
    this.errorCallback = callback;
  }

  /**
   * Abort current recognition
   */
  public abort(): void {
    if (this.recognition && this.isRecording) {
      this.recognition.abort();
      this.isRecording = false;
    }
  }

  /**
   * Get current recording state
   */
  public getIsRecording(): boolean {
    return this.isRecording;
  }
}

/**
 * Create and export a singleton instance
 */
export const speechRecognitionService = new SpeechRecognitionService();
