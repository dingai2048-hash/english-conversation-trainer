/**
 * Application Context for global state management
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AppState, Message, MessageRole } from '../types';

/**
 * Context value type including state and actions
 */
interface AppContextValue extends AppState {
  // Message actions
  addMessage: (role: MessageRole, content: string, translation?: string) => void;
  clearMessages: () => void;
  
  // Recording state actions
  setRecording: (isRecording: boolean) => void;
  
  // Processing state actions
  setProcessing: (isProcessing: boolean) => void;
  
  // Speaking state actions
  setSpeaking: (isSpeaking: boolean) => void;
  
  // Translation toggle actions
  toggleTranslation: () => void;
  setShowTranslation: (show: boolean) => void;
  
  // Error handling actions
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Continuous mode actions
  setContinuousMode: (isContinuous: boolean) => void;
  toggleContinuousMode: () => void;
  
  // Session state actions
  isInSession: boolean;
  startSession: () => void;
  endSession: () => void;
}

/**
 * Initial application state
 */
const initialState: AppState = {
  messages: [],
  isRecording: false,
  isProcessing: false,
  showTranslation: false,
  error: null,
  isSpeaking: false,
  isContinuousMode: false,
};

const initialSessionState = {
  isInSession: false,
};

/**
 * Create the context with undefined default value
 */
const AppContext = createContext<AppContextValue | undefined>(undefined);

/**
 * Props for AppProvider component
 */
interface AppProviderProps {
  children: ReactNode;
}

/**
 * AppProvider component that wraps the application
 */
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>(initialState.messages);
  const [isRecording, setIsRecording] = useState<boolean>(initialState.isRecording);
  const [isProcessing, setIsProcessing] = useState<boolean>(initialState.isProcessing);
  const [showTranslation, setShowTranslationState] = useState<boolean>(initialState.showTranslation);
  const [error, setErrorState] = useState<string | null>(initialState.error);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(initialState.isSpeaking);
  const [isContinuousMode, setIsContinuousModeState] = useState<boolean>(initialState.isContinuousMode);
  const [isInSession, setIsInSession] = useState<boolean>(initialSessionState.isInSession);

  /**
   * Add a new message to the conversation
   */
  const addMessage = useCallback((role: MessageRole, content: string, translation?: string) => {
    const newMessage: Message = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role,
      content,
      translation,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newMessage]);
  }, []);

  /**
   * Clear all messages
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  /**
   * Set recording state
   */
  const setRecording = useCallback((recording: boolean) => {
    setIsRecording(recording);
  }, []);

  /**
   * Set processing state
   */
  const setProcessing = useCallback((processing: boolean) => {
    setIsProcessing(processing);
  }, []);

  /**
   * Set speaking state
   */
  const setSpeaking = useCallback((speaking: boolean) => {
    setIsSpeaking(speaking);
  }, []);

  /**
   * Toggle translation display
   */
  const toggleTranslation = useCallback(() => {
    setShowTranslationState(prev => !prev);
  }, []);

  /**
   * Set translation display state
   */
  const setShowTranslation = useCallback((show: boolean) => {
    setShowTranslationState(show);
  }, []);

  /**
   * Set error message
   */
  const setError = useCallback((errorMessage: string | null) => {
    setErrorState(errorMessage);
  }, []);

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setErrorState(null);
  }, []);

  /**
   * Set continuous mode state
   */
  const setContinuousMode = useCallback((isContinuous: boolean) => {
    setIsContinuousModeState(isContinuous);
  }, []);

  /**
   * Toggle continuous mode
   */
  const toggleContinuousMode = useCallback(() => {
    setIsContinuousModeState(prev => !prev);
  }, []);

  /**
   * Start a conversation session
   */
  const startSession = useCallback(() => {
    setIsInSession(true);
    setMessages([]); // Clear previous messages when starting new session
  }, []);

  /**
   * End a conversation session
   */
  const endSession = useCallback(() => {
    setIsInSession(false);
  }, []);

  const value: AppContextValue = {
    messages,
    isRecording,
    isProcessing,
    showTranslation,
    error,
    isSpeaking,
    isContinuousMode,
    isInSession,
    addMessage,
    clearMessages,
    setRecording,
    setProcessing,
    setSpeaking,
    toggleTranslation,
    setShowTranslation,
    setError,
    clearError,
    setContinuousMode,
    toggleContinuousMode,
    startSession,
    endSession,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

/**
 * Custom hook to use the AppContext
 * Throws an error if used outside of AppProvider
 */
export const useAppContext = (): AppContextValue => {
  const context = useContext(AppContext);
  
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  
  return context;
};
