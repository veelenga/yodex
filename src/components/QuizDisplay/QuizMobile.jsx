import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import MarkdownContent from '../MarkdownContent';
import AnswerOption from './AnswerOption';
import QuizExplanation from './QuizExplanation';
import { useAnswerOption } from './useAnswerOption';
import { TOUCH_TARGET_MIN_HEIGHT } from '@/lib/constants';

export default function QuizMobile({
  currentQuestion,
  currentQuestionIndex,
  quizLength,
  progressPercentage,
  selectedAnswer,
  onAnswerSelect,
  onNext,
  isLastQuestion,
}) {
  const { getOptionState, getOptionClassName, getLabelClassName, isAnswered } =
    useAnswerOption(selectedAnswer, currentQuestion.correctIndex);

  return (
    <div className="flex flex-col h-full bg-background">
      <header className="flex-none bg-background border-b">
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-foreground">
              Question {currentQuestionIndex + 1}/{quizLength}
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <Progress value={progressPercentage} className="h-1" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto overscroll-contain">
        <div className="px-4 py-4">
          <div className="mb-4">
            <div className="text-lg font-semibold leading-snug text-foreground">
              <MarkdownContent content={currentQuestion.question} />
            </div>
          </div>

          <div className="space-y-2">
            {currentQuestion.options.map((option, index) => {
              const { showCorrect, showIncorrect } = getOptionState(index);

              return (
                <AnswerOption
                  key={index}
                  index={index}
                  content={option}
                  optionClassName={getOptionClassName(index)}
                  labelClassName={getLabelClassName(index)}
                  showCorrect={showCorrect}
                  showIncorrect={showIncorrect}
                  disabled={isAnswered}
                  onSelect={onAnswerSelect}
                  variant="mobile"
                />
              );
            })}
          </div>

          {isAnswered && (
            <QuizExplanation
              explanation={currentQuestion.explanation}
              className="mt-4"
            />
          )}
        </div>
      </main>

      <footer className="flex-none bg-background border-t p-4">
        <Button
          onClick={onNext}
          disabled={!isAnswered}
          className="w-full"
          style={{ minHeight: `${TOUCH_TARGET_MIN_HEIGHT}px` }}
          size="lg"
        >
          {isLastQuestion ? 'View Results' : 'Next Question'}
        </Button>
      </footer>
    </div>
  );
}
