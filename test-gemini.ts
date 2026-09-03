import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import 'dotenv/config';

async function main() {
  try {
    const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });
    const result = streamText({
      model: google('gemini-2.5-flash'),
      prompt: 'say hello',
    });
    console.log("Stream starting...");
    for await (const chunk of result.textStream) {
      console.log("Chunk:", chunk);
    }
    console.log("Stream finished.");
  } catch (e) {
    console.error("Error:", e);
  }
}
main();
