const { generateText } = require('ai');
const { createOpenAI } = require('@ai-sdk/openai');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const key = env.match(/OPENROUTER_API_KEY="?([^"\n]+)"?/)[1];

async function test() {
  try {
    const openrouter = createOpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: key,
    });
    
    const result = await generateText({
      model: openrouter('openrouter/free'),
      prompt: 'make questions for quiz'
    });
    console.log("Success with openrouter/free:", result.text);
  } catch (err) {
    console.error("Failed:", err);
  }
}
test();
