/**
 * Conversation History Service
 * Manages conversation history storage and retrieval
 */

import { Message } from '../types';

export interface ConversationSession {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM:SS
  messages: Message[];
  summary?: string; // AI-generated summary
  duration?: number; // in seconds
  messageCount: number; // Number of messages in the session
}

const HISTORY_KEY = 'english-trainer-conversation-history';
const MAX_SESSIONS = 100; // Keep last 100 sessions

export class ConversationHistoryService {
  /**
   * Get all conversation sessions
   */
  public static getAllSessions(): ConversationSession[] {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) {
        const sessions = JSON.parse(stored);
        // Convert date strings back to Date objects in messages
        return sessions.map((session: ConversationSession) => ({
          ...session,
          messages: session.messages.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        }));
      }
    } catch (error) {
      console.error('Failed to load conversation history:', error);
    }
    return [];
  }

  /**
   * Save a conversation session
   */
  public static saveSession(messages: Message[], summary?: string): string {
    try {
      const now = new Date();
      const sessionId = `session-${now.getTime()}`;
      
      const session: ConversationSession = {
        id: sessionId,
        date: now.toISOString().split('T')[0], // YYYY-MM-DD
        time: now.toTimeString().split(' ')[0], // HH:MM:SS
        messages,
        summary,
        duration: this.calculateDuration(messages),
        messageCount: messages.length,
      };

      const sessions = this.getAllSessions();
      sessions.push(session);

      // Keep only the last MAX_SESSIONS
      const trimmedSessions = sessions.slice(-MAX_SESSIONS);

      localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmedSessions));
      
      console.log('💾 Conversation saved:', sessionId);
      return sessionId;
    } catch (error) {
      console.error('Failed to save conversation:', error);
      throw new Error('无法保存对话记录');
    }
  }

  /**
   * Get a specific session by ID
   */
  public static getSession(sessionId: string): ConversationSession | null {
    const sessions = this.getAllSessions();
    return sessions.find(s => s.id === sessionId) || null;
  }

  /**
   * Get sessions by date
   */
  public static getSessionsByDate(date: string): ConversationSession[] {
    const sessions = this.getAllSessions();
    return sessions.filter(s => s.date === date);
  }

  /**
   * Get sessions for today
   */
  public static getTodaySessions(): ConversationSession[] {
    const today = new Date().toISOString().split('T')[0];
    return this.getSessionsByDate(today);
  }

  /**
   * Delete a session
   */
  public static deleteSession(sessionId: string): void {
    try {
      const sessions = this.getAllSessions();
      const filtered = sessions.filter(s => s.id !== sessionId);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  }

  /**
   * Clear all history
   */
  public static clearAll(): void {
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  }

  /**
   * Calculate conversation duration
   */
  private static calculateDuration(messages: Message[]): number {
    if (messages.length < 2) return 0;
    
    const firstTime = messages[0].timestamp.getTime();
    const lastTime = messages[messages.length - 1].timestamp.getTime();
    
    return Math.floor((lastTime - firstTime) / 1000); // in seconds
  }

  /**
   * Generate summary prompt for AI
   */
  public static generateSummaryPrompt(messages: Message[]): string {
    const conversation = messages
      .map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`)
      .join('\n');

    return `Summarize this English conversation in Chinese (20-30 characters). Focus on the main topic discussed:\n\n${conversation}\n\nSummary (in Chinese):`;
  }

  /**
   * Generate conversation summary using AI
   */
  public static async generateSummary(messages: Message[], aiService: any): Promise<string> {
    try {
      const summaryPrompt = this.generateSummaryPrompt(messages);
      const summary = await aiService.sendMessage(summaryPrompt, []);
      return summary.trim();
    } catch (error) {
      console.error('Failed to generate summary:', error);
      return '对话记录';
    }
  }

  /**
   * Get recent sessions (most recent first)
   */
  public static getRecentSessions(limit: number = 20): Array<{
    id: string;
    date: string;
    time: string;
    summary: string;
    messageCount: number;
  }> {
    const sessions = this.getAllSessions();
    return sessions
      .slice(-limit)
      .reverse()
      .map(s => ({
        id: s.id,
        date: s.date,
        time: s.time,
        summary: s.summary || '对话练习',
        messageCount: s.messages.length,
      }));
  }

  /**
   * Export history as JSON
   */
  public static exportHistory(): string {
    const sessions = this.getAllSessions();
    return JSON.stringify(sessions, null, 2);
  }

  /**
   * Get statistics
   */
  public static getStatistics(): {
    totalSessions: number;
    totalMessages: number;
    todaySessions: number;
    averageMessagesPerSession: number;
    totalDays: number;
  } {
    const sessions = this.getAllSessions();
    const todaySessions = this.getTodaySessions();
    const totalMessages = sessions.reduce((sum, s) => sum + s.messages.length, 0);
    
    // Calculate unique days
    const uniqueDates = new Set(sessions.map(s => s.date));
    const totalDays = uniqueDates.size;

    return {
      totalSessions: sessions.length,
      totalMessages,
      todaySessions: todaySessions.length,
      averageMessagesPerSession: sessions.length > 0 
        ? Math.round(totalMessages / sessions.length) 
        : 0,
      totalDays,
    };
  }
}
