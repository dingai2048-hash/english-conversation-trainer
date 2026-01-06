/**
 * Unit tests for AIConversationService
 * Tests API calls, error handling, and retry logic
 * Requirements: 4.1, 4.5, 8.3
 */

import { AIConversationService } from './AIConversationService';
import { Message } from '../types';

// Mock fetch globally
global.fetch = jest.fn();

describe('AIConversationService', () => {
  let service: AIConversationService;

  beforeEach(() => {
    // Reset fetch mock
    (global.fetch as jest.Mock).mockReset();
    
    // Create service with mock config
    service = new AIConversationService({ apiKey: 'mock' });
  });

  describe('Mock Mode (Development)', () => {
    it('should return mock response for hello message', async () => {
      const response = await service.sendMessage('Hello', []);
      
      expect(response).toContain('Hello');
      expect(response.length).toBeGreaterThan(0);
    });

    it('should return mock response for how are you', async () => {
      const response = await service.sendMessage('How are you?', []);
      
      expect(response).toBeTruthy();
      expect(response.length).toBeGreaterThan(0);
    });

    it('should return mock response for thank you', async () => {
      const response = await service.sendMessage('Thank you', []);
      
      expect(response).toContain('welcome');
    });

    it('should return mock response for goodbye', async () => {
      const response = await service.sendMessage('Goodbye', []);
      
      expect(response).toContain('Goodbye');
    });

    it('should return random response for other messages', async () => {
      const response = await service.sendMessage('Tell me about yourself', []);
      
      expect(response).toBeTruthy();
      expect(response.length).toBeGreaterThan(0);
    });

    it('should handle conversation history', async () => {
      const history: Message[] = [
        {
          id: '1',
          role: 'user',
          content: 'Hello',
          timestamp: new Date(),
        },
        {
          id: '2',
          role: 'assistant',
          content: 'Hi there!',
          timestamp: new Date(),
        },
      ];

      const response = await service.sendMessage('How are you?', history);
      
      expect(response).toBeTruthy();
    });
  });

  describe('Translation - Mock Mode', () => {
    it('should return mock translation for hello', async () => {
      const translation = await service.translateToZh('hello');
      
      expect(translation).toBe('你好');
    });

    it('should return mock translation for thank you', async () => {
      const translation = await service.translateToZh('thank you');
      
      expect(translation).toBe('谢谢');
    });

    it('should return placeholder for unknown text', async () => {
      const translation = await service.translateToZh('This is a test');
      
      expect(translation).toContain('翻译');
    });

    it('should return empty string for empty input', async () => {
      const translation = await service.translateToZh('');
      
      expect(translation).toBe('');
    });

    it('should return empty string for whitespace input', async () => {
      const translation = await service.translateToZh('   ');
      
      expect(translation).toBe('');
    });
  });

  describe('Input Validation', () => {
    it('should throw error for empty message', async () => {
      await expect(service.sendMessage('', [])).rejects.toThrow('Message cannot be empty');
    });

    it('should throw error for whitespace-only message', async () => {
      await expect(service.sendMessage('   ', [])).rejects.toThrow('Message cannot be empty');
    });

    it('should handle empty history', async () => {
      const response = await service.sendMessage('Hello', []);
      
      expect(response).toBeTruthy();
    });
  });

  describe('Real API Mode', () => {
    beforeEach(() => {
      // Create service with real API key
      service = new AIConversationService({ apiKey: 'test-api-key' });
    });

    it('should call AI API with correct parameters', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Hello! How can I help you?',
            },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await service.sendMessage('Hello', []);
      
      expect(response).toBe('Hello! How can I help you?');
      expect(global.fetch).toHaveBeenCalledTimes(1);
      
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      expect(fetchCall[1].method).toBe('POST');
      expect(fetchCall[1].headers['Authorization']).toBe('Bearer test-api-key');
    });

    it('should include conversation history in API call', async () => {
      const history: Message[] = [
        {
          id: '1',
          role: 'user',
          content: 'Hello',
          timestamp: new Date(),
        },
        {
          id: '2',
          role: 'assistant',
          content: 'Hi!',
          timestamp: new Date(),
        },
      ];

      const mockResponse = {
        choices: [{ message: { content: 'Response' } }],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await service.sendMessage('How are you?', history);
      
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      
      expect(body.messages.length).toBeGreaterThan(2); // System + history + new message
    });

    it('should handle API error response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(service.sendMessage('Hello', [])).rejects.toThrow('AI service failed after 3 attempts');
    });

    it('should handle network error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(service.sendMessage('Hello', [])).rejects.toThrow('AI service failed after 3 attempts');
    });

    it('should handle empty response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ choices: [] }),
      });

      await expect(service.sendMessage('Hello', [])).rejects.toThrow('AI service failed after 3 attempts');
    });

    it('should retry on failure', async () => {
      // First two calls fail, third succeeds
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            choices: [{ message: { content: 'Success!' } }],
          }),
        });

      const response = await service.sendMessage('Hello', []);
      
      expect(response).toBe('Success!');
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should fail after max retries', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(service.sendMessage('Hello', [])).rejects.toThrow('AI service failed after 3 attempts');
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('Translation API Mode', () => {
    beforeEach(() => {
      service = new AIConversationService({ apiKey: 'test-api-key' });
    });

    it('should call translation API', async () => {
      const mockResponse = {
        choices: [{ message: { content: '你好' } }],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const translation = await service.translateToZh('Hello');
      
      expect(translation).toBe('你好');
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should return empty string on translation failure', async () => {
      // Mock console.error to avoid test output noise
      const consoleError = jest.spyOn(console, 'error').mockImplementation();

      (global.fetch as jest.Mock).mockRejectedValue(new Error('API error'));

      const translation = await service.translateToZh('Hello');
      
      expect(translation).toBe('');
      
      consoleError.mockRestore();
    });

    it('should retry translation on failure', async () => {
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            choices: [{ message: { content: '你好' } }],
          }),
        });

      const translation = await service.translateToZh('Hello');
      
      expect(translation).toBe('你好');
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Configuration', () => {
    it('should check if service is configured', () => {
      const mockService = new AIConversationService({ apiKey: 'mock' });
      expect(mockService.isConfigured()).toBe(false);

      const realService = new AIConversationService({ apiKey: 'real-key' });
      expect(realService.isConfigured()).toBe(true);
    });

    it('should update configuration', () => {
      const testService = new AIConversationService({ apiKey: 'mock' });
      
      testService.updateConfig({ apiKey: 'new-key' });
      
      expect(testService.isConfigured()).toBe(true);
    });

    it('should use environment variables if not provided', () => {
      // This test verifies the constructor logic
      const testService = new AIConversationService();
      
      // Should not throw and should work with mock mode
      expect(testService).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long messages', async () => {
      const longMessage = 'a'.repeat(1000);
      
      const response = await service.sendMessage(longMessage, []);
      
      expect(response).toBeTruthy();
    });

    it('should handle special characters in messages', async () => {
      const specialMessage = '你好！@#$%^&*()_+-=[]{}|;:\'",.<>?/~`';
      
      const response = await service.sendMessage(specialMessage, []);
      
      expect(response).toBeTruthy();
    });

    it('should handle large conversation history', async () => {
      const largeHistory: Message[] = Array.from({ length: 50 }, (_, i) => ({
        id: `${i}`,
        role: i % 2 === 0 ? 'user' as const : 'assistant' as const,
        content: `Message ${i}`,
        timestamp: new Date(),
      }));

      const response = await service.sendMessage('Hello', largeHistory);
      
      expect(response).toBeTruthy();
    });

    it('should trim whitespace from responses', async () => {
      service = new AIConversationService({ apiKey: 'test-api-key' });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: '  Response with spaces  ' } }],
        }),
      });

      const response = await service.sendMessage('Hello', []);
      
      expect(response).toBe('Response with spaces');
    });
  });
});
