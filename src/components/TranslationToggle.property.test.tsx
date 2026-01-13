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

    it('should show/hide all translations consistently', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.uuid(),
              role: fc.constantFrom('user' as const, 'assistant' as const),
              content: fc.string({ minLength: 4, maxLength: 20 }),
              translation: fc.string({ minLength: 4, maxLength: 20 }),
              timestamp: fc.date(),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          fc.boolean(),
          (messages: Message[], showTranslation: boolean) => {
            const { unmount } = render(
              <ConversationDisplay messages={messages} showTranslation={showTranslation} />
            );

            messages.forEach((message) => {
              expect(screen.getByText(message.content)).toBeInTheDocument();
              
              if (showTranslation && message.translation) {
                const translationElements = screen.queryAllByText(message.translation);
                expect(translationElements.length).toBeGreaterThan(0);
              } else if (message.translation) {
                const translationElements = screen.queryAllByText(message.translation);
                expect(translationElements.length).toBe(0);
              }
            });
            
            unmount();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain toggle state across re-renders', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          fc.integer({ min: 1, max: 5 }),
          (initialState: boolean, rerenderCount: number) => {
            const onToggle = jest.fn();
            const { rerender, unmount } = render(
              <TranslationToggle enabled={initialState} onToggle={onToggle} />
            );

            for (let i = 0; i < rerenderCount; i++) {
              rerender(<TranslationToggle enabled={initialState} onToggle={onToggle} />);
              
              const button = screen.getByRole('button');
              expect(button).toHaveAttribute('aria-pressed', String(initialState));
              
              if (initialState) {
                expect(screen.getByText('中文翻译：开')).toBeInTheDocument();
              } else {
                expect(screen.getByText('中文翻译：关')).toBeInTheDocument();
              }
            }
            
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
    it('should include translation for new messages when toggle is enabled', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.uuid(),
              role: fc.constantFrom('user' as const, 'assistant' as const),
              content: fc.string({ minLength: 4, maxLength: 20 }),
              translation: fc.string({ minLength: 4, maxLength: 20 }),
              timestamp: fc.date(),
            }),
            { minLength: 0, maxLength: 5 }
          ),
          fc.record({
            id: fc.uuid(),
            role: fc.constantFrom('user' as const, 'assistant' as const),
            content: fc.string({ minLength: 4, maxLength: 20 }),
            translation: fc.string({ minLength: 4, maxLength: 20 }),
            timestamp: fc.date(),
          }),
          (existingMessages: Message[], newMessage: Message) => {
            const showTranslation = true;
            
            const { rerender, unmount } = render(
              <ConversationDisplay
                messages={existingMessages}
                showTranslation={showTranslation}
              />
            );

            rerender(
              <ConversationDisplay
                messages={[...existingMessages, newMessage]}
                showTranslation={showTranslation}
              />
            );

            expect(screen.getByText(newMessage.content)).toBeInTheDocument();
            
            if (newMessage.translation) {
              const translationElements = screen.queryAllByText(newMessage.translation);
              expect(translationElements.length).toBeGreaterThan(0);
            }
            
            unmount();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle messages without translation gracefully', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.uuid(),
              role: fc.constantFrom('user' as const, 'assistant' as const),
              content: fc.string({ minLength: 4, maxLength: 20 }),
              translation: fc.option(fc.string({ minLength: 4, maxLength: 20 }), { nil: undefined }),
              timestamp: fc.date(),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          (messages: Message[]) => {
            const { unmount } = render(<ConversationDisplay messages={messages} showTranslation={true} />);

            messages.forEach((message) => {
              expect(screen.getByText(message.content)).toBeInTheDocument();
              
              if (message.translation) {
                const translationElements = screen.queryAllByText(message.translation);
                expect(translationElements.length).toBeGreaterThan(0);
              }
            });
            
            unmount();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not show translation for new messages when toggle is disabled', () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.uuid(),
            role: fc.constantFrom('user' as const, 'assistant' as const),
            content: fc.string({ minLength: 4, maxLength: 20 }),
            translation: fc.string({ minLength: 4, maxLength: 20 }),
            timestamp: fc.date(),
          }),
          (newMessage: Message) => {
            const showTranslation = false;
            
            const { unmount } = render(
              <ConversationDisplay
                messages={[newMessage]}
                showTranslation={showTranslation}
              />
            );

            expect(screen.getByText(newMessage.content)).toBeInTheDocument();
            
            if (newMessage.translation) {
              const translationElements = screen.queryAllByText(newMessage.translation);
              expect(translationElements.length).toBe(0);
            }
            
            unmount();
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
