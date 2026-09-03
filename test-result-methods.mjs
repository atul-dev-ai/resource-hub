import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

async function main() {
  const google = createGoogleGenerativeAI({ apiKey: 'fake_key' });
  const result = streamText({
    model: google('gemini-2.5-flash'),
    prompt: 'say hello',
  });
  console.log("Methods:");
  for (let key in result) {
    if (typeof result[key] === 'function') console.log(key);
  }
}
main();
