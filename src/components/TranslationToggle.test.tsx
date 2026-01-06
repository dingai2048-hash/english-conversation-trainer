import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TranslationToggle } from './TranslationToggle';

describe('TranslationToggle', () => {
  it('should render with enabled state', () => {
    const onToggle = jest.fn();
    render(<TranslationToggle enabled={true} onToggle={onToggle} />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('中文翻译：开');
    expect(button).toHaveClass('bg-green-500');
  });

  it('should render with disabled state', () => {
    const onToggle = jest.fn();
    render(<TranslationToggle enabled={false} onToggle={onToggle} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('中文翻译：关');
    expect(button).toHaveClass('bg-gray-300');
  });

  it('should call onToggle when clicked', () => {
    const onToggle = jest.fn();
    render(<TranslationToggle enabled={false} onToggle={onToggle} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('should have correct aria-label when enabled', () => {
    const onToggle = jest.fn();
    render(<TranslationToggle enabled={true} onToggle={onToggle} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Hide translations');
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('should have correct aria-label when disabled', () => {
    const onToggle = jest.fn();
    render(<TranslationToggle enabled={false} onToggle={onToggle} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Show translations');
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('should toggle multiple times', () => {
    const onToggle = jest.fn();
    const { rerender } = render(<TranslationToggle enabled={false} onToggle={onToggle} />);
    
    const button = screen.getByRole('button');
    
    // First click
    fireEvent.click(button);
    expect(onToggle).toHaveBeenCalledTimes(1);
    
    // Simulate state change
    rerender(<TranslationToggle enabled={true} onToggle={onToggle} />);
    expect(button).toHaveTextContent('中文翻译：开');
    
    // Second click
    fireEvent.click(button);
    expect(onToggle).toHaveBeenCalledTimes(2);
    
    // Simulate state change back
    rerender(<TranslationToggle enabled={false} onToggle={onToggle} />);
    expect(button).toHaveTextContent('中文翻译：关');
  });

  it('should render translation icon', () => {
    const onToggle = jest.fn();
    const { container } = render(<TranslationToggle enabled={true} onToggle={onToggle} />);
    
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should have focus styles', () => {
    const onToggle = jest.fn();
    render(<TranslationToggle enabled={true} onToggle={onToggle} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('focus:outline-none', 'focus:ring-2');
  });
});
