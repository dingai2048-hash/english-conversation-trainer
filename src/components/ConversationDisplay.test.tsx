import React from 'react';
import { render, screen } from '@testing-library/react';
import { ConversationDisplay } from './ConversationDisplay';
import { Message } from '../types';

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

describe('ConversationDisplay', () => {
  const mockMessages: Message[] = [
    {
      id: '1',
      role: 'user',
      content: 'Hello',
      translation: '你好',
      timestamp: new Date('2024-01-01T10:00:00'),
    },
    {
      id: '2',
      role: 'assistant',
      content: 'Hi there!',
      translation: '你好！',
      timestamp: new Date('2024-01-01T10:00:01'),
    },
  ];

  it('should render empty state when no messages', () => {
    render(<ConversationDisplay messages={[]} showTranslation={false} />);
    expect(screen.getByText('Start a conversation!')).toBeInTheDocument();
  });

  it('should render messages', () => {
    render(<ConversationDisplay messages={mockMessages} showTranslation={false} />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Hi there!')).toBeInTheDocument();
  });

  it('should show translations when enabled', () => {
    render(<ConversationDisplay messages={mockMessages} showTranslation={true} />);
    expect(screen.getByText('你好')).toBeInTheDocument();
    expect(screen.getByText('你好！')).toBeInTheDocument();
  });

  it('should hide translations when disabled', () => {
    render(<ConversationDisplay messages={mockMessages} showTranslation={false} />);
    expect(screen.queryByText('你好')).not.toBeInTheDocument();
  });

  it('should distinguish user and assistant messages', () => {
    const { container } = render(
      <ConversationDisplay messages={mockMessages} showTranslation={false} />
    );
    const userMessage = screen.getByText('Hello').closest('div');
    const assistantMessage = screen.getByText('Hi there!').closest('div');
    
    expect(userMessage).toHaveClass('bg-blue-500');
    expect(assistantMessage).toHaveClass('bg-gray-100');
  });
});
