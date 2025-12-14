import { DEVINTERVIEW_REPOS } from '@/lib/constants';

/**
 * Loads pre-processed repository data from static files
 * No GitHub API, no parsing - just load and go!
 */

/**
 * Gets list of available repositories
 */
export function getAvailableRepositories() {
  return DEVINTERVIEW_REPOS;
}

/**
 * Loads pre-processed quiz data for a repository
 */
export async function loadRepositoryData(slug) {
  try {
    const response = await fetch(`/data/${slug}.json`);

    if (!response.ok) {
      throw new Error(`Failed to load ${slug}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error loading ${slug}:`, error);
    throw new Error(`This repository hasn't been pre-processed yet. Please contact support.`);
  }
}

/**
 * Searches questions by topics using simple keyword matching
 */
export function searchQuestionsByTopics(questions, topics) {
  if (topics.length === 0) {
    return questions;
  }

  const topicQuery = topics.join(' ').toLowerCase();

  return questions.filter(q => {
    const text = `${q.question} ${q.explanation}`.toLowerCase();
    return topics.some(topic => text.includes(topic.toLowerCase()));
  });
}

/**
 * Gets random subset of questions
 */
export function getRandomQuestions(questions, count) {
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, questions.length));
}

/**
 * Filters questions by selected topics and returns random subset
 */
export function selectQuestions(questions, selectedTopics, count) {
  let filtered = questions;

  if (selectedTopics.length > 0) {
    filtered = searchQuestionsByTopics(questions, selectedTopics);
  }

  if (filtered.length === 0) {
    filtered = questions; // Fallback to all
  }

  return getRandomQuestions(filtered, count);
}
