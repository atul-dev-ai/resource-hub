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
      model: openrouter('google/gemma-4-31b-it:free'),
      prompt: 'hello'
    });
    console.log("Success with gemma-4-31b-it:free:", result.text);
    
    const result2 = await generateText({
      model: openrouter('openrouter/free'),
      prompt: 'hello'
    });
    console.log("Success with openrouter/free:", result2.text);
  } catch (err) {
    console.error("Failed:", err);
  }
}
test();
