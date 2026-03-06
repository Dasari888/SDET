import fs from 'fs';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

//  FAIL FAST
if (!process.env.DEEPSEEK_API_KEY) {
  throw new Error('DEEPSEEK_API_KEY is not set');
}

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1',
});

/**
 *  Proper recursive failure extractor
 */
function extractFailures(report: any): string[] {
  const failures: string[] = [];

  function walkSuite(suite: any) {

    for (const spec of suite.specs || []) {
      for (const test of spec.tests || []) {
        for (const result of test.results || []) {

          if (result.status === 'failed') {
            failures.push(
              `Test: ${spec.title}\nError: ${result.error?.message || 'Unknown'}`
            );
          }

        }
      }
    }

    for (const child of suite.suites || []) {
      walkSuite(child);
    }
  }

  for (const rootSuite of report.suites || []) {
    walkSuite(rootSuite);
  }

  return failures;
}

async function analyzeFailures() {

  try {

    const raw = fs.readFileSync('test-results/results.json', 'utf-8');
    const report = JSON.parse(raw);

    const failures = extractFailures(report);

    if (failures.length === 0) {
      console.log(' No failures to analyze');
      return;
    }

    const prompt = `
You are a senior QA automation engineer.

Analyze the following Playwright failures and provide:

1. Root cause
2. Failure category (locator/timing/api/assertion)
3. Recommended fix

Failures:
${failures.join('\n\n')}
`;

    const response = await client.chat.completions.create({

      model: 'deepseek-chat',

      temperature: 0.2,

      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],

    });

    console.log('\n🤖 AI Failure Analysis:\n');
    console.log(response.choices[0].message.content);

  } catch (err) {
    console.error('Analyzer error:', err);
  }

}

analyzeFailures();