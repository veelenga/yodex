import { useState } from 'react';
import { Sparkles, Library } from 'lucide-react';
import { Button } from './components/ui/button';
import AnimatedBackground from './components/AnimatedBackground';
import RepositoryCatalog from './components/RepositoryCatalog';
import StartQuizForm from './components/StartQuizForm';
import QuizDisplay from './components/QuizDisplay/QuizDisplay';
import { VIEW_HOME, VIEW_START_QUIZ, VIEW_QUIZ } from './lib/constants';

const LAYOUT_CLASSES = {
  root: {
    default: 'min-h-screen',
    quiz: 'h-dvh overflow-hidden flex flex-col md:h-auto md:overflow-visible md:min-h-screen md:block',
  },
  main: {
    default: 'container mx-auto px-4 py-8 relative',
    quiz: 'flex-1 overflow-hidden md:flex-none md:overflow-visible',
  },
};

function App() {
  const [currentView, setCurrentView] = useState(VIEW_HOME);
  const [quiz, setQuiz] = useState(null);
  const [repoInfo, setRepoInfo] = useState(null);
  const [selectedRepo, setSelectedRepo] = useState(null);

  const isQuizView = currentView === VIEW_QUIZ;

  const handleQuizStarted = (quizQuestions, repo) => {
    setQuiz(quizQuestions);
    setRepoInfo(repo);
    setCurrentView(VIEW_QUIZ);
  };

  const handleSelectRepo = (repo) => {
    setSelectedRepo(repo);
    setCurrentView(VIEW_START_QUIZ);
  };

  const handleReset = () => {
    setQuiz(null);
    setRepoInfo(null);
    setSelectedRepo(null);
    setCurrentView(VIEW_HOME);
  };

  const rootClassName = `bg-background relative ${isQuizView ? LAYOUT_CLASSES.root.quiz : LAYOUT_CLASSES.root.default}`;
  const mainClassName = isQuizView ? LAYOUT_CLASSES.main.quiz : LAYOUT_CLASSES.main.default;

  return (
    <div className={rootClassName}>
      <AnimatedBackground />

      <header className="bg-white/80 backdrop-blur-md border-b border-border sticky top-0 z-40 shadow-sm flex-none">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleReset}
              className="flex items-center gap-3 group"
            >
              <Sparkles className="w-8 h-8 text-primary transition-transform group-hover:scale-110" />
              <h1 className="text-3xl font-bold gradient-text">
                Yodex
              </h1>
            </button>

            {currentView !== VIEW_HOME && (
              <Button
                variant="ghost"
                onClick={() => setCurrentView(VIEW_HOME)}
              >
                <Library className="w-4 h-4 mr-2" />
                Back to Catalog
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className={mainClassName}>
        {currentView === VIEW_HOME && (
          <div className="max-w-7xl mx-auto fade-in">
            <div className="mb-8">
              <h2 className="section-header">Interview Question Catalog</h2>
              <p className="section-description">
                Choose a topic and start practicing
              </p>
            </div>
            <RepositoryCatalog onSelectRepo={handleSelectRepo} />
          </div>
        )}

        {currentView === VIEW_START_QUIZ && selectedRepo && (
          <div className="max-w-3xl mx-auto fade-in">
            <div className="mb-8">
              <h2 className="section-header">Configure Quiz</h2>
              <p className="section-description">
                Select topics and quiz size
              </p>
            </div>
            <StartQuizForm
              repo={selectedRepo}
              onQuizGenerated={handleQuizStarted}
              onCancel={() => setCurrentView(VIEW_HOME)}
            />
          </div>
        )}

        {currentView === VIEW_QUIZ && quiz && (
          <div className="h-full md:h-auto md:max-w-4xl md:mx-auto md:px-4 md:py-8 fade-in">
            <QuizDisplay
              quiz={quiz}
              repoInfo={repoInfo}
              onReset={handleReset}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
