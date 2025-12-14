import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import QuizExplanation from './QuizExplanation';

describe('QuizExplanation', () => {
  it('renders explanation content', () => {
    render(<QuizExplanation explanation="This is the explanation" />);
    expect(screen.getByText('This is the explanation')).toBeInTheDocument();
  });

  it('renders explanation title', () => {
    render(<QuizExplanation explanation="Test" />);
    expect(screen.getByText('Explanation')).toBeInTheDocument();
  });

  it('returns null when explanation is empty', () => {
    const { container } = render(<QuizExplanation explanation="" />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null when explanation is undefined', () => {
    const { container } = render(<QuizExplanation explanation={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null when explanation is null', () => {
    const { container } = render(<QuizExplanation explanation={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('applies custom className', () => {
    const { container } = render(
      <QuizExplanation explanation="Test" className="mt-4" />
    );
    expect(container.firstChild).toHaveClass('explanation-box', 'mt-4');
  });

  it('has correct structure', () => {
    const { container } = render(<QuizExplanation explanation="Test content" />);

    expect(container.querySelector('.explanation-title')).toBeInTheDocument();
    expect(container.querySelector('.explanation-content')).toBeInTheDocument();
  });
});
