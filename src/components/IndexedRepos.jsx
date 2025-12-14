import { useState, useEffect } from 'react';
import { Database, Play, Trash2, Github, Calendar, FileText } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { getCacheStats, repoCache } from '@/services/storageService';
import { formatDate } from '@/lib/formatters';

export default function IndexedRepos({ onSelectRepo, onAddNew }) {
  const [repos, setRepos] = useState([]);
  const [stats, setStats] = useState({ repositories: 0, indexes: 0, quizzes: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRepos();
  }, []);

  const loadRepos = async () => {
    setLoading(true);
    try {
      // Get all repo keys
      const keys = await repoCache.keys();

      // Load all cached repos
      const repoData = await Promise.all(
        keys.map(async (key) => {
          const data = await repoCache.getItem(key);
          return {
            key,
            ...data,
          };
        })
      );

      // Sort by timestamp (newest first)
      repoData.sort((a, b) => b.timestamp - a.timestamp);

      setRepos(repoData);

      // Load stats
      const cacheStats = await getCacheStats();
      setStats(cacheStats);
    } catch (error) {
      console.error('Failed to load repos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (key) => {
    if (!confirm('Are you sure you want to remove this repository from cache?')) {
      return;
    }

    try {
      await repoCache.removeItem(key);
      await loadRepos();
    } catch (error) {
      console.error('Failed to delete repo:', error);
      alert('Failed to delete repository');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Loading repositories...</p>
        </CardContent>
      </Card>
    );
  }

  if (repos.length === 0) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="py-16 text-center space-y-6">
          <Database className="w-16 h-16 mx-auto text-primary" />
          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-foreground">No Repositories Yet</h3>
            <p className="text-muted-foreground text-base max-w-md mx-auto">
              Add your first repository to start creating AI-powered quizzes
            </p>
            <Button onClick={onAddNew} size="lg" className="mt-4">
              <Github className="w-5 h-5 mr-2" />
              Add Your First Repository
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{stats.repositories}</div>
              <div className="text-sm text-muted-foreground mt-2">Repositories</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary">{stats.indexes}</div>
              <div className="text-sm text-muted-foreground mt-2">Indexes</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">{stats.quizzes}</div>
              <div className="text-sm text-muted-foreground mt-2">Quizzes Taken</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Repository List */}
      <div className="space-y-3">
        {repos.map((repo) => (
          <Card
            key={repo.key}
            className="hover:border-primary/50 hover:shadow-md transition-all"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Github className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="font-bold text-lg truncate text-foreground">
                      {repo.repoData.metadata.fullName}
                    </h3>
                  </div>

                  {repo.repoData.metadata.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                      {repo.repoData.metadata.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 text-xs">
                    <div className="info-badge text-foreground">
                      <FileText className="w-3.5 h-3.5 text-primary" />
                      <span>{repo.questions?.length || 0} questions</span>
                    </div>
                    {repo.repoData.metadata.language && (
                      <Badge variant="outline" className="text-xs">
                        {repo.repoData.metadata.language}
                      </Badge>
                    )}
                    <div className="info-badge text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(repo.timestamp)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => onSelectRepo(repo)}
                    className="whitespace-nowrap"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Quiz
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(repo.key)}
                    className="hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add New Button */}
      <Button
        variant="outline"
        onClick={onAddNew}
        className="w-full"
      >
        <Github className="w-4 h-4 mr-2" />
        Add Another Repository
      </Button>
    </div>
  );
}
