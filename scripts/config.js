import path from 'path';
import { fileURLToPath } from 'url';
import { DEVINTERVIEW_REPOS } from '../src/lib/repositories.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export { DEVINTERVIEW_REPOS };

export const OUTPUT_DIR = path.join(__dirname, '../public/data');
export const PARSED_DIR = path.join(__dirname, 'parsed');

export const AI_PROVIDER = process.env.AI_PROVIDER || 'anthropic';
export const API_KEY = process.env.ANTHROPIC_API_KEY;
export const AI_MODEL = 'claude-3-5-haiku-20241022';
export const AI_MAX_TOKENS = 4096;

export const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
export const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5-coder:7b';

export const BATCH_SIZE = 3;
export const RATE_LIMIT_DELAY_MS = 1000;

export const MIN_ANSWER_LENGTH = 50;
export const ANSWER_PREVIEW_LENGTH = 500;
export const QUESTION_PATTERN = /^## \d+\.\s+/m;

export const GITHUB_RAW_BASE_URL = 'https://raw.githubusercontent.com/Devinterview-io';
export const GITHUB_DEFAULT_BRANCH = 'main';
export const README_FILENAME = 'README.md';

export const CODE_EXAMPLE_CATEGORIES = ['Languages', 'Frontend', 'Backend', 'Mobile'];

export const MARKDOWN_HEADER_PATTERN = /^#{1,6}\s+/gm;
export const CODE_BLOCK_PATTERN = /```[\s\S]*?```/g;
export const EXCESSIVE_NEWLINES_PATTERN = /\n{3,}/g;

export const JSON_ARRAY_PATTERN = /\[[\s\S]*\]/;
export const MARKDOWN_JSON_BLOCK_START_PATTERN = /^```json\s*/;
export const MARKDOWN_CODE_BLOCK_START_PATTERN = /^```\s*/;
export const MARKDOWN_CODE_BLOCK_END_PATTERN = /```\s*$/;
