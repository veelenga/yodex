import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useQuizInitializer } from './useQuizInitializer';
import * as dataService from '@/services/dataService';
import { ERROR_NO_QUESTIONS } from '@/lib/constants';

vi.mock('@/services/dataService');

describe('useQuizInitializer', () => {
  const createMockRepo = (questionCount = 10) => ({
    questions: Array.from({ length: questionCount }, (_, i) => ({
      id: `q${i + 1}`,
      question: `Question ${i + 1}`,
      options: ['A', 'B', 'C', 'D'],
      correctIndex: 0,
      explanation: 'Explanation',
    })),
    repoData: {
      metadata: { fullName: 'test/repo' },
      description: 'Test repository',
    },
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initializeQuiz', () => {
    it('returns success with quiz data when questions available', () => {
      const mockRepo = createMockRepo(10);
      const selectedQuestions = mockRepo.questions.slice(0, 5);

      vi.spyOn(dataService, 'selectQuestions').mockReturnValue(selectedQuestions);

      const { result } = renderHook(() => useQuizInitializer());
      const quizResult = result.current.initializeQuiz(mockRepo);

      expect(quizResult.success).toBe(true);
      expect(quizResult.quiz).toEqual(selectedQuestions);
      expect(quizResult.repoInfo).toEqual({
        ...mockRepo.repoData,
        totalQuestions: 10,
        selectedQuestions: 5,
      });
    });

    it('returns error when no questions selected', () => {
      const mockRepo = createMockRepo(10);

      vi.spyOn(dataService, 'selectQuestions').mockReturnValue([]);

      const { result } = renderHook(() => useQuizInitializer());
      const quizResult = result.current.initializeQuiz(mockRepo);

      expect(quizResult.success).toBe(false);
      expect(quizResult.error).toBe(ERROR_NO_QUESTIONS);
      expect(quizResult.quiz).toBeUndefined();
      expect(quizResult.repoInfo).toBeUndefined();
    });

    it('calls selectQuestions with correct parameters', () => {
      const mockRepo = createMockRepo(10);
      const selectQuestionsSpy = vi.spyOn(dataService, 'selectQuestions').mockReturnValue([]);

      const { result } = renderHook(() => useQuizInitializer());
      result.current.initializeQuiz(mockRepo);

      expect(selectQuestionsSpy).toHaveBeenCalledWith(
        mockRepo.questions,
        [],
        10
      );
    });

    it('preserves repo metadata in repoInfo', () => {
      const mockRepo = createMockRepo(10);
      const selectedQuestions = mockRepo.questions.slice(0, 10);

      vi.spyOn(dataService, 'selectQuestions').mockReturnValue(selectedQuestions);

      const { result } = renderHook(() => useQuizInitializer());
      const quizResult = result.current.initializeQuiz(mockRepo);

      expect(quizResult.repoInfo.metadata).toEqual(mockRepo.repoData.metadata);
      expect(quizResult.repoInfo.description).toEqual(mockRepo.repoData.description);
    });

    it('handles empty repo gracefully', () => {
      const mockRepo = createMockRepo(0);

      vi.spyOn(dataService, 'selectQuestions').mockReturnValue([]);

      const { result } = renderHook(() => useQuizInitializer());
      const quizResult = result.current.initializeQuiz(mockRepo);

      expect(quizResult.success).toBe(false);
      expect(quizResult.error).toBe(ERROR_NO_QUESTIONS);
    });

    it('returns initializeQuiz function', () => {
      const { result } = renderHook(() => useQuizInitializer());
      expect(typeof result.current.initializeQuiz).toBe('function');
    });
  });
});
