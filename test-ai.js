const { streamText } = require('ai');
const { createOpenAI } = require('@ai-sdk/openai');

async function test() {
  const result = await streamText({
    model: createOpenAI({ apiKey: 'fake' })('gpt-3.5-turbo'),
    prompt: 'hello'
  });
  console.log(Object.keys(result));
}
test().catch(console.error);
