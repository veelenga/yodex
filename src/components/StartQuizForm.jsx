import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { selectQuestions } from '@/services/dataService';
import { DEFAULT_QUIZ_SIZE, TOUCH_TARGET_MIN_HEIGHT } from '@/lib/constants';

const PROGRESS_SELECTING = 50;
const PROGRESS_COMPLETE = 100;
const TRANSITION_DELAY_MS = 300;
const STATUS_SELECTING = 'Selecting questions...';
const STATUS_READY = 'Quiz ready!';
const ERROR_NO_QUESTIONS = 'No questions match your criteria';
const ERROR_QUIZ_START_FAILED = 'Failed to start quiz';

export default function StartQuizForm({ repo, onQuizGenerated, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');

  const handleStartQuiz = () => {
    setLoading(true);
    setError('');
    setProgress(0);

    try {
      setStatusMessage(STATUS_SELECTING);
      setProgress(PROGRESS_SELECTING);

      const selectedQuestions = selectQuestions(
        repo.questions,
        [],
        DEFAULT_QUIZ_SIZE
      );

      if (selectedQuestions.length === 0) {
        throw new Error(ERROR_NO_QUESTIONS);
      }

      setProgress(PROGRESS_COMPLETE);
      setStatusMessage(STATUS_READY);

      setTimeout(() => {
        onQuizGenerated(selectedQuestions, {
          ...repo.repoData,
          totalQuestions: repo.questions.length,
          selectedQuestions: selectedQuestions.length,
        });
        setLoading(false);
      }, TRANSITION_DELAY_MS);
    } catch (err) {
      console.error('Error starting quiz:', err);
      setError(err.message || ERROR_QUIZ_START_FAILED);
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configure Your Quiz</CardTitle>
        <CardDescription>
          {repo.repoData.metadata.fullName} • {repo.questions?.length || 0} questions available
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Number of Questions</label>
          <p className="text-sm text-muted-foreground">
            Each quiz contains {DEFAULT_QUIZ_SIZE} questions.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="flex-1"
              style={{ minHeight: `${TOUCH_TARGET_MIN_HEIGHT}px` }}
            >
              Cancel
            </Button>
          )}
          <Button
            onClick={handleStartQuiz}
            disabled={loading}
            className="flex-1"
            style={{ minHeight: `${TOUCH_TARGET_MIN_HEIGHT}px` }}
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {statusMessage}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Start Quiz
              </>
            )}
          </Button>
        </div>

        {loading && <Progress value={progress} />}

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
