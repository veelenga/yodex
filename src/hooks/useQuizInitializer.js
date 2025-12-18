import { selectQuestions } from '@/services/dataService';
import { DEFAULT_QUIZ_SIZE, NO_TOPIC_FILTER, ERROR_NO_QUESTIONS } from '@/lib/constants';

/**
 * Custom hook for initializing quiz state from repository data
 * Separates quiz initialization logic from component concerns
 */
export function useQuizInitializer() {
  const initializeQuiz = (repo) => {
    const selectedQuestions = selectQuestions(
      repo.questions,
      NO_TOPIC_FILTER,
      DEFAULT_QUIZ_SIZE
    );

    if (selectedQuestions.length === 0) {
      return {
        success: false,
        error: ERROR_NO_QUESTIONS,
      };
    }

    return {
      success: true,
      quiz: selectedQuestions,
      repoInfo: {
        ...repo.repoData,
        totalQuestions: repo.questions.length,
        selectedQuestions: selectedQuestions.length,
      },
    };
  };

  return { initializeQuiz };
}
