const { generateText } = require('ai');
const { createGoogleGenerativeAI } = require('@ai-sdk/google');
require('dotenv').config({ path: '.env.local' });

async function test() {
  try {
    const google = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || '',
    });
    console.log("Using API Key:", process.env.GEMINI_API_KEY);
    const result = await generateText({
      model: google('gemini-1.5-flash'),
      prompt: 'hello'
    });
    console.log("Success:", result.text);
  } catch (err) {
    console.error("Failed:", err.message);
  }
}
test();
