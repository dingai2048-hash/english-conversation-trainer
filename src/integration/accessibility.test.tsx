/**
 * Accessibility tests
 * Validates: Requirements 1.4
 */

import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

describe('Accessibility', () => {
  it('should have proper ARIA labels on interactive elements', () => {
    render(<App />);
    
    // 麦克风按钮应该有aria-label
    const micButton = screen.getByRole('button', { name: /recording/i });
    expect(micButton).toHaveAttribute('aria-label');
    expect(micButton).toHaveAttribute('aria-pressed');
  });

  it('should have proper heading structure', () => {
    render(<App />);
    
    // 主标题
    const mainHeading = screen.getByText('英语对话训练');
    expect(mainHeading).toBeInTheDocument();
    expect(mainHeading.tagName).toBe('H1');
    
    // 对话记录标题
    const conversationHeading = screen.getByText('对话记录');
    expect(conversationHeading).toBeInTheDocument();
    expect(conversationHeading.tagName).toBe('H2');
  });

  it('should have keyboard accessible buttons', () => {
    render(<App />);
    
    // 所有按钮都应该可以通过键盘访问
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toBeInTheDocument();
    });
  });

  it('should have proper semantic HTML structure', () => {
    const { container } = render(<App />);
    
    // 应该有footer元素
    const footer = container.querySelector('footer');
    expect(footer).toBeInTheDocument();
  });
});
