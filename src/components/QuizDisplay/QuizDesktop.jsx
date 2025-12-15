import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import MarkdownContent from '../MarkdownContent.lazy';
import AnswerOption from './AnswerOption';
import QuizExplanation from './QuizExplanation';
import { useAnswerOption } from './useAnswerOption';
import { TOUCH_TARGET_MIN_HEIGHT_DESKTOP } from '@/lib/constants';

export default function QuizDesktop({
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
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardContent className="py-4">
          <div className="flex justify-between items-center gap-2 mb-3">
            <span className="text-base font-medium text-foreground">
              Question {currentQuestionIndex + 1} of {quizLength}
            </span>
            <Badge className="bg-primary text-white">
              {Math.round(progressPercentage)}% Complete
            </Badge>
          </div>
          <Progress value={progressPercentage} className="h-2.5" />
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader className="pb-4 pt-6 px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="text-xs font-semibold text-primary mb-3">
                QUESTION {currentQuestionIndex + 1}
              </div>
              <CardTitle className="text-2xl leading-relaxed text-foreground">
                <MarkdownContent content={currentQuestion.question} />
              </CardTitle>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 px-6 pb-6">
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
                variant="desktop"
              />
            );
          })}

          {isAnswered && (
            <QuizExplanation
              explanation={currentQuestion.explanation}
              className="mt-6"
            />
          )}
        </CardContent>

        <CardFooter className="px-6 pt-4 pb-6">
          <Button
            onClick={onNext}
            disabled={!isAnswered}
            className="w-full"
            style={{ minHeight: `${TOUCH_TARGET_MIN_HEIGHT_DESKTOP}px` }}
            size="lg"
          >
            {isLastQuestion ? 'View Results' : 'Next Question'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
