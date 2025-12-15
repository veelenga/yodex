import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import {
  DEVINTERVIEW_REPOS,
  PARSED_DIR,
  GITHUB_RAW_BASE_URL,
  GITHUB_DEFAULT_BRANCH,
  README_FILENAME,
  QUESTION_PATTERN,
  MIN_ANSWER_LENGTH,
} from './config.js';

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// Security: Maximum allowed README size (10 MB)
const MAX_README_SIZE = 10 * 1024 * 1024;

// Security: Validate URL is from expected GitHub domain
function validateGitHubUrl(url) {
  const parsed = new URL(url);
  if (!parsed.hostname.endsWith('githubusercontent.com')) {
    throw new Error(`Invalid URL: Expected githubusercontent.com domain, got ${parsed.hostname}`);
  }
  return true;
}

async function fetchReadme(slug) {
  const url = `${GITHUB_RAW_BASE_URL}/${slug}/${GITHUB_DEFAULT_BRANCH}/${README_FILENAME}`;

  // Security: Validate URL before fetching
  validateGitHubUrl(url);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${slug}: ${response.statusText}`);
  }

  // Security: Check content length
  const contentLength = response.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > MAX_README_SIZE) {
    throw new Error(`README too large: ${contentLength} bytes (max: ${MAX_README_SIZE})`);
  }

  const content = await response.text();

  // Security: Validate content size
  if (content.length > MAX_README_SIZE) {
    throw new Error(`README content too large: ${content.length} bytes (max: ${MAX_README_SIZE})`);
  }

  // Security: Validate content is not empty
  if (content.trim().length === 0) {
    throw new Error('README content is empty');
  }

  return content;
}

// Security: Maximum question/answer lengths
const MAX_QUESTION_LENGTH = 2000;
const MAX_ANSWER_LENGTH = 50000;

function parseQuestions(markdown) {
  const questions = [];
  const sections = markdown.split(QUESTION_PATTERN);

  for (let i = 1; i < sections.length; i++) {
    const content = sections[i];
    const lines = content.split('\n');
    const question = lines[0].trim();
    const answer = lines.slice(1).join('\n').trim();

    // Security: Validate lengths
    if (question.length > MAX_QUESTION_LENGTH) {
      console.warn(`  [WARN] Question ${i} too long (${question.length} chars), skipping`);
      continue;
    }

    if (answer.length > MAX_ANSWER_LENGTH) {
      console.warn(`  [WARN] Answer ${i} too long (${answer.length} chars), skipping`);
      continue;
    }

    if (question && answer && answer.length > MIN_ANSWER_LENGTH) {
      questions.push({
        id: i,
        question,
        answer,
      });
    }
  }

  return questions;
}

async function parseAllRepos() {
  console.log('Step 1: Parsing READMEs from GitHub...\n');

  await fs.mkdir(PARSED_DIR, { recursive: true });

  let skipped = 0;
  let processed = 0;
  let failed = 0;

  for (const repo of DEVINTERVIEW_REPOS) {
    const filename = `${repo.id}.json`;
    const filePath = path.join(PARSED_DIR, filename);

    if (await fileExists(filePath)) {
      console.log(`[SKIP] ${repo.name} (already parsed)`);
      skipped++;
      continue;
    }

    console.log(`[FETCH] ${repo.name}...`);

    try {
      const readme = await fetchReadme(repo.slug);
      const qaPairs = parseQuestions(readme);
      console.log(`        Found ${qaPairs.length} questions`);

      const output = {
        id: repo.id,
        name: repo.name,
        slug: repo.slug,
        category: repo.category,
        totalQuestions: qaPairs.length,
        questions: qaPairs,
        parsedAt: new Date().toISOString(),
      };

      await fs.writeFile(filePath, JSON.stringify(output, null, 2));
      console.log(`        Saved to ${filename}\n`);
      processed++;
    } catch (error) {
      console.error(`        ERROR: ${error.message}\n`);
      failed++;
    }
  }

  console.log('Parsing complete!');
  console.log('\nSummary:');
  console.log(`  Processed: ${processed}`);
  console.log(`  Skipped:   ${skipped}`);
  console.log(`  Failed:    ${failed}`);
  console.log(`  Total:     ${DEVINTERVIEW_REPOS.length}`);
  console.log(`\nReview parsed data in: ${PARSED_DIR}`);
  console.log('\nNext step: Run "node scripts/generate.js" to generate quiz data with AI');
}

parseAllRepos().catch(console.error);
