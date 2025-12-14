import { RotateCcw, Trophy, Github } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { TOUCH_TARGET_MIN_HEIGHT } from '@/lib/constants';

const SCORE_THRESHOLD_PERFECT = 100;
const SCORE_THRESHOLD_GREAT = 80;
const SCORE_THRESHOLD_GOOD = 60;

function getScoreMessage(percentage) {
  if (percentage === SCORE_THRESHOLD_PERFECT) {
    return {
      text: 'Perfect score! Outstanding work!',
      className: 'text-green-600 dark:text-green-400',
    };
  }
  if (percentage >= SCORE_THRESHOLD_GREAT) {
    return {
      text: 'Great job! You have a strong understanding!',
      className: 'text-blue-600 dark:text-blue-400',
    };
  }
  if (percentage >= SCORE_THRESHOLD_GOOD) {
    return {
      text: 'Good effort! Keep practicing!',
      className: 'text-yellow-600 dark:text-yellow-400',
    };
  }
  return {
    text: 'Keep learning! Practice makes perfect!',
    className: 'text-orange-600 dark:text-orange-400',
  };
}

export default function QuizResults({ score, repoInfo, onReset }) {
  const scoreMessage = getScoreMessage(score.percentage);

  return (
    <div className="max-w-2xl mx-auto px-4">
      <Card className="border-0 md:border">
        <CardHeader className="text-center pt-6 pb-4 md:pt-8 md:pb-6">
          <div className="flex justify-center mb-3 md:mb-4">
            <Trophy className="w-12 h-12 md:w-16 md:h-16 text-yellow-500" />
          </div>
          <CardTitle className="text-2xl md:text-3xl">Quiz Complete!</CardTitle>
          <CardDescription className="text-sm md:text-base">
            Here are your results
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 md:space-y-6 px-4 md:px-6">
          <div className="text-center space-y-2">
            <div className="text-5xl sm:text-6xl font-bold text-primary">
              {score.percentage}%
            </div>
            <p className="text-sm sm:text-base text-muted-foreground">
              {score.correct} out of {score.total} correct
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-3 md:p-4 space-y-1.5 md:space-y-2">
            <div className="flex items-center gap-2 text-xs md:text-sm">
              <Github className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="font-medium">{repoInfo.metadata.fullName}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Questions: {repoInfo.selectedQuestions} selected from{' '}
              {repoInfo.totalQuestions} total
            </p>
          </div>

          <div className="text-center text-sm md:text-base">
            <p className={`font-medium ${scoreMessage.className}`}>
              {scoreMessage.text}
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex gap-2 px-4 pt-4 pb-6 md:px-6 md:pt-6">
          <Button
            onClick={onReset}
            className="flex-1"
            style={{ minHeight: `${TOUCH_TARGET_MIN_HEIGHT}px` }}
            size="lg"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            New Quiz
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
