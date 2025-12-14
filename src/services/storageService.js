import localforage from 'localforage';

// Shared cache instance for repositories/quizzes
export const repoCache = localforage.createInstance({
  name: 'yodex',
  storeName: 'repositories',
});

/**
 * Returns basic cache stats for UI badges.
 * Indexes are treated the same as stored repositories for now.
 */
export async function getCacheStats() {
  const keys = await repoCache.keys();

  return {
    repositories: keys.length,
    indexes: keys.length,
    quizzes: 0,
  };
}
