import { useState, useMemo } from 'react';
import { BookOpen, Sparkles, ChevronDown } from 'lucide-react';
import { Badge } from './ui/badge';
import { loadRepositoryData } from '@/services/dataService';
import { DEVINTERVIEW_REPOS } from '@/lib/constants';

const CATEGORY_ALL = 'All';

export default function RepositoryCatalog({ onSelectRepo }) {
  const [loading, setLoading] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORY_ALL);

  const categories = useMemo(() => {
    const cats = new Set(DEVINTERVIEW_REPOS.map(r => r.category));
    return [CATEGORY_ALL, ...Array.from(cats).sort()];
  }, []);

  const filteredRepos = useMemo(() => {
    if (selectedCategory === CATEGORY_ALL) {
      return DEVINTERVIEW_REPOS;
    }
    return DEVINTERVIEW_REPOS.filter(r => r.category === selectedCategory);
  }, [selectedCategory]);

  const handleSelect = async (repo) => {
    setLoading(repo.slug);

    try {
      const data = await loadRepositoryData(repo.slug);

      onSelectRepo({
        slug: repo.slug,
        name: data.name,
        category: repo.category,
        questions: data.questions,
        topics: data.topics,
        repoData: {
          metadata: {
            fullName: data.name,
            description: `${data.name} interview questions`,
          },
        },
      });
    } catch (error) {
      console.error('Error loading repository:', error);
      alert(error.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mobile: Dropdown */}
      <div className="md:hidden">
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full appearance-none px-4 py-3 pr-10 rounded-lg border border-input bg-background text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Desktop: Horizontal Scrollable Badges */}
      <div className="hidden md:block">
        <div className="relative">
          <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
            <div className="flex gap-2 justify-center min-w-max px-4">
              {categories.map((category) => {
                const isSelected = selectedCategory === category;
                return (
                  <Badge
                    key={category}
                    variant={isSelected ? 'default' : 'outline'}
                    className={`cursor-pointer px-4 py-2 text-sm transition-colors whitespace-nowrap ${
                      !isSelected && 'hover:bg-primary/10'
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Badge>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredRepos.map((repo) => {
          const handleKeyDown = (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              handleSelect(repo);
            }
          };

          return (
            <div
              key={repo.slug}
              role="button"
              tabIndex={0}
              onClick={() => handleSelect(repo)}
              onKeyDown={handleKeyDown}
              className="w-full text-left p-4 sm:p-5 rounded-lg border bg-card hover:border-primary hover:shadow-md transition-all group disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 min-h-[80px] active:scale-[0.98]"
            >
              <div className="flex gap-3 items-start">
                <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/15 transition-colors flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-base sm:text-lg leading-tight group-hover:text-primary transition-colors">
                    {repo.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">{repo.category}</p>
                </div>
              </div>

              {loading === repo.slug && (
                <div className="flex items-center gap-2 text-xs text-primary mt-3">
                  <Sparkles className="w-3 h-3 animate-spin" />
                  <span>Loading...</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
