import { DEVINTERVIEW_REPOS as REPOS } from './repositories.js';

export const DEFAULT_QUIZ_SIZE = 10;

export const VIEW_HOME = 'home';
export const VIEW_QUIZ = 'quiz';

export const TOUCH_TARGET_MIN_HEIGHT = 48;
export const TOUCH_TARGET_MIN_HEIGHT_DESKTOP = 52;

export const NO_TOPIC_FILTER = [];

export const ERROR_NO_QUESTIONS = 'No questions available for this topic';

export const DEVINTERVIEW_REPOS = REPOS.map(repo => ({
  name: repo.name,
  slug: repo.id,
  category: repo.category,
}));
