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
    console.log("Using API Key:", key.substring(0, 15) + "...");
    
    const result = await generateText({
      model: openrouter('google/gemini-1.5-flash:free'),
      prompt: 'hello'
    });
    console.log("Success:", result.text);
  } catch (err) {
    console.error("Failed:", err);
  }
}
test();
