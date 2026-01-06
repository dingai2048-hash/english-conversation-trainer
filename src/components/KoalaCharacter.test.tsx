/**
 * Unit tests for KoalaCharacter component
 * Tests rendering and state-based visual feedback
 * Requirements: 6.2, 6.3
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { KoalaCharacter } from './KoalaCharacter';

describe('KoalaCharacter', () => {
  describe('Basic Rendering', () => {
    it('should render the koala character', () => {
      render(<KoalaCharacter isListening={false} isThinking={false} />);
      
      expect(screen.getByText('Koala Teacher')).toBeInTheDocument();
      expect(screen.getByText('Your English Practice Partner')).toBeInTheDocument();
    });

    it('should render in idle state by default', () => {
      const { container } = render(
        <KoalaCharacter isListening={false} isThinking={false} />
      );
      
      // Should not show status indicators
      expect(screen.queryByText(/Listening/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Thinking/)).not.toBeInTheDocument();
      
      // Should render the koala face
      expect(container.querySelector('.rounded-full')).toBeInTheDocument();
    });
  });

  describe('Listening State', () => {
    it('should show listening indicator when isListening is true', () => {
      render(<KoalaCharacter isListening={true} isThinking={false} />);
      
      expect(screen.getByText(/Listening/)).toBeInTheDocument();
      expect(screen.getByText(/🎤/)).toBeInTheDocument();
    });

    it('should apply listening styles when isListening is true', () => {
      const { container } = render(
        <KoalaCharacter isListening={true} isThinking={false} />
      );
      
      // Check for scale and ring classes
      const koalaContainer = container.querySelector('.scale-110');
      expect(koalaContainer).toBeInTheDocument();
      
      const ringElement = container.querySelector('.ring-4');
      expect(ringElement).toBeInTheDocument();
    });

    it('should not show thinking indicator when only listening', () => {
      render(<KoalaCharacter isListening={true} isThinking={false} />);
      
      expect(screen.queryByText(/Thinking/)).not.toBeInTheDocument();
    });

    it('should show listening animation', () => {
      const { container } = render(
        <KoalaCharacter isListening={true} isThinking={false} />
      );
      
      // Check for ping animation on eyes
      const pingElements = container.querySelectorAll('.animate-ping');
      expect(pingElements.length).toBeGreaterThan(0);
    });
  });

  describe('Thinking State', () => {
    it('should show thinking indicator when isThinking is true', () => {
      render(<KoalaCharacter isListening={false} isThinking={true} />);
      
      expect(screen.getByText(/Thinking/)).toBeInTheDocument();
      expect(screen.getByText(/💭/)).toBeInTheDocument();
    });

    it('should apply thinking styles when isThinking is true', () => {
      const { container } = render(
        <KoalaCharacter isListening={false} isThinking={true} />
      );
      
      // Check for pulse animation
      const pulseElement = container.querySelector('.animate-pulse');
      expect(pulseElement).toBeInTheDocument();
    });

    it('should not show listening indicator when only thinking', () => {
      render(<KoalaCharacter isListening={false} isThinking={true} />);
      
      expect(screen.queryByText(/Listening/)).not.toBeInTheDocument();
    });

    it('should show thinking animation on mouth', () => {
      const { container } = render(
        <KoalaCharacter isListening={false} isThinking={true} />
      );
      
      // Check for bounce animation
      const bounceElements = container.querySelectorAll('.animate-bounce');
      expect(bounceElements.length).toBeGreaterThan(0);
    });
  });

  describe('Combined States', () => {
    it('should handle both listening and thinking being true', () => {
      render(<KoalaCharacter isListening={true} isThinking={true} />);
      
      // Should show listening indicator (takes precedence in UI)
      expect(screen.getByText(/Listening/)).toBeInTheDocument();
    });

    it('should handle both states being false', () => {
      render(<KoalaCharacter isListening={false} isThinking={false} />);
      
      expect(screen.queryByText(/Listening/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Thinking/)).not.toBeInTheDocument();
    });
  });

  describe('Visual Elements', () => {
    it('should render koala face elements', () => {
      const { container } = render(
        <KoalaCharacter isListening={false} isThinking={false} />
      );
      
      // Check for multiple rounded elements (ears, eyes, nose, etc.)
      const roundedElements = container.querySelectorAll('.rounded-full');
      expect(roundedElements.length).toBeGreaterThan(5); // Multiple face elements
    });

    it('should render with proper styling classes', () => {
      const { container } = render(
        <KoalaCharacter isListening={false} isThinking={false} />
      );
      
      // Check for gradient background
      const gradientElement = container.querySelector('.bg-gradient-to-br');
      expect(gradientElement).toBeInTheDocument();
      
      // Check for shadow
      const shadowElement = container.querySelector('.shadow-lg');
      expect(shadowElement).toBeInTheDocument();
    });

    it('should render character name and description', () => {
      render(<KoalaCharacter isListening={false} isThinking={false} />);
      
      const title = screen.getByText('Koala Teacher');
      expect(title).toHaveClass('text-2xl', 'font-bold');
      
      const description = screen.getByText('Your English Practice Partner');
      expect(description).toHaveClass('text-sm');
    });
  });

  describe('State Transitions', () => {
    it('should update when isListening changes', () => {
      const { rerender } = render(
        <KoalaCharacter isListening={false} isThinking={false} />
      );
      
      expect(screen.queryByText(/Listening/)).not.toBeInTheDocument();
      
      rerender(<KoalaCharacter isListening={true} isThinking={false} />);
      
      expect(screen.getByText(/Listening/)).toBeInTheDocument();
    });

    it('should update when isThinking changes', () => {
      const { rerender } = render(
        <KoalaCharacter isListening={false} isThinking={false} />
      );
      
      expect(screen.queryByText(/Thinking/)).not.toBeInTheDocument();
      
      rerender(<KoalaCharacter isListening={false} isThinking={true} />);
      
      expect(screen.getByText(/Thinking/)).toBeInTheDocument();
    });

    it('should transition from listening to thinking', () => {
      const { rerender } = render(
        <KoalaCharacter isListening={true} isThinking={false} />
      );
      
      expect(screen.getByText(/Listening/)).toBeInTheDocument();
      
      rerender(<KoalaCharacter isListening={false} isThinking={true} />);
      
      expect(screen.queryByText(/Listening/)).not.toBeInTheDocument();
      expect(screen.getByText(/Thinking/)).toBeInTheDocument();
    });

    it('should transition back to idle', () => {
      const { rerender } = render(
        <KoalaCharacter isListening={true} isThinking={false} />
      );
      
      expect(screen.getByText(/Listening/)).toBeInTheDocument();
      
      rerender(<KoalaCharacter isListening={false} isThinking={false} />);
      
      expect(screen.queryByText(/Listening/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Thinking/)).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should render with proper structure', () => {
      const { container } = render(
        <KoalaCharacter isListening={false} isThinking={false} />
      );
      
      // Should have main container
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should display status text when active', () => {
      render(<KoalaCharacter isListening={true} isThinking={false} />);
      
      const statusText = screen.getByText(/Listening/);
      expect(statusText).toBeVisible();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid state changes', () => {
      const { rerender } = render(
        <KoalaCharacter isListening={false} isThinking={false} />
      );
      
      // Rapidly change states
      rerender(<KoalaCharacter isListening={true} isThinking={false} />);
      rerender(<KoalaCharacter isListening={false} isThinking={true} />);
      rerender(<KoalaCharacter isListening={true} isThinking={true} />);
      rerender(<KoalaCharacter isListening={false} isThinking={false} />);
      
      // Should still render correctly
      expect(screen.getByText('Koala Teacher')).toBeInTheDocument();
    });

    it('should maintain structure with all states', () => {
      const { container: container1 } = render(
        <KoalaCharacter isListening={false} isThinking={false} />
      );
      const { container: container2 } = render(
        <KoalaCharacter isListening={true} isThinking={false} />
      );
      const { container: container3 } = render(
        <KoalaCharacter isListening={false} isThinking={true} />
      );
      
      // All should have similar structure
      expect(container1.querySelector('.rounded-full')).toBeInTheDocument();
      expect(container2.querySelector('.rounded-full')).toBeInTheDocument();
      expect(container3.querySelector('.rounded-full')).toBeInTheDocument();
    });
  });
});
