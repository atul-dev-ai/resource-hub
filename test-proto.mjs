import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

async function main() {
  const google = createGoogleGenerativeAI({ apiKey: 'fake_key' });
  const result = streamText({
    model: google('gemini-2.5-flash'),
    prompt: 'say hello',
  });
  let proto = Object.getPrototypeOf(result);
  console.log("Proto methods:", Object.getOwnPropertyNames(proto));
}
main();
