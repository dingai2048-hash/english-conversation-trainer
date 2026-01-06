/**
 * End-to-end integration tests
 * Validates: All requirements
 */

import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

describe('End-to-End Integration Tests', () => {
  it('should render complete application', () => {
    render(<App />);
    
    // 验证所有主要组件都存在
    expect(screen.getByText('英语对话训练')).toBeInTheDocument();
    expect(screen.getByText('Koala Teacher')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /recording/i })).toBeInTheDocument();
    expect(screen.getByText('对话记录')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /translations/i })).toBeInTheDocument();
  });

  it('should handle translation toggle', () => {
    render(<App />);
    
    const toggleButton = screen.getByRole('button', { name: /translations/i });
    
    // 初始状态应该是关闭
    expect(screen.getByText('中文翻译：关')).toBeInTheDocument();
    
    // 点击切换
    fireEvent.click(toggleButton);
    
    // 状态应该变为开启
    expect(screen.getByText('中文翻译：开')).toBeInTheDocument();
  });

  it('should show empty conversation state initially', () => {
    render(<App />);
    
    expect(screen.getByText('Start a conversation!')).toBeInTheDocument();
    expect(screen.getByText('Click the microphone to begin speaking')).toBeInTheDocument();
  });

  it('should have proper layout structure', () => {
    const { container } = render(<App />);
    
    // 验证布局结构
    expect(container.querySelector('.min-h-screen')).toBeInTheDocument();
    expect(container.querySelector('footer')).toBeInTheDocument();
  });

  it('should maintain state across interactions', () => {
    render(<App />);
    
    const toggleButton = screen.getByRole('button', { name: /translations/i });
    
    // 多次切换
    fireEvent.click(toggleButton);
    expect(screen.getByText('中文翻译：开')).toBeInTheDocument();
    
    fireEvent.click(toggleButton);
    expect(screen.getByText('中文翻译：关')).toBeInTheDocument();
    
    fireEvent.click(toggleButton);
    expect(screen.getByText('中文翻译：开')).toBeInTheDocument();
  });
});
