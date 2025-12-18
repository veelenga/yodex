import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import AnimatedBackground from './components/AnimatedBackground';
import RepositoryCatalog from './components/RepositoryCatalog';
import QuizDisplay from './components/QuizDisplay/QuizDisplay';
import { ToastContainer } from './components/Toast';
import { useQuizInitializer } from './hooks/useQuizInitializer';
import { useToast } from './contexts/ToastContext';
import { VIEW_HOME, VIEW_QUIZ } from './lib/constants';

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

  const { initializeQuiz } = useQuizInitializer();
  const { showError } = useToast();

  const isQuizView = currentView === VIEW_QUIZ;

  const handleSelectRepo = (repo) => {
    const result = initializeQuiz(repo);

    if (!result.success) {
      showError(result.error);
      return;
    }

    setQuiz(result.quiz);
    setRepoInfo(result.repoInfo);
    setCurrentView(VIEW_QUIZ);
  };

  const handleReset = () => {
    setQuiz(null);
    setRepoInfo(null);
    setCurrentView(VIEW_HOME);
  };

  const rootClassName = `bg-background relative ${isQuizView ? LAYOUT_CLASSES.root.quiz : LAYOUT_CLASSES.root.default}`;
  const mainClassName = isQuizView ? LAYOUT_CLASSES.main.quiz : LAYOUT_CLASSES.main.default;

  return (
    <div className={rootClassName}>
      <AnimatedBackground />
      <ToastContainer />

      <header className="bg-white/80 backdrop-blur-md border-b border-border sticky top-0 z-40 shadow-sm flex-none">
        <div className="container mx-auto px-4 py-2 md:py-4">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 md:gap-3 group"
          >
            <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-primary transition-transform group-hover:scale-110" />
            <h1 className="text-2xl md:text-3xl font-bold gradient-text">
              Yodex
            </h1>
          </button>
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
