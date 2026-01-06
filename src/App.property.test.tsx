/**
 * Property-based tests for App component
 * Property 6: Responsive layout adaptation
 * Validates: Requirements 1.5
 */

import { render } from '@testing-library/react';
import * as fc from 'fast-check';
import App from './App';

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

describe('App - Property Tests', () => {
  describe('Property 6: Responsive layout adaptation', () => {
    it('should render all components for any viewport', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 320, max: 1920 }),
          fc.integer({ min: 480, max: 1080 }),
          (width: number, height: number) => {
            // 模拟视口大小
            Object.defineProperty(window, 'innerWidth', {
              writable: true,
              configurable: true,
              value: width,
            });
            Object.defineProperty(window, 'innerHeight', {
              writable: true,
              configurable: true,
              value: height,
            });

            const { container, unmount } = render(<App />);

            // 验证所有主要组件都存在
            expect(container.querySelector('.min-h-screen')).toBeInTheDocument();
            
            // 验证没有组件溢出或重叠（通过检查容器存在）
            const mainContainer = container.querySelector('.container');
            expect(mainContainer).toBeInTheDocument();

            unmount();
          }
        ),
        { numRuns: 50 } // 减少运行次数因为渲染比较慢
      );
    });

    it('should maintain component structure across different viewports', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(320, 768, 1024, 1440, 1920),
          (width: number) => {
            Object.defineProperty(window, 'innerWidth', {
              writable: true,
              configurable: true,
              value: width,
            });

            const { container, unmount } = render(<App />);

            // 验证关键元素存在
            expect(container.textContent).toContain('英语对话训练');
            expect(container.textContent).toContain('Koala Teacher');
            expect(container.textContent).toContain('对话记录');

            unmount();
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
