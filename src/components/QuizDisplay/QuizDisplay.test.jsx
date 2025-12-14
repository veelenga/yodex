import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import QuizDisplay from './QuizDisplay';

const createMockQuiz = (numQuestions = 3) =>
  Array.from({ length: numQuestions }, (_, i) => ({
    id: `q${i + 1}`,
    question: `Question ${i + 1}?`,
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctIndex: 1,
    explanation: `Explanation for question ${i + 1}`,
  }));

const defaultRepoInfo = {
  metadata: { fullName: 'test/repo' },
  selectedQuestions: 3,
  totalQuestions: 10,
};

describe('QuizDisplay', () => {
  const getDesktopView = () => screen.getByTestId?.('quiz-desktop') ||
    document.querySelector('.hidden.md\\:block') ||
    document.querySelector('[class*="md:block"]');

  it('renders question in both mobile and desktop views', () => {
    render(
      <QuizDisplay
        quiz={createMockQuiz()}
        repoInfo={defaultRepoInfo}
        onReset={vi.fn()}
      />
    );
    expect(screen.getAllByText('Question 1?').length).toBeGreaterThan(0);
  });

  it('renders all answer options', () => {
    render(
      <QuizDisplay
        quiz={createMockQuiz()}
        repoInfo={defaultRepoInfo}
        onReset={vi.fn()}
      />
    );
    expect(screen.getAllByText('Option A').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Option B').length).toBeGreaterThan(0);
  });

  it('enables Next button after selecting answer', () => {
    render(
      <QuizDisplay
        quiz={createMockQuiz()}
        repoInfo={defaultRepoInfo}
        onReset={vi.fn()}
      />
    );

    const optionButtons = screen.getAllByText('Option A');
    fireEvent.click(optionButtons[0]);

    const nextButtons = screen.getAllByRole('button', { name: /next question/i });
    expect(nextButtons.some(btn => !btn.disabled)).toBe(true);
  });

  it('advances to next question when Next clicked', () => {
    render(
      <QuizDisplay
        quiz={createMockQuiz()}
        repoInfo={defaultRepoInfo}
        onReset={vi.fn()}
      />
    );

    const optionButtons = screen.getAllByText('Option A');
    fireEvent.click(optionButtons[0]);

    const nextButtons = screen.getAllByRole('button', { name: /next question/i });
    fireEvent.click(nextButtons[0]);

    expect(screen.getAllByText('Question 2?').length).toBeGreaterThan(0);
  });

  it('shows View Results on last question', () => {
    render(
      <QuizDisplay
        quiz={createMockQuiz(1)}
        repoInfo={defaultRepoInfo}
        onReset={vi.fn()}
      />
    );

    const optionButtons = screen.getAllByText('Option A');
    fireEvent.click(optionButtons[0]);

    expect(screen.getAllByRole('button', { name: /view results/i }).length).toBeGreaterThan(0);
  });

  it('shows results after completing quiz', () => {
    render(
      <QuizDisplay
        quiz={createMockQuiz(1)}
        repoInfo={defaultRepoInfo}
        onReset={vi.fn()}
      />
    );

    const optionButtons = screen.getAllByText('Option A');
    fireEvent.click(optionButtons[0]);

    const viewResultsButtons = screen.getAllByRole('button', { name: /view results/i });
    fireEvent.click(viewResultsButtons[0]);

    expect(screen.getByText('Quiz Complete!')).toBeInTheDocument();
  });

  it('calculates score correctly', () => {
    render(
      <QuizDisplay
        quiz={createMockQuiz(2)}
        repoInfo={defaultRepoInfo}
        onReset={vi.fn()}
      />
    );

    // Answer first question correctly (Option B, index 1)
    let correctOptions = screen.getAllByText('Option B');
    fireEvent.click(correctOptions[0]);

    let nextButtons = screen.getAllByRole('button', { name: /next question/i });
    fireEvent.click(nextButtons[0]);

    // Answer second question incorrectly (Option A, index 0)
    const wrongOptions = screen.getAllByText('Option A');
    fireEvent.click(wrongOptions[0]);

    const viewResultsButtons = screen.getAllByRole('button', { name: /view results/i });
    fireEvent.click(viewResultsButtons[0]);

    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('1 out of 2 correct')).toBeInTheDocument();
  });

  it('disables options after selection', () => {
    render(
      <QuizDisplay
        quiz={createMockQuiz()}
        repoInfo={defaultRepoInfo}
        onReset={vi.fn()}
      />
    );

    const optionButtons = screen.getAllByText('Option A');
    fireEvent.click(optionButtons[0]);

    // Check that clicking again doesn't change anything (options disabled)
    const allOptionA = screen.getAllByText('Option A');
    allOptionA.forEach(opt => {
      const button = opt.closest('button');
      if (button) {
        expect(button).toBeDisabled();
      }
    });
  });

  it('shows explanation after answering', () => {
    render(
      <QuizDisplay
        quiz={createMockQuiz()}
        repoInfo={defaultRepoInfo}
        onReset={vi.fn()}
      />
    );

    const optionButtons = screen.getAllByText('Option A');
    fireEvent.click(optionButtons[0]);

    expect(screen.getAllByText('Explanation').length).toBeGreaterThan(0);
  });

  it('calls onReset from results screen', () => {
    const onReset = vi.fn();
    render(
      <QuizDisplay
        quiz={createMockQuiz(1)}
        repoInfo={defaultRepoInfo}
        onReset={onReset}
      />
    );

    const optionButtons = screen.getAllByText('Option A');
    fireEvent.click(optionButtons[0]);

    const viewResultsButtons = screen.getAllByRole('button', { name: /view results/i });
    fireEvent.click(viewResultsButtons[0]);

    fireEvent.click(screen.getByRole('button', { name: /new quiz/i }));

    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
