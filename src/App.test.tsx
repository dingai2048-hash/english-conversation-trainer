import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

describe('App', () => {
  it('should render the main title', () => {
    render(<App />);
    expect(screen.getByText('英语对话训练')).toBeInTheDocument();
  });

  it('should render koala character', () => {
    render(<App />);
    expect(screen.getByText('Koala Teacher')).toBeInTheDocument();
  });

  it('should render microphone button', () => {
    render(<App />);
    const micButton = screen.getByRole('button', { name: /start recording/i });
    expect(micButton).toBeInTheDocument();
  });

  it('should render conversation display', () => {
    render(<App />);
    expect(screen.getByText('对话记录')).toBeInTheDocument();
  });

  it('should render translation toggle', () => {
    render(<App />);
    const toggleButton = screen.getByRole('button', { name: /show translations/i });
    expect(toggleButton).toBeInTheDocument();
  });

  it('should render empty conversation state', () => {
    render(<App />);
    expect(screen.getByText('Start a conversation!')).toBeInTheDocument();
  });

  it('should render footer', () => {
    render(<App />);
    expect(screen.getByText(/建议使用Chrome或Edge浏览器/)).toBeInTheDocument();
  });
});
