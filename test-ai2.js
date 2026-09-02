const { streamText } = require('ai');
const { createOpenAI } = require('@ai-sdk/openai');

async function test() {
  const result = await streamText({
    model: createOpenAI({ apiKey: 'fake' })('gpt-3.5-turbo'),
    prompt: 'hello'
  });
  let obj = result;
  let props = new Set();
  do {
    Object.getOwnPropertyNames(obj).forEach(p => props.add(p));
  } while (obj = Object.getPrototypeOf(obj));
  console.log(Array.from(props));
}
test().catch(console.error);
