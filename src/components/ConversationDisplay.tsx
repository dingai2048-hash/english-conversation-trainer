/**
 * ConversationDisplay Component
 * Displays conversation history with translation support
 * Requirements: 1.3, 5.1, 5.2, 5.3, 5.4, 7.3
 */

import React, { useEffect, useRef } from 'react';
import { ConversationDisplayProps } from '../types';

export const ConversationDisplay: React.FC<ConversationDisplayProps> = ({
  messages,
  showTranslation,
  onRequestFeedback,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center text-gray-400">
          <p className="text-lg">Start a conversation!</p>
          <p className="text-sm mt-2">Click the microphone to begin speaking</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`
              max-w-[80%] rounded-lg p-4 shadow-md
              ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }
            `}
          >
            {/* Message content */}
            <p className="text-base leading-relaxed">{message.content}</p>

            {/* Translation */}
            {showTranslation && message.translation && (
              <p className="text-sm mt-2 pt-2 border-t border-opacity-30 border-current opacity-80">
                {message.translation}
              </p>
            )}

            {/* Pronunciation Feedback Button removed - AI now corrects automatically */}

            {/* Timestamp */}
            <p className="text-xs mt-2 opacity-60">
              {new Date(message.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ConversationDisplay;
