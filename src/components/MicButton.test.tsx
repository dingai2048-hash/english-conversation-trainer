/**
 * Unit tests for MicButton component
 * Tests click events and state-based visual feedback
 * Requirements: 2.1, 2.2, 2.3
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MicButton } from './MicButton';

describe('MicButton', () => {
  const mockOnToggle = jest.fn();

  beforeEach(() => {
    mockOnToggle.mockClear();
  });

  describe('Basic Rendering', () => {
    it('should render the microphone button', () => {
      render(
        <MicButton
          isRecording={false}
          onToggleRecording={mockOnToggle}
          disabled={false}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should show "Tap to speak" when idle', () => {
      render(
        <MicButton
          isRecording={false}
          onToggleRecording={mockOnToggle}
          disabled={false}
        />
      );

      expect(screen.getByText('Tap to speak')).toBeInTheDocument();
    });
  });

  describe('Click Handling', () => {
    it('should call onToggleRecording when clicked', () => {
      render(
        <MicButton
          isRecording={false}
          onToggleRecording={mockOnToggle}
          disabled={false}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockOnToggle).toHaveBeenCalledTimes(1);
    });

    it('should not call onToggleRecording when disabled', () => {
      render(
        <MicButton
          isRecording={false}
          onToggleRecording={mockOnToggle}
          disabled={true}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockOnToggle).not.toHaveBeenCalled();
    });

    it('should handle multiple clicks', () => {
      render(
        <MicButton
          isRecording={false}
          onToggleRecording={mockOnToggle}
          disabled={false}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(mockOnToggle).toHaveBeenCalledTimes(3);
    });
  });

  describe('Recording State', () => {
    it('should show "Recording..." when isRecording is true', () => {
      render(
        <MicButton
          isRecording={true}
          onToggleRecording={mockOnToggle}
          disabled={false}
        />
      );

      expect(screen.getByText('Recording...')).toBeInTheDocument();
    });

    it('should apply recording styles when isRecording is true', () => {
      const { container } = render(
        <MicButton
          isRecording={true}
          onToggleRecording={mockOnToggle}
          disabled={false}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-red-500');
      expect(button).toHaveClass('scale-110');
      expect(button).toHaveClass('animate-pulse');
    });

    it('should show recording indicator ring', () => {
      const { container } = render(
        <MicButton
          isRecording={true}
          onToggleRecording={mockOnToggle}
          disabled={false}
        />
      );

      const ring = container.querySelector('.animate-ping');
      expect(ring).toBeInTheDocument();
    });

    it('should show stop icon when recording', () => {
      const { container } = render(
        <MicButton
          isRecording={true}
          onToggleRecording={mockOnToggle}
          disabled={false}
        />
      );

      const stopIcon = container.querySelector('rect');
      expect(stopIcon).toBeInTheDocument();
    });

    it('should still be clickable when recording', () => {
      render(
        <MicButton
          isRecording={true}
          onToggleRecording={mockOnToggle}
          disabled={false}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockOnToggle).toHaveBeenCalledTimes(1);
    });
  });

  describe('Disabled State', () => {
    it('should show "Processing..." when disabled', () => {
      render(
        <MicButton
          isRecording={false}
          onToggleRecording={mockOnToggle}
          disabled={true}
        />
      );

      expect(screen.getByText('Processing...')).toBeInTheDocument();
    });

    it('should apply disabled styles', () => {
      render(
        <MicButton
          isRecording={false}
          onToggleRecording={mockOnToggle}
          disabled={true}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-gray-300');
      expect(button).toHaveClass('cursor-not-allowed');
      expect(button).toBeDisabled();
    });

    it('should not show hover effects when disabled', () => {
      const { container } = render(
        <MicButton
          isRecording={false}
          onToggleRecording={mockOnToggle}
          disabled={true}
        />
      );

      const button = screen.getByRole('button');
      expect(button).not.toHaveClass('shadow-lg');
    });
  });

  describe('Idle State', () => {
    it('should apply idle styles', () => {
      render(
        <MicButton
          isRecording={false}
          onToggleRecording={mockOnToggle}
          disabled={false}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-blue-500');
    });

    it('should show microphone icon when idle', () => {
      const { container } = render(
        <MicButton
          isRecording={false}
          onToggleRecording={mockOnToggle}
          disabled={false}
        />
      );

      const micIcon = container.querySelector('path');
      expect(micIcon).toBeInTheDocument();
    });

    it('should not show recording indicator when idle', () => {
      const { container } = render(
        <MicButton
          isRecording={false}
          onToggleRecording={mockOnToggle}
          disabled={false}
        />
      );

      const ring = container.querySelector('.animate-ping');
      expect(ring).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-label when idle', () => {
      render(
        <MicButton
          isRecording={false}
          onToggleRecording={mockOnToggle}
          disabled={false}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Start recording');
    });

    it('should have proper aria-label when recording', () => {
      render(
        <MicButton
          isRecording={true}
          onToggleRecording={mockOnToggle}
          disabled={false}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Stop recording');
    });

    it('should have aria-pressed attribute', () => {
      const { rerender } = render(
        <MicButton
          isRecording={false}
          onToggleRecording={mockOnToggle}
          disabled={false}
        />
      );

      let button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-pressed', 'false');

      rerender(
        <MicButton
          isRecording={true}
          onToggleRecording={mockOnToggle}
          disabled={false}
        />
      );

      button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });

    it('should be keyboard accessible', () => {
      render(
        <MicButton
          isRecording={false}
          onToggleRecording={mockOnToggle}
          disabled={false}
        />
      );

      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });
  });

  describe('State Transitions', () => {
    it('should update when isRecording changes', () => {
      const { rerender } = render(
        <MicButton
          isRecording={false}
          onToggleRecording={mockOnToggle}
          disabled={false}
        />
      );

      expect(screen.getByText('Tap to speak')).toBeInTheDocument();

      rerender(
        <MicButton
          isRecording={true}
          onToggleRecording={mockOnToggle}
          disabled={false}
        />
      );

      expect(screen.getByText('Recording...')).toBeInTheDocument();
    });

    it('should update when disabled changes', () => {
      const { rerender } = render(
        <MicButton
          isRecording={false}
          onToggleRecording={mockOnToggle}
          disabled={false}
        />
      );

      expect(screen.getByText('Tap to speak')).toBeInTheDocument();

      rerender(
        <MicButton
          isRecording={false}
          onToggleRecording={mockOnToggle}
          disabled={true}
        />
      );

      expect(screen.getByText('Processing...')).toBeInTheDocument();
    });

    it('should handle rapid state changes', () => {
      const { rerender } = render(
        <MicButton
          isRecording={false}
          onToggleRecording={mockOnToggle}
          disabled={false}
        />
      );

      rerender(
        <MicButton
          isRecording={true}
          onToggleRecording={mockOnToggle}
          disabled={false}
        />
      );

      rerender(
        <MicButton
          isRecording={false}
          onToggleRecording={mockOnToggle}
          disabled={true}
        />
      );

      rerender(
        <MicButton
          isRecording={false}
          onToggleRecording={mockOnToggle}
          disabled={false}
        />
      );

      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });
});
