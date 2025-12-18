import { useState } from 'react';
import QuizMobile from './QuizMobile';
import QuizDesktop from './QuizDesktop';
import QuizResults from './QuizResults';

export default function QuizDisplay({ quiz, repoInfo, onReset }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = quiz[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.length - 1;
  const progressPercentage = ((currentQuestionIndex + 1) / quiz.length) * 100;

  const handleAnswerSelect = (optionIndex) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(optionIndex);
    const isCorrect = optionIndex === currentQuestion.correctIndex;

    setAnsweredQuestions([
      ...answeredQuestions,
      {
        questionId: currentQuestion.id,
        selectedAnswer: optionIndex,
        correctAnswer: currentQuestion.correctIndex,
        isCorrect,
      },
    ]);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      setShowResults(true);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    }
  };

  const calculateScore = () => {
    const totalAnswered = answeredQuestions.length;
    if (totalAnswered === 0) {
      return { correct: 0, total: 0, percentage: 0 };
    }

    const correct = answeredQuestions.filter((a) => a.isCorrect).length;
    return {
      correct,
      total: totalAnswered,
      percentage: Math.round((correct / totalAnswered) * 100),
    };
  };

  if (showResults) {
    return (
      <QuizResults
        score={calculateScore()}
        repoInfo={repoInfo}
        onReset={onReset}
      />
    );
  }

  const quizProps = {
    currentQuestion,
    currentQuestionIndex,
    quizLength: quiz.length,
    progressPercentage,
    selectedAnswer,
    onAnswerSelect: handleAnswerSelect,
    onNext: handleNext,
    isLastQuestion,
    onExit: onReset,
  };

  return (
    <>
      <div className="h-full md:hidden">
        <QuizMobile {...quizProps} />
      </div>

      <div className="hidden md:block">
        <QuizDesktop {...quizProps} />
      </div>
    </>
  );
}
