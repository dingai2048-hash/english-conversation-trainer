/**
 * Core type definitions for the English Conversation Trainer
 */

/**
 * Message role - either from the user or the AI assistant (Koala)
 */
export type MessageRole = 'user' | 'assistant';

/**
 * Message model representing a single conversation message
 */
export interface Message {
  /** Unique identifier for the message */
  id: string;
  /** Role of the message sender */
  role: MessageRole;
  /** English content of the message */
  content: string;
  /** Optional Chinese translation */
  translation?: string;
  /** Timestamp when the message was created */
  timestamp: Date;
}

/**
 * Application state model
 */
export interface AppState {
  /** List of conversation messages */
  messages: Message[];
  /** Whether the system is currently recording voice input */
  isRecording: boolean;
  /** Whether the system is processing (recognizing speech or waiting for AI) */
  isProcessing: boolean;
  /** Whether to show Chinese translations */
  showTranslation: boolean;
  /** Current error message, if any */
  error: string | null;
  /** Whether the AI is currently speaking (TTS) */
  isSpeaking: boolean;
}

/**
 * Speech recognition result from Web Speech API
 */
export interface RecognitionResult {
  /** Recognized text */
  text: string;
  /** Confidence level (0-1) */
  confidence: number;
  /** Whether this is the final result */
  isFinal: boolean;
}

/**
 * AI response model
 */
export interface AIResponse {
  /** AI-generated English content */
  content: string;
  /** Chinese translation of the content */
  translation: string;
}

/**
 * Error types for better error handling
 */
export type ErrorType = 
  | 'permission'      // Microphone permission denied
  | 'recognition'     // Speech recognition error
  | 'ai'              // AI service error
  | 'translation'     // Translation service error
  | 'network';        // Network error

/**
 * Error state model
 */
export interface ErrorState {
  /** Type of error */
  type: ErrorType;
  /** Human-readable error message */
  message: string;
  /** Whether the error is recoverable */
  recoverable: boolean;
  /** Optional retry action */
  retryAction?: () => void;
}

/**
 * Props for KoalaCharacter component
 */
export interface KoalaCharacterProps {
  /** Whether the system is listening to voice input */
  isListening: boolean;
  /** Whether the AI is thinking/processing */
  isThinking: boolean;
}

/**
 * Props for MicButton component
 */
export interface MicButtonProps {
  /** Whether recording is active */
  isRecording: boolean;
  /** Callback when recording is toggled */
  onToggleRecording: () => void;
  /** Whether the button is disabled */
  disabled: boolean;
}

/**
 * Props for ConversationDisplay component
 */
export interface ConversationDisplayProps {
  /** List of messages to display */
  messages: Message[];
  /** Whether to show translations */
  showTranslation: boolean;
  /** Callback to request pronunciation feedback */
  onRequestFeedback?: (messageId: string) => void;
}

/**
 * Props for TranslationToggle component
 */
export interface TranslationToggleProps {
  /** Whether translation is enabled */
  enabled: boolean;
  /** Callback when toggle is clicked */
  onToggle: () => void;
}

/**
 * Speech recognition service interface
 */
export interface SpeechRecognitionService {
  /** Start recording voice input */
  startRecording(): Promise<void>;
  /** Stop recording and get the recognized text */
  stopRecording(): Promise<string>;
  /** Check if speech recognition is supported */
  isSupported(): boolean;
  /** Register callback for recognition results */
  onResult(callback: (text: string) => void): void;
  /** Register callback for errors */
  onError(callback: (error: Error) => void): void;
}

/**
 * AI conversation service interface
 */
export interface AIConversationService {
  /** Send a message to the AI and get a response */
  sendMessage(message: string, history: Message[]): Promise<string>;
  /** Translate English text to Chinese */
  translateToZh(text: string): Promise<string>;
}
