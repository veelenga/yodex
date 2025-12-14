import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AnswerOption from './AnswerOption';

describe('AnswerOption', () => {
  const defaultProps = {
    index: 0,
    content: 'Test answer option',
    optionClassName: 'answer-option answer-option-default',
    labelClassName: 'answer-label answer-label-default',
    showCorrect: false,
    showIncorrect: false,
    disabled: false,
    onSelect: vi.fn(),
    variant: 'mobile',
  };

  it('renders the option content', () => {
    render(<AnswerOption {...defaultProps} />);
    expect(screen.getByText('Test answer option')).toBeInTheDocument();
  });

  it('renders correct label (A, B, C, D)', () => {
    render(<AnswerOption {...defaultProps} index={0} />);
    expect(screen.getByText('A')).toBeInTheDocument();

    render(<AnswerOption {...defaultProps} index={1} />);
    expect(screen.getByText('B')).toBeInTheDocument();

    render(<AnswerOption {...defaultProps} index={2} />);
    expect(screen.getByText('C')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', () => {
    const onSelect = vi.fn();
    render(<AnswerOption {...defaultProps} onSelect={onSelect} index={1} />);

    fireEvent.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalledWith(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<AnswerOption {...defaultProps} disabled={true} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows check icon when showCorrect is true', () => {
    render(<AnswerOption {...defaultProps} showCorrect={true} />);
    expect(screen.queryByText('A')).not.toBeInTheDocument();
  });

  it('shows X icon when showIncorrect is true', () => {
    render(<AnswerOption {...defaultProps} showIncorrect={true} />);
    expect(screen.queryByText('A')).not.toBeInTheDocument();
  });

  it('applies correct className', () => {
    render(<AnswerOption {...defaultProps} optionClassName="test-class" />);
    expect(screen.getByRole('button')).toHaveClass('test-class');
  });

  it('renders mobile variant with smaller icon', () => {
    const { container } = render(<AnswerOption {...defaultProps} variant="mobile" showCorrect={true} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('w-6', 'h-6');
  });

  it('renders desktop variant with larger icon', () => {
    const { container } = render(<AnswerOption {...defaultProps} variant="desktop" showCorrect={true} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('w-7', 'h-7');
  });
});
