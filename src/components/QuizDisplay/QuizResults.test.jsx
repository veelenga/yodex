import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import QuizResults from './QuizResults';

describe('QuizResults', () => {
  const defaultProps = {
    score: { correct: 8, total: 10, percentage: 80 },
    repoInfo: {
      metadata: { fullName: 'test/repo' },
      selectedQuestions: 10,
      totalQuestions: 50,
    },
    onReset: vi.fn(),
  };

  it('renders score percentage', () => {
    render(<QuizResults {...defaultProps} />);
    expect(screen.getByText('80%')).toBeInTheDocument();
  });

  it('renders correct/total count', () => {
    render(<QuizResults {...defaultProps} />);
    expect(screen.getByText('8 out of 10 correct')).toBeInTheDocument();
  });

  it('renders repository name', () => {
    render(<QuizResults {...defaultProps} />);
    expect(screen.getByText('test/repo')).toBeInTheDocument();
  });

  it('renders question stats', () => {
    render(<QuizResults {...defaultProps} />);
    expect(screen.getByText(/10 selected from 50 total/)).toBeInTheDocument();
  });

  it('calls onReset when New Quiz button clicked', () => {
    const onReset = vi.fn();
    render(<QuizResults {...defaultProps} onReset={onReset} />);

    fireEvent.click(screen.getByRole('button', { name: /new quiz/i }));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('shows perfect score message for 100%', () => {
    render(
      <QuizResults
        {...defaultProps}
        score={{ correct: 10, total: 10, percentage: 100 }}
      />
    );
    expect(screen.getByText(/perfect score/i)).toBeInTheDocument();
  });

  it('shows great job message for 80-99%', () => {
    render(
      <QuizResults
        {...defaultProps}
        score={{ correct: 8, total: 10, percentage: 80 }}
      />
    );
    expect(screen.getByText(/great job/i)).toBeInTheDocument();
  });

  it('shows good effort message for 60-79%', () => {
    render(
      <QuizResults
        {...defaultProps}
        score={{ correct: 7, total: 10, percentage: 70 }}
      />
    );
    expect(screen.getByText(/good effort/i)).toBeInTheDocument();
  });

  it('shows keep learning message for below 60%', () => {
    render(
      <QuizResults
        {...defaultProps}
        score={{ correct: 5, total: 10, percentage: 50 }}
      />
    );
    expect(screen.getByText(/keep learning/i)).toBeInTheDocument();
  });

  it('renders Quiz Complete title', () => {
    render(<QuizResults {...defaultProps} />);
    expect(screen.getByText('Quiz Complete!')).toBeInTheDocument();
  });

  it('renders trophy icon', () => {
    const { container } = render(<QuizResults {...defaultProps} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
