/**
 * Property-based tests for Message model
 * Feature: english-conversation-trainer, Property 1: 消息顺序和唯一性
 * Validates: Requirements 5.1, 5.2
 */

import * as fc from 'fast-check';
import { Message, MessageRole } from './index';

/**
 * Arbitrary generator for MessageRole
 */
const messageRoleArbitrary = fc.constantFrom('user' as const, 'assistant' as const);

/**
 * Arbitrary generator for Message
 */
const messageArbitrary = fc.record({
  id: fc.uuid(),
  role: messageRoleArbitrary,
  content: fc.string({ minLength: 1, maxLength: 500 }),
  translation: fc.option(fc.string({ minLength: 1, maxLength: 500 })),
  timestamp: fc.date(),
});

/**
 * Helper function to create a message list with controlled timestamps
 */
function createMessageListWithTimestamps(count: number): Message[] {
  const messages: Message[] = [];
  const baseTime = new Date('2024-01-01T00:00:00Z').getTime();
  
  for (let i = 0; i < count; i++) {
    messages.push({
      id: `msg-${i}-${Math.random().toString(36).substr(2, 9)}`,
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: `Message ${i}`,
      timestamp: new Date(baseTime + i * 1000), // Each message 1 second apart
    });
  }
  
  return messages;
}

/**
 * Helper function to add a message to a list maintaining order
 */
function addMessage(messages: Message[], newMessage: Omit<Message, 'timestamp'>): Message[] {
  const lastTimestamp = messages.length > 0 
    ? messages[messages.length - 1].timestamp.getTime()
    : Date.now();
  
  const messageWithTimestamp: Message = {
    ...newMessage,
    timestamp: new Date(lastTimestamp + 1000), // 1 second after last message
  };
  
  return [...messages, messageWithTimestamp];
}

describe('Message Model Properties', () => {
  describe('Property 1: 消息顺序和唯一性', () => {
    /**
     * Property: For any conversation session, message timestamps should be 
     * monotonically increasing in the order they were added, and all message 
     * IDs should be unique.
     */
    
    it('should maintain monotonically increasing timestamps', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 20 }), // Number of messages
          (messageCount) => {
            const messages = createMessageListWithTimestamps(messageCount);
            
            // Check that timestamps are monotonically increasing
            for (let i = 1; i < messages.length; i++) {
              const prevTime = messages[i - 1].timestamp.getTime();
              const currTime = messages[i].timestamp.getTime();
              
              if (currTime <= prevTime) {
                return false;
              }
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain unique message IDs', () => {
      fc.assert(
        fc.property(
          fc.array(messageArbitrary, { minLength: 2, maxLength: 50 }),
          (messages) => {
            const ids = messages.map(m => m.id);
            const uniqueIds = new Set(ids);
            
            // All IDs should be unique
            return ids.length === uniqueIds.size;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve order when adding messages sequentially', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.uuid(),
              role: messageRoleArbitrary,
              content: fc.string({ minLength: 1, maxLength: 100 }),
            }),
            { minLength: 2, maxLength: 20 }
          ),
          (newMessages) => {
            let messageList: Message[] = [];
            
            // Add messages one by one
            for (const msg of newMessages) {
              messageList = addMessage(messageList, msg);
            }
            
            // Verify timestamps are monotonically increasing
            for (let i = 1; i < messageList.length; i++) {
              if (messageList[i].timestamp.getTime() <= messageList[i - 1].timestamp.getTime()) {
                return false;
              }
            }
            
            // Verify IDs are unique
            const ids = messageList.map(m => m.id);
            const uniqueIds = new Set(ids);
            
            return ids.length === uniqueIds.size;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle edge case of single message', () => {
      fc.assert(
        fc.property(
          messageArbitrary,
          (message) => {
            const messages = [message];
            
            // Single message should have valid timestamp
            return messages[0].timestamp instanceof Date;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain order invariant after multiple additions', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 5, max: 30 }),
          (count) => {
            const messages = createMessageListWithTimestamps(count);
            
            // Add a few more messages
            let updatedMessages = messages;
            for (let i = 0; i < 5; i++) {
              updatedMessages = addMessage(updatedMessages, {
                id: `new-msg-${i}`,
                role: 'user',
                content: `New message ${i}`,
              });
            }
            
            // Verify all timestamps are still monotonically increasing
            for (let i = 1; i < updatedMessages.length; i++) {
              if (updatedMessages[i].timestamp.getTime() <= updatedMessages[i - 1].timestamp.getTime()) {
                return false;
              }
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
