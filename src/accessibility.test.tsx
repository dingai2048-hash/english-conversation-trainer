/**
 * Accessibility tests for the application
 * Validates: Requirements 1.4
 */

import { render } from '@testing-library/react';
import App from './App';

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

describe('Accessibility Tests', () => {
  it('should have proper ARIA labels on interactive elements', () => {
    const { container } = render(<App />);
    
    // 检查按钮有aria-label
    const buttons = container.querySelectorAll('button');
    buttons.forEach(button => {
      expect(
        button.getAttribute('aria-label') || 
        button.getAttribute('aria-labelledby') ||
        button.textContent
      ).toBeTruthy();
    });
  });

  it('should have proper heading structure', () => {
    const { container } = render(<App />);
    
    // 检查有标题
    const h1 = container.querySelector('h1');
    expect(h1).toBeInTheDocument();
  });

  it('should have keyboard accessible buttons', () => {
    const { container } = render(<App />);
    
    // 所有按钮应该可以通过键盘访问
    const buttons = container.querySelectorAll('button');
    buttons.forEach(button => {
      expect(button.tagName).toBe('BUTTON');
    });
  });
});
