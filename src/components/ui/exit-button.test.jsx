import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ExitButton } from './exit-button';

describe('ExitButton', () => {
  it('renders the button', () => {
    render(<ExitButton onClick={vi.fn()} />);
    expect(screen.getByRole('button', { name: /exit quiz/i })).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<ExitButton onClick={onClick} />);

    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders X icon', () => {
    const { container } = render(<ExitButton onClick={vi.fn()} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('applies default variant', () => {
    render(<ExitButton onClick={vi.fn()} />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('h-8', 'w-8', 'p-0');
  });

  it('applies custom className', () => {
    render(<ExitButton onClick={vi.fn()} className="custom-class" />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('applies custom variant', () => {
    render(<ExitButton onClick={vi.fn()} variant="outline" />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('has proper accessibility label', () => {
    render(<ExitButton onClick={vi.fn()} />);
    expect(screen.getByLabelText('Exit quiz')).toBeInTheDocument();
  });

  it('applies hover styles via className', () => {
    render(<ExitButton onClick={vi.fn()} />);
    const button = screen.getByRole('button');
    expect(button.className).toContain('hover:bg-destructive/10');
  });

  it('is clickable and not disabled by default', () => {
    render(<ExitButton onClick={vi.fn()} />);
    const button = screen.getByRole('button');
    expect(button).not.toBeDisabled();
  });
});
