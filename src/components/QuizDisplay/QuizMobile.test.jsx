import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import QuizMobile from './QuizMobile';

const defaultProps = {
  currentQuestion: {
    question: 'What is 2 + 2?',
    options: ['3', '4', '5', '6'],
    correctIndex: 1,
    explanation: 'Basic math',
  },
  currentQuestionIndex: 0,
  quizLength: 10,
  progressPercentage: 10,
  selectedAnswer: null,
  onAnswerSelect: vi.fn(),
  onNext: vi.fn(),
  isLastQuestion: false,
};

describe('QuizMobile', () => {
  it('renders question text', () => {
    render(<QuizMobile {...defaultProps} />);
    expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument();
  });

  it('renders all options', () => {
    render(<QuizMobile {...defaultProps} />);
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
  });

  it('renders progress indicator', () => {
    render(<QuizMobile {...defaultProps} />);
    expect(screen.getByText('Question 1/10')).toBeInTheDocument();
    expect(screen.getByText('10%')).toBeInTheDocument();
  });

  it('calls onAnswerSelect when option clicked', () => {
    const onAnswerSelect = vi.fn();
    render(<QuizMobile {...defaultProps} onAnswerSelect={onAnswerSelect} />);

    fireEvent.click(screen.getByText('4'));
    expect(onAnswerSelect).toHaveBeenCalledWith(1);
  });

  it('disables Next button when no answer selected', () => {
    render(<QuizMobile {...defaultProps} />);
    expect(screen.getByRole('button', { name: /next question/i })).toBeDisabled();
  });

  it('enables Next button after answer selected', () => {
    render(<QuizMobile {...defaultProps} selectedAnswer={1} />);
    expect(screen.getByRole('button', { name: /next question/i })).toBeEnabled();
  });

  it('calls onNext when Next button clicked', () => {
    const onNext = vi.fn();
    render(<QuizMobile {...defaultProps} selectedAnswer={1} onNext={onNext} />);

    fireEvent.click(screen.getByRole('button', { name: /next question/i }));
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('shows View Results on last question', () => {
    render(<QuizMobile {...defaultProps} selectedAnswer={1} isLastQuestion={true} />);
    expect(screen.getByRole('button', { name: /view results/i })).toBeInTheDocument();
  });

  it('shows explanation after answering', () => {
    render(<QuizMobile {...defaultProps} selectedAnswer={1} />);
    expect(screen.getByText('Explanation')).toBeInTheDocument();
    expect(screen.getByText('Basic math')).toBeInTheDocument();
  });

  it('does not show explanation before answering', () => {
    render(<QuizMobile {...defaultProps} />);
    expect(screen.queryByText('Explanation')).not.toBeInTheDocument();
  });

  it('disables options after answer selected', () => {
    render(<QuizMobile {...defaultProps} selectedAnswer={1} />);

    const optionButtons = screen.getAllByRole('button').filter(
      btn => !btn.textContent.includes('Next') && !btn.textContent.includes('View')
    );

    optionButtons.forEach(btn => {
      expect(btn).toBeDisabled();
    });
  });

  it('renders option labels A, B, C, D', () => {
    render(<QuizMobile {...defaultProps} />);
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('D')).toBeInTheDocument();
  });
});
