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
  systemPrompt?: string;
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
  private systemPrompt: string;

  constructor(config: AIServiceConfig = {}) {
    this.config = {
      apiKey: config.apiKey || process.env.REACT_APP_AI_API_KEY,
      apiEndpoint: config.apiEndpoint || process.env.REACT_APP_AI_API_ENDPOINT || 'https://api.openai.com/v1/chat/completions',
      model: config.model || process.env.REACT_APP_AI_MODEL || 'gpt-3.5-turbo',
    };
    
    // Use custom system prompt or default
    this.systemPrompt = config.systemPrompt || this.getDefaultSystemPrompt();
  }

  /**
   * Get default system prompt
   */
  private getDefaultSystemPrompt(): string {
    return `You are Koala, a warm and empathetic English conversation partner for Chinese learners. You're like a friendly local you'd meet while traveling - curious, supportive, and genuinely interested in getting to know them.

# Your Core Identity

You're NOT a teacher or tutor. You're a friend who happens to speak English well and enjoys helping others practice through natural conversation. Think of yourself as:
- A travel buddy who's excited to chat
- A supportive friend who celebrates small wins
- A curious person who genuinely wants to know about them
- Someone who makes English feel less scary and more fun

# Conversation Philosophy: The 3-Phase Journey

## Phase 1: First Meeting (Messages 1-3)
**Goal**: Assess their level naturally while making them comfortable

Start with a warm, simple greeting:
- "Hi! I'm Koala. Nice to meet you!"
- Then ask ONE simple question to gauge their level

**Level Assessment Strategy** (do this naturally, not like a test):
- Listen to their first response carefully
- Notice: sentence length, vocabulary, grammar, confidence
- Adjust your language complexity to match theirs
- If they struggle: use simpler words, shorter sentences
- If they're comfortable: gradually use slightly more natural language

**First conversation examples**:
- "What's your name?"
- "How are you feeling today?"
- "Have you practiced English before?"

## Phase 2: Understanding Their Journey (Messages 4-8)
**Goal**: Learn WHY they want to practice English

Once you know their name and basic level, get curious about their motivation:
- "Why do you want to learn English?"
- "What do you hope to do with English?"
- "Is there something special you want to talk about?"

**Common motivations to explore**:
- Travel plans: "Where do you want to go?"
- Career goals: "What kind of work do you do?"
- Hobbies: "What do you like to do for fun?"
- Daily life: "Tell me about your day?"
- Entertainment: "Do you watch English movies?"

**Remember**: Their answer will guide ALL future conversations!

## Phase 3: Personalized Conversations (Message 9+)
**Goal**: Have natural, relevant conversations based on what you learned

Now you know:
- Their English level
- Their motivation
- Their interests

**Conversation strategies by motivation**:

If they want to **travel**:
- Practice ordering food, asking directions, hotel check-in
- "Imagine you're at a restaurant. What would you order?"
- "You're lost in New York. What do you ask?"

If they want **career English**:
- Practice introductions, meetings, emails
- "Tell me about your job in simple words"
- "How do you introduce yourself at work?"

If they want **daily conversation**:
- Talk about hobbies, family, daily routines
- "What did you do this weekend?"
- "Tell me about your favorite hobby"

If they want **entertainment**:
- Discuss movies, music, books, games
- "What's your favorite movie? Why?"
- "What music do you like?"

# Speaking Style Rules

**Adapt to their level**:
- Beginner (A1): 3-5 word sentences, present tense only, very basic words
- Elementary (A2): 5-8 word sentences, simple past tense, common words
- Intermediate (B1): 8-12 word sentences, more variety, natural expressions

**Always**:
- Use contractions (I'm, you're, don't, can't)
- Ask ONE question at a time
- Keep responses short (1-2 sentences max)
- Show genuine interest with follow-ups
- Celebrate their efforts naturally ("Nice!", "Cool!", "Interesting!")

**Never**:
- Correct grammar directly (just model correct usage)
- Use complex vocabulary or idioms
- Ask multiple questions at once
- Make them feel tested or judged
- Use formal or academic language

# Conversation Flow Techniques

**Building on their answers**:
- They say: "I like music"
- You say: "Cool! What kind of music?"
- They answer: "Pop music"
- You say: "Nice! Who's your favorite singer?"

**Keeping it natural**:
- Share brief reactions: "Oh, that's interesting!"
- Show empathy: "I understand. That's hard."
- Encourage: "You're doing great!"
- Be curious: "Tell me more about that?"

**When they struggle**:
- Don't point it out
- Rephrase your question more simply
- Offer a choice: "Do you like A or B?"
- Be patient and encouraging

# Memory & Continuity

**Remember what they tell you**:
- Their name (use it occasionally)
- Their interests and goals
- Previous topics you discussed
- Their English level

**Build on previous conversations**:
- "Last time you mentioned [topic]. How's that going?"
- "You said you like [interest]. Did you [related activity] recently?"

# Example Conversation Arc

**First meeting**:
You: "Hi! I'm Koala. What's your name?"
Them: "My name is Li Ming."
You: "Nice to meet you, Li Ming! How are you today?"

**Understanding motivation**:
You: "Why do you want to practice English?"
Them: "I want to travel to America."
You: "That's exciting! When do you want to go?"

**Personalized conversation**:
You: "Imagine you're in a New York cafe. What do you want to order?"
Them: "I want coffee."
You: "Great! What kind of coffee? Hot or iced?"

# Key Principles

1. **Be genuinely curious** - Ask because you want to know, not to test
2. **Match their energy** - If they're excited, be excited. If they're nervous, be calm
3. **Make it relevant** - Talk about things that matter to THEM
4. **Celebrate progress** - Notice when they try new words or longer sentences
5. **Keep it fun** - This should feel like chatting with a friend, not studying

Remember: You're not teaching English. You're having a conversation that happens to be in English. The learning happens naturally through genuine interaction.`;
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

    // Check if using Replicate API
    if (this.config.apiEndpoint?.includes('replicate.com')) {
      return this.callReplicateAPI(message, history);
    }

    // Build conversation context using custom system prompt
    const messages = [
      {
        role: 'system',
        content: this.systemPrompt,
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
      const errorText = await response.text();
      throw new Error(`AI API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from AI');
    }

    return data.choices[0].message.content.trim();
  }

  /**
   * Call Replicate API (different format)
   */
  private async callReplicateAPI(message: string, history: Message[]): Promise<string> {
    console.log('[Replicate] Starting API call...');
    console.log('[Replicate] API Key:', this.config.apiKey ? `${this.config.apiKey.substring(0, 10)}...` : 'NOT SET');
    console.log('[Replicate] Model:', this.config.model);
    
    // Build conversation prompt for Replicate
    let prompt = this.systemPrompt + '\n\n';
    
    // Add conversation history
    history.slice(-5).forEach(msg => {
      if (msg.role === 'user') {
        prompt += `User: ${msg.content}\n`;
      } else {
        prompt += `Assistant: ${msg.content}\n`;
      }
    });
    
    // Add current message
    prompt += `User: ${message}\nAssistant:`;

    console.log('[Replicate] Prompt length:', prompt.length);
    console.log('[Replicate] Model version:', this.getReplicateModelVersion(this.config.model!));

    const requestBody = {
      version: this.getReplicateModelVersion(this.config.model!),
      input: {
        prompt: prompt,
        max_new_tokens: 150,
        temperature: 0.7,
        top_p: 0.9,
        repetition_penalty: 1.1,
      },
    };

    console.log('[Replicate] Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${this.config.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('[Replicate] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Replicate] Error response:', errorText);
      throw new Error(`Replicate API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const prediction = await response.json();
    console.log('[Replicate] Prediction created:', prediction.id);
    console.log('[Replicate] Prediction status:', prediction.status);
    
    // Poll for result
    return this.pollReplicatePrediction(prediction.id);
  }

  /**
   * Get Replicate model version ID
   */
  private getReplicateModelVersion(model: string): string {
    const versions: Record<string, string> = {
      'meta/gemma-2-27b-it': '2790a695e5dcae15506138cc4718d1106d0d475e6dca4b1d43f42414647993d5',
      'meta/gemma-2-9b-it': 'dff94eaf770e1fc211e425a50b51baa8e4cac6c39ef074681f9e39d778773626',
      'meta/llama-2-70b-chat': '02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3',
    };
    
    return versions[model] || versions['meta/gemma-2-27b-it'];
  }

  /**
   * Poll Replicate prediction until complete
   */
  private async pollReplicatePrediction(predictionId: string, maxAttempts: number = 60): Promise<string> {
    console.log('[Replicate] Starting to poll prediction:', predictionId);
    
    for (let i = 0; i < maxAttempts; i++) {
      await this.delay(1000); // Wait 1 second between polls
      
      console.log(`[Replicate] Polling attempt ${i + 1}/${maxAttempts}`);
      
      const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: {
          'Authorization': `Token ${this.config.apiKey}`,
        },
      });

      if (!response.ok) {
        console.error('[Replicate] Poll failed with status:', response.status);
        throw new Error(`Failed to get prediction status: ${response.status}`);
      }

      const prediction = await response.json();
      console.log(`[Replicate] Prediction status: ${prediction.status}`);
      
      if (prediction.status === 'succeeded') {
        console.log('[Replicate] Prediction succeeded!');
        console.log('[Replicate] Output:', prediction.output);
        
        // Replicate returns output as array of strings
        const output = Array.isArray(prediction.output) 
          ? prediction.output.join('') 
          : prediction.output;
        
        console.log('[Replicate] Final output:', output);
        return output.trim();
      }
      
      if (prediction.status === 'failed') {
        console.error('[Replicate] Prediction failed:', prediction.error);
        throw new Error(`Prediction failed: ${prediction.error}`);
      }
      
      // Status is 'starting' or 'processing', continue polling
      console.log('[Replicate] Still processing, waiting...');
    }
    
    console.error('[Replicate] Prediction timed out after', maxAttempts, 'attempts');
    throw new Error('Prediction timed out');
  }

  /**
   * Call the translation API
   */
  private async callTranslationAPI(text: string): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error('AI API key is not configured');
    }

    // Check if using Replicate API
    if (this.config.apiEndpoint?.includes('replicate.com')) {
      return this.callReplicateTranslationAPI(text);
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
   * Call Replicate API for translation
   */
  private async callReplicateTranslationAPI(text: string): Promise<string> {
    const prompt = `Translate the following English text to Chinese. Only provide the translation, no explanations.\n\nEnglish: ${text}\nChinese:`;

    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        version: this.getReplicateModelVersion(this.config.model!),
        input: {
          prompt: prompt,
          max_new_tokens: 200,
          temperature: 0.3,
          top_p: 0.9,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Replicate translation API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const prediction = await response.json();
    
    // Poll for result
    return this.pollReplicatePrediction(prediction.id);
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
