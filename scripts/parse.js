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

async function fetchReadme(slug) {
  const url = `${GITHUB_RAW_BASE_URL}/${slug}/${GITHUB_DEFAULT_BRANCH}/${README_FILENAME}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${slug}: ${response.statusText}`);
  }

  return await response.text();
}

function parseQuestions(markdown) {
  const questions = [];
  const sections = markdown.split(QUESTION_PATTERN);

  for (let i = 1; i < sections.length; i++) {
    const content = sections[i];
    const lines = content.split('\n');
    const question = lines[0].trim();
    const answer = lines.slice(1).join('\n').trim();

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
