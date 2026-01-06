/**
 * Unit tests for AppContext state management
 * Tests state update logic and edge cases
 * Requirements: 2.1, 5.2
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { AppProvider, useAppContext } from './AppContext';

/**
 * Wrapper component for testing hooks
 */
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AppProvider>{children}</AppProvider>
);

describe('AppContext', () => {
  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });

      expect(result.current.messages).toEqual([]);
      expect(result.current.isRecording).toBe(false);
      expect(result.current.isProcessing).toBe(false);
      expect(result.current.showTranslation).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });

  describe('Message Management', () => {
    it('should add a user message', () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });

      act(() => {
        result.current.addMessage('user', 'Hello, Koala!');
      });

      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].role).toBe('user');
      expect(result.current.messages[0].content).toBe('Hello, Koala!');
      expect(result.current.messages[0].id).toBeDefined();
      expect(result.current.messages[0].timestamp).toBeInstanceOf(Date);
    });

    it('should add an assistant message with translation', () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });

      act(() => {
        result.current.addMessage('assistant', 'Hello! How are you?', '你好！你好吗？');
      });

      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].role).toBe('assistant');
      expect(result.current.messages[0].content).toBe('Hello! How are you?');
      expect(result.current.messages[0].translation).toBe('你好！你好吗？');
    });

    it('should add multiple messages in order', () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });

      act(() => {
        result.current.addMessage('user', 'First message');
      });

      act(() => {
        result.current.addMessage('assistant', 'Second message');
      });

      act(() => {
        result.current.addMessage('user', 'Third message');
      });

      expect(result.current.messages).toHaveLength(3);
      expect(result.current.messages[0].content).toBe('First message');
      expect(result.current.messages[1].content).toBe('Second message');
      expect(result.current.messages[2].content).toBe('Third message');
    });

    it('should generate unique IDs for each message', () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });

      act(() => {
        result.current.addMessage('user', 'Message 1');
        result.current.addMessage('user', 'Message 2');
        result.current.addMessage('user', 'Message 3');
      });

      const ids = result.current.messages.map(m => m.id);
      const uniqueIds = new Set(ids);
      
      expect(ids.length).toBe(uniqueIds.size);
    });

    it('should clear all messages', () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });

      act(() => {
        result.current.addMessage('user', 'Message 1');
        result.current.addMessage('assistant', 'Message 2');
      });

      expect(result.current.messages).toHaveLength(2);

      act(() => {
        result.current.clearMessages();
      });

      expect(result.current.messages).toHaveLength(0);
    });
  });

  describe('Recording State', () => {
    it('should set recording state to true', () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });

      act(() => {
        result.current.setRecording(true);
      });

      expect(result.current.isRecording).toBe(true);
    });

    it('should set recording state to false', () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });

      act(() => {
        result.current.setRecording(true);
      });

      act(() => {
        result.current.setRecording(false);
      });

      expect(result.current.isRecording).toBe(false);
    });

    it('should toggle recording state multiple times', () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });

      expect(result.current.isRecording).toBe(false);

      act(() => {
        result.current.setRecording(true);
      });
      expect(result.current.isRecording).toBe(true);

      act(() => {
        result.current.setRecording(false);
      });
      expect(result.current.isRecording).toBe(false);

      act(() => {
        result.current.setRecording(true);
      });
      expect(result.current.isRecording).toBe(true);
    });
  });

  describe('Processing State', () => {
    it('should set processing state to true', () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });

      act(() => {
        result.current.setProcessing(true);
      });

      expect(result.current.isProcessing).toBe(true);
    });

    it('should set processing state to false', () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });

      act(() => {
        result.current.setProcessing(true);
      });

      act(() => {
        result.current.setProcessing(false);
      });

      expect(result.current.isProcessing).toBe(false);
    });
  });

  describe('Translation State', () => {
    it('should toggle translation from false to true', () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });

      expect(result.current.showTranslation).toBe(false);

      act(() => {
        result.current.toggleTranslation();
      });

      expect(result.current.showTranslation).toBe(true);
    });

    it('should toggle translation from true to false', () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });

      act(() => {
        result.current.setShowTranslation(true);
      });

      act(() => {
        result.current.toggleTranslation();
      });

      expect(result.current.showTranslation).toBe(false);
    });

    it('should toggle translation multiple times', () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });

      expect(result.current.showTranslation).toBe(false);

      act(() => {
        result.current.toggleTranslation();
      });
      expect(result.current.showTranslation).toBe(true);

      act(() => {
        result.current.toggleTranslation();
      });
      expect(result.current.showTranslation).toBe(false);

      act(() => {
        result.current.toggleTranslation();
      });
      expect(result.current.showTranslation).toBe(true);
    });

    it('should set translation state directly', () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });

      act(() => {
        result.current.setShowTranslation(true);
      });
      expect(result.current.showTranslation).toBe(true);

      act(() => {
        result.current.setShowTranslation(false);
      });
      expect(result.current.showTranslation).toBe(false);
    });
  });

  describe('Error State', () => {
    it('should set error message', () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });

      act(() => {
        result.current.setError('Test error message');
      });

      expect(result.current.error).toBe('Test error message');
    });

    it('should clear error message', () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });

      act(() => {
        result.current.setError('Test error');
      });

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBe(null);
    });

    it('should update error message', () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });

      act(() => {
        result.current.setError('First error');
      });
      expect(result.current.error).toBe('First error');

      act(() => {
        result.current.setError('Second error');
      });
      expect(result.current.error).toBe('Second error');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty message content', () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });

      act(() => {
        result.current.addMessage('user', '');
      });

      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].content).toBe('');
    });

    it('should handle very long message content', () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });
      const longContent = 'a'.repeat(10000);

      act(() => {
        result.current.addMessage('user', longContent);
      });

      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].content).toBe(longContent);
    });

    it('should handle special characters in messages', () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });
      const specialContent = '你好！@#$%^&*()_+-=[]{}|;:\'",.<>?/~`';

      act(() => {
        result.current.addMessage('user', specialContent);
      });

      expect(result.current.messages[0].content).toBe(specialContent);
    });

    it('should maintain state independence', () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });

      // Set multiple states
      act(() => {
        result.current.setRecording(true);
        result.current.setProcessing(true);
        result.current.setShowTranslation(true);
        result.current.setError('Error');
        result.current.addMessage('user', 'Test');
      });

      // Verify all states are set correctly
      expect(result.current.isRecording).toBe(true);
      expect(result.current.isProcessing).toBe(true);
      expect(result.current.showTranslation).toBe(true);
      expect(result.current.error).toBe('Error');
      expect(result.current.messages).toHaveLength(1);

      // Change one state shouldn't affect others
      act(() => {
        result.current.setRecording(false);
      });

      expect(result.current.isRecording).toBe(false);
      expect(result.current.isProcessing).toBe(true);
      expect(result.current.showTranslation).toBe(true);
      expect(result.current.error).toBe('Error');
      expect(result.current.messages).toHaveLength(1);
    });
  });

  describe('Hook Usage', () => {
    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        renderHook(() => useAppContext());
      }).toThrow('useAppContext must be used within an AppProvider');

      console.error = originalError;
    });
  });
});
