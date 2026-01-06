/**
 * Property-based tests for TranslationToggle component
 * Property 4: Translation toggle consistency
 * Property 5: New message auto-translation
 * Validates: Requirements 7.2, 7.3, 7.4, 7.6
 */

import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import * as fc from 'fast-check';
import { TranslationToggle } from './TranslationToggle';
import { ConversationDisplay } from './ConversationDisplay';
import { Message } from '../types';

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

describe('TranslationToggle - Property Tests', () => {
  afterEach(() => {
    cleanup();
  });

  describe('Property 4: Translation toggle consistency', () => {
    it('should consistently toggle between enabled and disabled states', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          fc.integer({ min: 1, max: 10 }),
          (initialState: boolean, toggleCount: number) => {
            let currentState = initialState;
            const onToggle = jest.fn(() => {
              currentState = !currentState;
            });

            const { rerender, unmount } = render(
              <TranslationToggle enabled={currentState} onToggle={onToggle} />
            );

            for (let i = 0; i < toggleCount; i++) {
              const button = screen.getByRole('button');
              fireEvent.click(button);
              
              rerender(<TranslationToggle enabled={currentState} onToggle={onToggle} />);
              
              const expectedState = initialState ? (i + 1) % 2 === 0 : (i + 1) % 2 === 1;
              expect(currentState).toBe(expectedState);
            }

            expect(onToggle).toHaveBeenCalledTimes(toggleCount);
            unmount();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have correct visual state for any enabled value', () => {
      fc.assert(
        fc.property(fc.boolean(), (enabled: boolean) => {
          const onToggle = jest.fn();
          const { unmount } = render(<TranslationToggle enabled={enabled} onToggle={onToggle} />);

          const button = screen.getByRole('button');
          
          if (enabled) {
            expect(button).toHaveClass('bg-green-500');
            expect(screen.getByText('中文翻译：开')).toBeInTheDocument();
            expect(button).toHaveAttribute('aria-label', 'Hide translations');
          } else {
            expect(button).toHaveClass('bg-gray-300');
            expect(screen.getByText('中文翻译：关')).toBeInTheDocument();
            expect(button).toHaveAttribute('aria-label', 'Show translations');
          }
          
          unmount();
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 5: New message auto-translation', () => {
    it('should not show translation when toggle is disabled', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 1000 }),
          fc.integer({ min: 1, max: 1000 }),
          (contentNum: number, translationNum: number) => {
            const newMessage: Message = {
              id: fc.sample(fc.uuid(), 1)[0],
              role: 'user',
              content: `Content-${contentNum}`,
              translation: `Translation-${translationNum}`,
              timestamp: new Date(),
            };
            
            const showTranslation = false;
            
            const { unmount } = render(
              <ConversationDisplay
                messages={[newMessage]}
                showTranslation={showTranslation}
              />
            );

            expect(screen.getByText(newMessage.content)).toBeInTheDocument();
            
            const translationElements = screen.queryAllByText(newMessage.translation!);
            expect(translationElements.length).toBe(0);
            
            unmount();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should show translation when toggle is enabled', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 1000 }),
          fc.integer({ min: 1, max: 1000 }),
          (contentNum: number, translationNum: number) => {
            const newMessage: Message = {
              id: fc.sample(fc.uuid(), 1)[0],
              role: 'assistant',
              content: `Content-${contentNum}`,
              translation: `Translation-${translationNum}`,
              timestamp: new Date(),
            };
            
            const showTranslation = true;
            
            const { unmount } = render(
              <ConversationDisplay
                messages={[newMessage]}
                showTranslation={showTranslation}
              />
            );

            expect(screen.getByText(newMessage.content)).toBeInTheDocument();
            
            const translationElements = screen.queryAllByText(newMessage.translation!);
            expect(translationElements.length).toBeGreaterThan(0);
            
            unmount();
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
