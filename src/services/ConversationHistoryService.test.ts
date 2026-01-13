/**
 * ConversationHistoryService Tests
 */

import { ConversationHistoryService } from './ConversationHistoryService';
import { Message } from '../types';

describe('ConversationHistoryService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('saveSession', () => {
    it('should save a conversation session', () => {
      const messages: Message[] = [
        {
          id: '1',
          role: 'user',
          content: 'Hello',
          timestamp: new Date('2024-01-01T10:00:00'),
        },
        {
          id: '2',
          role: 'assistant',
          content: 'Hi there!',
          timestamp: new Date('2024-01-01T10:00:05'),
        },
      ];

      const sessionId = ConversationHistoryService.saveSession(messages, 'Test conversation');

      expect(sessionId).toMatch(/^session-\d+$/);
      
      const sessions = ConversationHistoryService.getAllSessions();
      expect(sessions).toHaveLength(1);
      expect(sessions[0].summary).toBe('Test conversation');
      expect(sessions[0].messageCount).toBe(2);
    });

    it('should save session without summary', () => {
      const messages: Message[] = [
        {
          id: '1',
          role: 'user',
          content: 'Hello',
          timestamp: new Date(),
        },
      ];

      ConversationHistoryService.saveSession(messages);
      
      const sessions = ConversationHistoryService.getAllSessions();
      expect(sessions).toHaveLength(1);
      expect(sessions[0].summary).toBeUndefined();
    });
  });

  describe('getAllSessions', () => {
    it('should return empty array when no sessions exist', () => {
      const sessions = ConversationHistoryService.getAllSessions();
      expect(sessions).toEqual([]);
    });

    it('should return all saved sessions', () => {
      const messages1: Message[] = [
        { id: '1', role: 'user', content: 'Test 1', timestamp: new Date() },
      ];
      const messages2: Message[] = [
        { id: '2', role: 'user', content: 'Test 2', timestamp: new Date() },
      ];

      ConversationHistoryService.saveSession(messages1);
      ConversationHistoryService.saveSession(messages2);

      const sessions = ConversationHistoryService.getAllSessions();
      expect(sessions).toHaveLength(2);
    });
  });

  describe('getSession', () => {
    it('should retrieve a specific session by ID', () => {
      const messages: Message[] = [
        { id: '1', role: 'user', content: 'Test', timestamp: new Date() },
      ];

      const sessionId = ConversationHistoryService.saveSession(messages, 'Test session');
      const session = ConversationHistoryService.getSession(sessionId);

      expect(session).not.toBeNull();
      expect(session?.id).toBe(sessionId);
      expect(session?.summary).toBe('Test session');
    });

    it('should return null for non-existent session', () => {
      const session = ConversationHistoryService.getSession('non-existent');
      expect(session).toBeNull();
    });
  });

  describe('getRecentSessions', () => {
    it('should return recent sessions in reverse order', () => {
      const messages: Message[] = [
        { id: '1', role: 'user', content: 'Test', timestamp: new Date() },
      ];

      ConversationHistoryService.saveSession(messages, 'Session 1');
      ConversationHistoryService.saveSession(messages, 'Session 2');
      ConversationHistoryService.saveSession(messages, 'Session 3');

      const recent = ConversationHistoryService.getRecentSessions(2);
      
      expect(recent).toHaveLength(2);
      expect(recent[0].summary).toBe('Session 3'); // Most recent first
      expect(recent[1].summary).toBe('Session 2');
    });
  });

  describe('deleteSession', () => {
    it('should delete a specific session', () => {
      const messages: Message[] = [
        { id: '1', role: 'user', content: 'Test', timestamp: new Date() },
      ];

      const sessionId = ConversationHistoryService.saveSession(messages);
      expect(ConversationHistoryService.getAllSessions()).toHaveLength(1);

      ConversationHistoryService.deleteSession(sessionId);
      expect(ConversationHistoryService.getAllSessions()).toHaveLength(0);
    });
  });

  describe('clearAll', () => {
    it('should clear all sessions', () => {
      const messages: Message[] = [
        { id: '1', role: 'user', content: 'Test', timestamp: new Date() },
      ];

      ConversationHistoryService.saveSession(messages);
      ConversationHistoryService.saveSession(messages);
      expect(ConversationHistoryService.getAllSessions()).toHaveLength(2);

      ConversationHistoryService.clearAll();
      expect(ConversationHistoryService.getAllSessions()).toHaveLength(0);
    });
  });

  describe('getStatistics', () => {
    it('should return correct statistics', () => {
      const messages1: Message[] = [
        { id: '1', role: 'user', content: 'Test 1', timestamp: new Date() },
        { id: '2', role: 'assistant', content: 'Response 1', timestamp: new Date() },
      ];
      const messages2: Message[] = [
        { id: '3', role: 'user', content: 'Test 2', timestamp: new Date() },
        { id: '4', role: 'assistant', content: 'Response 2', timestamp: new Date() },
        { id: '5', role: 'user', content: 'Test 3', timestamp: new Date() },
      ];

      ConversationHistoryService.saveSession(messages1);
      ConversationHistoryService.saveSession(messages2);

      const stats = ConversationHistoryService.getStatistics();
      
      expect(stats.totalSessions).toBe(2);
      expect(stats.totalMessages).toBe(5);
      expect(stats.averageMessagesPerSession).toBe(3); // (2 + 3) / 2 = 2.5, rounded to 3
      expect(stats.totalDays).toBeGreaterThanOrEqual(1);
    });
  });

  describe('exportHistory', () => {
    it('should export history as JSON string', () => {
      const messages: Message[] = [
        { id: '1', role: 'user', content: 'Test', timestamp: new Date() },
      ];

      ConversationHistoryService.saveSession(messages, 'Test session');
      const exported = ConversationHistoryService.exportHistory();

      expect(typeof exported).toBe('string');
      const parsed = JSON.parse(exported);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(1);
    });
  });

  describe('generateSummaryPrompt', () => {
    it('should generate a summary prompt', () => {
      const messages: Message[] = [
        { id: '1', role: 'user', content: 'Hello', timestamp: new Date() },
        { id: '2', role: 'assistant', content: 'Hi there!', timestamp: new Date() },
      ];

      const prompt = ConversationHistoryService.generateSummaryPrompt(messages);
      
      expect(prompt).toContain('User: Hello');
      expect(prompt).toContain('AI: Hi there!');
      expect(prompt).toContain('Summarize');
      expect(prompt).toContain('Chinese');
    });
  });
});
