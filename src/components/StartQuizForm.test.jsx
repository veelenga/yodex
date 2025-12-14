import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import StartQuizForm from './StartQuizForm';

vi.mock('@/services/dataService', () => ({
  selectQuestions: vi.fn(),
}));

import { selectQuestions } from '@/services/dataService';

const defaultRepo = {
  questions: [
    { id: 1, question: 'Q1', options: ['A', 'B'], correctIndex: 0 },
    { id: 2, question: 'Q2', options: ['A', 'B'], correctIndex: 1 },
  ],
  repoData: {
    metadata: { fullName: 'test/repo' },
  },
};

describe('StartQuizForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    selectQuestions.mockReturnValue([
      { id: 1, question: 'Q1' },
      { id: 2, question: 'Q2' },
    ]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders form title', () => {
    render(
      <StartQuizForm
        repo={defaultRepo}
        onQuizGenerated={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByText('Configure Your Quiz')).toBeInTheDocument();
  });

  it('renders repo info', () => {
    render(
      <StartQuizForm
        repo={defaultRepo}
        onQuizGenerated={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByText(/test\/repo/)).toBeInTheDocument();
    expect(screen.getByText(/2 questions available/)).toBeInTheDocument();
  });

  it('renders Start Quiz button', () => {
    render(
      <StartQuizForm
        repo={defaultRepo}
        onQuizGenerated={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByRole('button', { name: /start quiz/i })).toBeInTheDocument();
  });

  it('renders Cancel button when onCancel provided', () => {
    render(
      <StartQuizForm
        repo={defaultRepo}
        onQuizGenerated={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('does not render Cancel button when onCancel not provided', () => {
    render(
      <StartQuizForm
        repo={defaultRepo}
        onQuizGenerated={vi.fn()}
      />
    );
    expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
  });

  it('calls onCancel when Cancel clicked', () => {
    const onCancel = vi.fn();
    render(
      <StartQuizForm
        repo={defaultRepo}
        onQuizGenerated={vi.fn()}
        onCancel={onCancel}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onQuizGenerated after starting quiz', async () => {
    const onQuizGenerated = vi.fn();

    render(
      <StartQuizForm
        repo={defaultRepo}
        onQuizGenerated={onQuizGenerated}
        onCancel={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /start quiz/i }));

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(onQuizGenerated).toHaveBeenCalledTimes(1);
  });

  it('shows loading state when starting quiz', () => {
    render(
      <StartQuizForm
        repo={defaultRepo}
        onQuizGenerated={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /start quiz/i }));

    expect(screen.getByText(/selecting questions|quiz ready/i)).toBeInTheDocument();
  });

  it('disables buttons during loading', () => {
    render(
      <StartQuizForm
        repo={defaultRepo}
        onQuizGenerated={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /start quiz/i }));

    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
  });

  it('shows error when no questions match', async () => {
    selectQuestions.mockReturnValue([]);
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <StartQuizForm
        repo={defaultRepo}
        onQuizGenerated={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /start quiz/i }));

    expect(screen.getByText(/no questions match/i)).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it('renders quiz size info', () => {
    render(
      <StartQuizForm
        repo={defaultRepo}
        onQuizGenerated={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByText(/10 questions/i)).toBeInTheDocument();
  });
});
