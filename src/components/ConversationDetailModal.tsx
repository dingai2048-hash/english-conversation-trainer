/**
 * Conversation Detail Modal
 * Displays full conversation history when clicking on a history item
 */

import React from 'react';
import { X } from 'lucide-react';
import { ConversationSession } from '../services/ConversationHistoryService';
import { cn } from '../lib/utils';

interface ConversationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: ConversationSession | null;
}

export const ConversationDetailModal: React.FC<ConversationDetailModalProps> = ({
  isOpen,
  onClose,
  session,
}) => {
  if (!isOpen || !session) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">对话详情</h2>
            <p className="text-sm text-gray-500 mt-1">
              {session.date} {session.time} · {session.messageCount} 条消息
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Summary */}
        {session.summary && (
          <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
            <p className="text-sm text-gray-600 mb-1">对话摘要</p>
            <p className="text-gray-800 font-medium">{session.summary}</p>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {session.messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'flex items-start gap-3',
                msg.role === 'user' ? 'flex-row-reverse' : ''
              )}
            >
              {/* Avatar */}
              {msg.role === 'assistant' && (
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-blue-50">
                  <img
                    src="/koala.png"
                    alt="Koala"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {msg.role === 'user' && (
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm">👤</span>
                </div>
              )}

              {/* Message Content */}
              <div className="flex-1 max-w-[75%]">
                <div
                  className={cn(
                    'px-4 py-3 rounded-2xl',
                    msg.role === 'user'
                      ? 'bg-blue-50 text-gray-800'
                      : 'bg-gray-100 text-gray-800'
                  )}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {msg.translation && (
                    <p className="text-sm text-gray-500 mt-2 pt-2 border-t border-gray-200">
                      {msg.translation}
                    </p>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1 px-2">
                  {new Date(msg.timestamp).toLocaleTimeString('zh-CN')}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};
