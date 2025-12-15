import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import Anthropic from '@anthropic-ai/sdk';
import {
  OUTPUT_DIR,
  PARSED_DIR,
  AI_PROVIDER,
  API_KEY,
  AI_MODEL,
  AI_MAX_TOKENS,
  OLLAMA_BASE_URL,
  OLLAMA_MODEL,
  BATCH_SIZE,
  RATE_LIMIT_DELAY_MS,
  MAX_RETRIES,
  RETRY_DELAY_BASE_MS,
  ANSWER_PREVIEW_LENGTH,
  CODE_EXAMPLE_CATEGORIES,
  MARKDOWN_HEADER_PATTERN,
  CODE_BLOCK_PATTERN,
  EXCESSIVE_NEWLINES_PATTERN,
  JSON_ARRAY_PATTERN,
  MARKDOWN_JSON_BLOCK_START_PATTERN,
  MARKDOWN_CODE_BLOCK_START_PATTERN,
  MARKDOWN_CODE_BLOCK_END_PATTERN,
} from './config.js';

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function shouldIncludeCodeExamples(category) {
  return CODE_EXAMPLE_CATEGORIES.includes(category);
}

function formatQuestionsForAI(batch) {
  return batch
    .map((q, idx) => `
${idx + 1}. Question: ${q.question}
   Raw Answer: ${q.answer.substring(0, ANSWER_PREVIEW_LENGTH)}...
`)
    .join('\n');
}

async function delayForRateLimit() {
  await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY_MS));
}

function cleanAnswer(text) {
  let cleaned = text.replace(MARKDOWN_HEADER_PATTERN, '');
  cleaned = cleaned.replace(CODE_BLOCK_PATTERN, '');
  cleaned = cleaned.replace(EXCESSIVE_NEWLINES_PATTERN, '\n\n');
  cleaned = cleaned.trim();

  return cleaned;
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function extractTopics(qaPairs) {
  const topics = new Set();

  const topicKeywords = {
    basics: ['basic', 'introduction', 'what is', 'define'],
    advanced: ['advanced', 'complex', 'optimization'],
    async: ['async', 'await', 'promise', 'asynchronous'],
    performance: ['performance', 'optimization', 'speed', 'efficient'],
    security: ['security', 'authentication', 'authorization'],
    testing: ['test', 'testing', 'unit test'],
  };

  for (const qa of qaPairs) {
    const text = `${qa.question} ${qa.answer}`.toLowerCase();

    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        topics.add(topic);
      }
    }
  }

  return Array.from(topics).sort();
}

async function callOllama(prompt) {
  const url = `${OLLAMA_BASE_URL}/api/generate`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: AI_MAX_TOKENS,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Ollama API error (${response.status}): ${response.statusText}\n` +
        `   URL: ${url}\n` +
        `   Model: ${OLLAMA_MODEL}\n` +
        `   Error: ${errorText}\n` +
        `   \nTroubleshooting:\n` +
        `   1. Check Ollama is running: ollama list\n` +
        `   2. Pull model if needed: ollama pull ${OLLAMA_MODEL}\n` +
        `   3. Start Ollama server: ollama serve`
      );
    }

    const data = await response.json();
    return {
      content: [{ text: data.response }],
      stop_reason: data.done ? 'end_turn' : 'max_tokens',
    };
  } catch (error) {
    if (error.cause?.code === 'ECONNREFUSED') {
      throw new Error(
        `Cannot connect to Ollama at ${OLLAMA_BASE_URL}\n` +
        `   Make sure Ollama is running: ollama serve`
      );
    }
    throw error;
  }
}

/**
 * Exponential backoff retry with jitter
 */
async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function exponentialBackoff(retryCount) {
  // Exponential backoff: base * 2^retry + random jitter
  const delay = RETRY_DELAY_BASE_MS * Math.pow(2, retryCount);
  const jitter = Math.random() * 1000; // Random 0-1000ms jitter
  await sleep(delay + jitter);
}

/**
 * Calls AI provider (Anthropic or Ollama) with retry logic
 */
async function callAI(prompt, client, retryCount = 0) {
  try {
    if (AI_PROVIDER === 'ollama') {
      return await callOllama(prompt);
    } else {
      const message = await client.messages.create({
        model: AI_MODEL,
        max_tokens: AI_MAX_TOKENS,
        messages: [{ role: 'user', content: prompt }],
      });
      return message;
    }
  } catch (error) {
    // Check if error is retryable (rate limit, network issues)
    const isRetryable =
      error.status === 429 || // Rate limit
      error.status === 500 || // Server error
      error.status === 502 || // Bad gateway
      error.status === 503 || // Service unavailable
      error.status === 504 || // Gateway timeout
      error.code === 'ECONNRESET' ||
      error.code === 'ETIMEDOUT';

    if (isRetryable && retryCount < MAX_RETRIES) {
      console.warn(`    [RETRY ${retryCount + 1}/${MAX_RETRIES}] ${error.message}`);
      await exponentialBackoff(retryCount);
      return callAI(prompt, client, retryCount + 1);
    }

    // If not retryable or max retries reached, throw the error
    throw error;
  }
}

function sanitizeJSON(jsonText) {
  try {
    JSON.parse(jsonText);
    return jsonText;
  } catch {
    let fixed = jsonText;

    fixed = fixed.replace(/"([^"\\]|\\.)*"/g, (match) => {
      return match
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t')
        .replace(/\f/g, '\\f')
        .replace(/\b/g, '\\b');
    });

    return fixed;
  }
}

async function formatQuizWithAI(qaPairs, aiClient, repoName, category) {
  const formattedQuiz = [];
  const includeCodeExamples = shouldIncludeCodeExamples(category);

  for (let i = 0; i < qaPairs.length; i += BATCH_SIZE) {
    const batch = qaPairs.slice(i, i + BATCH_SIZE);
    const questionsText = formatQuestionsForAI(batch);

    const codeExampleInstructions = includeCodeExamples
      ? `4. For explanations, include a relevant code example in markdown format when applicable (use \`\`\`language for code blocks)
5. If the original question contains code that's essential to understanding it, preserve that code in the question`
      : '4. Keep explanations clear and concise without code examples';

    const prompt = `You are formatting quiz answers for ${repoName} interview questions.

<questions>
${questionsText}
</questions>

For each question:
1. Create a CLEAN, concise correct answer (1-2 sentences, NO markdown headers)
2. Generate 3 plausible but INCORRECT wrong answers that are:
   - Similar LENGTH to the correct answer (crucial to prevent guessing by length)
   - Well-written and detailed (not obviously wrong)
   - Technically plausible but factually incorrect
   - Each should be 1-2 sentences like the correct answer
3. Create a clean explanation paragraph (remove markdown headers, keep useful content)
${codeExampleInstructions}

IMPORTANT: All 4 options (1 correct + 3 wrong) must have similar length and detail level to make them equally convincing.

Return ONLY a JSON array:
[
  {
    "correctAnswer": "clean, formatted correct answer",
    "wrongAnswers": ["wrong 1 with similar length", "wrong 2 with similar length", "wrong 3 with similar length"],
    "explanation": "clean explanation with key points${includeCodeExamples ? ' and code example if relevant' : ''}"
  }
]`;

    try {
      const message = await callAI(prompt, aiClient);

      let jsonText = message.content[0].text.trim();

      // Remove markdown wrapper only at start and end (not inside the JSON)
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(MARKDOWN_JSON_BLOCK_START_PATTERN, '');
      }
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(MARKDOWN_CODE_BLOCK_START_PATTERN, '');
      }
      if (jsonText.endsWith('```')) {
        jsonText = jsonText.replace(MARKDOWN_CODE_BLOCK_END_PATTERN, '');
      }

      // Try to extract JSON if there's extra text
      const jsonMatch = jsonText.match(JSON_ARRAY_PATTERN);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }

      // Sanitize JSON by escaping control characters within string values
      // This fixes issues where AI includes literal newlines/tabs in strings
      jsonText = sanitizeJSON(jsonText);

      let parsed;
      try {
        parsed = JSON.parse(jsonText);
      } catch (parseError) {
        console.error(`        [WARNING] JSON Parse Error: ${parseError.message}`);
        console.error(`        Raw response length: ${message.content[0].text.length} chars`);
        console.error(`        Stop reason: ${message.stop_reason}`);

        // If truncated, log warning and skip this batch
        if (message.stop_reason === 'max_tokens') {
          console.error(`        [ERROR] Response truncated! Consider reducing BATCH_SIZE or increasing AI_MAX_TOKENS`);
        }
        throw parseError;
      }

      if (!Array.isArray(parsed)) {
        throw new Error('Response is not an array');
      }

      // Combine with original questions
      for (let j = 0; j < batch.length; j++) {
        const original = batch[j];
        const formatted = parsed[j];

        if (!formatted) continue;

        const allOptions = [formatted.correctAnswer, ...formatted.wrongAnswers];
        const shuffled = shuffleArray(allOptions);
        const correctIndex = shuffled.indexOf(formatted.correctAnswer);

        formattedQuiz.push({
          id: original.id,
          question: original.question,
          options: shuffled,
          correctIndex,
          explanation: formatted.explanation || cleanAnswer(original.answer),
        });
      }

      console.log(`        Processed questions ${i + 1}-${i + batch.length}`);
    } catch (error) {
      console.error(`        Error formatting batch ${i}-${i + BATCH_SIZE}:`, error.message);
    }

    await delayForRateLimit();
  }

  return formattedQuiz;
}

/**
 * Verifies Ollama is running and model is available
 */
async function verifyOllama() {
  try {
    // Check if Ollama is accessible
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    if (!response.ok) {
      throw new Error(`Ollama returned status ${response.status}`);
    }

    const data = await response.json();
    const availableModels = data.models.map(m => m.name);

    if (!availableModels.includes(OLLAMA_MODEL)) {
      console.error(`\n[ERROR] Model "${OLLAMA_MODEL}" not found in Ollama`);
      console.error('\nAvailable models:');
      availableModels.forEach(m => console.error(`  - ${m}`));
      console.error('\nTo download the model, run:');
      console.error(`  ollama pull ${OLLAMA_MODEL}`);
      process.exit(1);
    }

    console.log(`Ollama verified (${availableModels.length} models available)\n`);
  } catch (error) {
    if (error.cause?.code === 'ECONNREFUSED') {
      console.error(`\n[ERROR] Cannot connect to Ollama at ${OLLAMA_BASE_URL}`);
      console.error('\nMake sure Ollama is running:');
      console.error('  ollama serve');
      console.error('\nOr install Ollama from: https://ollama.ai');
      process.exit(1);
    }
    throw error;
  }
}

/**
 * Main generation function - processes parsed data with AI
 */
async function generateAllQuizzes() {
  // Validate configuration based on provider
  if (AI_PROVIDER === 'ollama') {
    console.log(`Using Ollama (${OLLAMA_MODEL}) at ${OLLAMA_BASE_URL}`);
    await verifyOllama();
  } else {
    if (!API_KEY) {
      console.error('[ERROR] ANTHROPIC_API_KEY environment variable not set');
      console.error('Please create a .env file with your API key');
      console.error('Or set AI_PROVIDER=ollama to use Ollama instead');
      process.exit(1);
    }
    console.log(`Using Anthropic Claude (${AI_MODEL})\n`);
  }

  console.log('Step 2: Generating quiz data with AI...\n');

  // Ensure output directory exists
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  // Check if parsed directory exists
  if (!(await fileExists(PARSED_DIR))) {
    console.error(`[ERROR] Parsed data directory not found: ${PARSED_DIR}`);
    console.error('Please run "node scripts/parse.js" first');
    process.exit(1);
  }

  // Initialize AI client (only needed for Anthropic)
  const aiClient = AI_PROVIDER === 'anthropic' ? new Anthropic({ apiKey: API_KEY }) : null;

  // Get all parsed files
  const parsedFiles = await fs.readdir(PARSED_DIR);
  const jsonFiles = parsedFiles.filter(f => f.endsWith('.json'));

  if (jsonFiles.length === 0) {
    console.error('[ERROR] No parsed JSON files found');
    console.error('Please run "node scripts/parse.js" first');
    process.exit(1);
  }

  console.log(`Found ${jsonFiles.length} parsed files\n`);

  let skipped = 0;
  let processed = 0;
  let failed = 0;

  for (const filename of jsonFiles) {
    const parsedPath = path.join(PARSED_DIR, filename);
    const outputPath = path.join(OUTPUT_DIR, filename);

    // Check if already generated with valid questions (idempotency)
    if (await fileExists(outputPath)) {
      const existingData = JSON.parse(await fs.readFile(outputPath, 'utf-8'));
      if (existingData.questions && existingData.questions.length > 0) {
        console.log(`[SKIP] ${existingData.name} (already generated)`);
        skipped++;
        continue;
      } else {
        console.log(`[REGEN] ${existingData.name} (no questions found)`);
      }
    }

    // Read parsed data
    const parsedData = JSON.parse(await fs.readFile(parsedPath, 'utf-8'));
    console.log(`[PROCESS] ${parsedData.name}...`);
    console.log(`          ${parsedData.totalQuestions} questions to format`);

    try {
      // Format answers with AI
      const formattedQuiz = await formatQuizWithAI(
        parsedData.questions,
        aiClient,
        parsedData.name,
        parsedData.category
      );

      // Extract topics
      const topics = extractTopics(parsedData.questions);

      // Save to JSON
      const output = {
        id: parsedData.id,
        name: parsedData.name,
        slug: parsedData.slug,
        category: parsedData.category,
        totalQuestions: formattedQuiz.length,
        topics,
        questions: formattedQuiz,
        processedAt: new Date().toISOString(),
      };

      await fs.writeFile(outputPath, JSON.stringify(output, null, 2));
      console.log(`          Saved to ${filename}\n`);
      processed++;
    } catch (error) {
      console.error(`          ERROR: ${error.message}\n`);
      failed++;
    }
  }

  console.log('Generation complete!');
  console.log('\nSummary:');
  console.log(`  Processed: ${processed}`);
  console.log(`  Skipped:   ${skipped}`);
  console.log(`  Failed:    ${failed}`);
  console.log(`  Total:     ${jsonFiles.length}`);
  console.log(`\nQuiz data saved to: ${OUTPUT_DIR}`);
}

// Run generation
generateAllQuizzes().catch(console.error);
