/**
 * AI Conversation Service
 * Handles communication with AI model for conversation and translation
 * Requirements: 4.1, 4.2, 7.6
 */

import { AIConversationService as IAIConversationService, Message } from '../types';

/**
 * Configuration for AI service
 */
interface AIServiceConfig {
  apiKey?: string;
  apiEndpoint?: string;
  model?: string;
}

/**
 * Implementation of AI Conversation Service
 * 
 * Note: This is a mock implementation for development.
 * In production, you would integrate with a real AI API like OpenAI.
 */
export class AIConversationService implements IAIConversationService {
  private config: AIServiceConfig;
  private maxRetries: number = 3;
  private retryDelay: number = 1000; // ms

  constructor(config: AIServiceConfig = {}) {
    this.config = {
      apiKey: config.apiKey || process.env.REACT_APP_AI_API_KEY,
      apiEndpoint: config.apiEndpoint || process.env.REACT_APP_AI_API_ENDPOINT || 'https://api.openai.com/v1/chat/completions',
      model: config.model || process.env.REACT_APP_AI_MODEL || 'gpt-3.5-turbo',
    };
  }

  /**
   * Send a message to the AI and get a response
   */
  public async sendMessage(message: string, history: Message[]): Promise<string> {
    // Validate input
    if (!message || message.trim().length === 0) {
      throw new Error('Message cannot be empty');
    }

    // For development/demo purposes, use mock responses
    // In production, replace this with actual API calls
    if (!this.config.apiKey || this.config.apiKey === 'mock') {
      return this.getMockResponse(message, history);
    }

    // Attempt to call real AI API with retries
    return this.callAIWithRetry(message, history);
  }

  /**
   * Translate English text to Chinese
   */
  public async translateToZh(text: string): Promise<string> {
    // Validate input
    if (!text || text.trim().length === 0) {
      return '';
    }

    // For development/demo purposes, use mock translation
    // In production, replace this with actual translation API
    if (!this.config.apiKey || this.config.apiKey === 'mock') {
      return this.getMockTranslation(text);
    }

    // Attempt to call translation API with retries
    return this.callTranslationWithRetry(text);
  }

  /**
   * Call AI API with retry logic
   */
  private async callAIWithRetry(message: string, history: Message[], attempt: number = 1): Promise<string> {
    try {
      return await this.callAIAPI(message, history);
    } catch (error) {
      if (attempt >= this.maxRetries) {
        throw new Error(`AI service failed after ${this.maxRetries} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Wait before retrying
      await this.delay(this.retryDelay * attempt);
      return this.callAIWithRetry(message, history, attempt + 1);
    }
  }

  /**
   * Call translation API with retry logic
   */
  private async callTranslationWithRetry(text: string, attempt: number = 1): Promise<string> {
    try {
      return await this.callTranslationAPI(text);
    } catch (error) {
      if (attempt >= this.maxRetries) {
        // If translation fails, return empty string rather than throwing
        console.error('Translation failed:', error);
        return '';
      }

      // Wait before retrying
      await this.delay(this.retryDelay * attempt);
      return this.callTranslationWithRetry(text, attempt + 1);
    }
  }

  /**
   * Call the actual AI API
   */
  private async callAIAPI(message: string, history: Message[]): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error('AI API key is not configured');
    }

    // Build conversation context
    const messages = [
      {
        role: 'system',
        content: 'You are a friendly English teacher koala helping Chinese students practice English conversation. Keep responses natural, encouraging, and at an appropriate level for language learners.',
      },
      ...history.slice(-10).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      })),
      {
        role: 'user',
        content: message,
      },
    ];

    const response = await fetch(this.config.apiEndpoint!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        messages,
        temperature: 0.7,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from AI');
    }

    return data.choices[0].message.content.trim();
  }

  /**
   * Call the translation API
   */
  private async callTranslationAPI(text: string): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error('AI API key is not configured');
    }

    const response = await fetch(this.config.apiEndpoint!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: 'You are a translator. Translate the following English text to Chinese. Only provide the translation, no explanations.',
          },
          {
            role: 'user',
            content: text,
          },
        ],
        temperature: 0.3,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No translation response');
    }

    return data.choices[0].message.content.trim();
  }

  /**
   * Get mock AI response for development
   */
  private getMockResponse(message: string, history: Message[]): string {
    const responses = [
      "That's great! Can you tell me more about that?",
      "Interesting! How do you feel about it?",
      "I see. What happened next?",
      "Excellent! Your pronunciation is getting better.",
      "Good job! Let's try using that word in a sentence.",
      "That's a good question. Let me explain...",
      "Perfect! Now, can you try saying it again?",
      "Nice work! Keep practicing.",
    ];

    // Simple logic based on message content
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! How are you today? I'm excited to practice English with you!";
    }
    
    if (lowerMessage.includes('how are you')) {
      return "I'm doing great, thank you for asking! How about you?";
    }
    
    if (lowerMessage.includes('thank')) {
      return "You're welcome! Keep up the good work!";
    }
    
    if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye')) {
      return "Goodbye! Great job today. See you next time!";
    }

    // Return a random encouraging response
    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * Get mock translation for development
   */
  private getMockTranslation(text: string): string {
    // Simple mock translations for common phrases
    const translations: Record<string, string> = {
      'hello': '你好',
      'hi': '嗨',
      'how are you': '你好吗',
      'thank you': '谢谢',
      'goodbye': '再见',
      'yes': '是的',
      'no': '不',
      'please': '请',
      'sorry': '对不起',
      'good': '好的',
    };

    const lowerText = text.toLowerCase().trim();
    
    if (translations[lowerText]) {
      return translations[lowerText];
    }

    // For other text, return a placeholder
    return `[翻译: ${text}]`;
  }

  /**
   * Delay helper for retries
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<AIServiceConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };
  }

  /**
   * Check if service is configured
   */
  public isConfigured(): boolean {
    return !!this.config.apiKey && this.config.apiKey !== 'mock';
  }
}

/**
 * Create and export a singleton instance with mock configuration for development
 */
export const aiConversationService = new AIConversationService({
  apiKey: 'mock', // Use mock responses by default
});
