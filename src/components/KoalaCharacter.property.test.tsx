/**
 * Property-based tests for KoalaCharacter component
 * Feature: english-conversation-trainer, Property 9: 考拉角色状态反馈
 * Validates: Requirements 6.2
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import * as fc from 'fast-check';
import { KoalaCharacter } from './KoalaCharacter';

describe('KoalaCharacter Property Tests', () => {
  describe('Property 9: 考拉角色状态反馈', () => {
    /**
     * Property: For any system processing state (recording or AI thinking),
     * the koala character should display corresponding visual feedback animation.
     */

    it('should always show visual feedback when listening', () => {
      fc.assert(
        fc.property(
          fc.boolean(), // isThinking can be any value
          (isThinking) => {
            const { container, unmount } = render(
              <KoalaCharacter isListening={true} isThinking={isThinking} />
            );
            
            try {
              // Should show listening indicator
              expect(screen.getByText(/Listening/)).toBeInTheDocument();
              
              // Should have scale effect
              const scaledElement = container.querySelector('.scale-110');
              expect(scaledElement).toBeInTheDocument();
              
              // Should have ring effect
              const ringElement = container.querySelector('.ring-4');
              expect(ringElement).toBeInTheDocument();
              
              // Should have ping animation on eyes
              const pingElements = container.querySelectorAll('.animate-ping');
              expect(pingElements.length).toBeGreaterThan(0);
            } finally {
              unmount();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should always show visual feedback when thinking', () => {
      fc.assert(
        fc.property(
          fc.boolean(), // isListening can be any value
          (isListening) => {
            const { container, unmount } = render(
              <KoalaCharacter isListening={isListening} isThinking={true} />
            );
            
            try {
              // If not listening, should show thinking indicator
              if (!isListening) {
                expect(screen.getByText(/Thinking/)).toBeInTheDocument();
              }
              
              // Should have pulse animation
              const pulseElement = container.querySelector('.animate-pulse');
              expect(pulseElement).toBeInTheDocument();
              
              // Should have bounce animation on mouth
              const bounceElements = container.querySelectorAll('.animate-bounce');
              expect(bounceElements.length).toBeGreaterThan(0);
            } finally {
              unmount();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should show no active feedback when idle', () => {
      for (let i = 0; i < 100; i++) {
        const { unmount } = render(<KoalaCharacter isListening={false} isThinking={false} />);
        
        // Should not show any status indicators
        expect(screen.queryByText(/Listening/)).not.toBeInTheDocument();
        expect(screen.queryByText(/Thinking/)).not.toBeInTheDocument();
        
        unmount();
      }
    });

    it('should maintain visual consistency across state combinations', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          fc.boolean(),
          (isListening, isThinking) => {
            const { container, unmount } = render(
              <KoalaCharacter isListening={isListening} isThinking={isThinking} />
            );
            
            try {
              // Should always render the koala character
              expect(screen.getByText('Koala Teacher')).toBeInTheDocument();
              
              // Should always have the main koala face
              const roundedElements = container.querySelectorAll('.rounded-full');
              expect(roundedElements.length).toBeGreaterThan(0);
              
              // Visual feedback should match state
              if (isListening) {
                expect(screen.getByText(/Listening/)).toBeInTheDocument();
              } else if (isThinking) {
                expect(screen.getByText(/Thinking/)).toBeInTheDocument();
              } else {
                expect(screen.queryByText(/Listening/)).not.toBeInTheDocument();
                expect(screen.queryByText(/Thinking/)).not.toBeInTheDocument();
              }
            } finally {
              unmount();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should apply correct animation classes based on state', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          fc.boolean(),
          (isListening, isThinking) => {
            const { container } = render(
              <KoalaCharacter isListening={isListening} isThinking={isThinking} />
            );
            
            if (isListening) {
              // Should have listening animations
              const scaledElement = container.querySelector('.scale-110');
              expect(scaledElement).toBeInTheDocument();
              
              const pingElements = container.querySelectorAll('.animate-ping');
              expect(pingElements.length).toBeGreaterThan(0);
            }
            
            if (isThinking) {
              // Should have thinking animations
              const pulseElement = container.querySelector('.animate-pulse');
              expect(pulseElement).toBeInTheDocument();
              
              const bounceElements = container.querySelectorAll('.animate-bounce');
              expect(bounceElements.length).toBeGreaterThan(0);
            }
            
            if (!isListening && !isThinking) {
              // Should not have active state animations
              const scaledElement = container.querySelector('.scale-110');
              expect(scaledElement).not.toBeInTheDocument();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle state transitions correctly', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              isListening: fc.boolean(),
              isThinking: fc.boolean(),
            }),
            { minLength: 2, maxLength: 10 }
          ),
          (states) => {
            const { rerender, unmount } = render(
              <KoalaCharacter isListening={false} isThinking={false} />
            );
            
            try {
              // Apply each state transition
              for (const state of states) {
                rerender(
                  <KoalaCharacter
                    isListening={state.isListening}
                    isThinking={state.isThinking}
                  />
                );
                
                // Should always render successfully
                expect(screen.getByText('Koala Teacher')).toBeInTheDocument();
                
                // Visual feedback should match current state
                if (state.isListening) {
                  expect(screen.getByText(/Listening/)).toBeInTheDocument();
                } else if (state.isThinking) {
                  expect(screen.getByText(/Thinking/)).toBeInTheDocument();
                }
              }
              
              return true;
            } finally {
              unmount();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should always render core elements regardless of state', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          fc.boolean(),
          (isListening, isThinking) => {
            const { container, unmount } = render(
              <KoalaCharacter isListening={isListening} isThinking={isThinking} />
            );
            
            try {
              // Core elements should always be present
              expect(screen.getByText('Koala Teacher')).toBeInTheDocument();
              expect(screen.getByText('Your English Practice Partner')).toBeInTheDocument();
              
              // Should have koala face elements
              const roundedElements = container.querySelectorAll('.rounded-full');
              expect(roundedElements.length).toBeGreaterThan(5);
              
              // Should have gradient background
              const gradientElement = container.querySelector('.bg-gradient-to-br');
              expect(gradientElement).toBeInTheDocument();
            } finally {
              unmount();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should provide distinct visual feedback for each state', () => {
      for (let i = 0; i < 100; i++) {
        // Render all three states
        const { container: idleContainer, unmount: unmount1 } = render(
          <KoalaCharacter isListening={false} isThinking={false} />
        );
        const { container: listeningContainer, unmount: unmount2 } = render(
          <KoalaCharacter isListening={true} isThinking={false} />
        );
        const { container: thinkingContainer, unmount: unmount3 } = render(
          <KoalaCharacter isListening={false} isThinking={true} />
        );
        
        // Idle should not have scale
        expect(idleContainer.querySelector('.scale-110')).not.toBeInTheDocument();
        
        // Listening should have scale and ping
        expect(listeningContainer.querySelector('.scale-110')).toBeInTheDocument();
        expect(listeningContainer.querySelectorAll('.animate-ping').length).toBeGreaterThan(0);
        
        // Thinking should have pulse and bounce
        expect(thinkingContainer.querySelector('.animate-pulse')).toBeInTheDocument();
        expect(thinkingContainer.querySelectorAll('.animate-bounce').length).toBeGreaterThan(0);
        
        unmount1();
        unmount2();
        unmount3();
      }
    });
  });
});
