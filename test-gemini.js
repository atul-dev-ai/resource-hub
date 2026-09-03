import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import fs from 'fs';

async function test() {
  const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const res = await generateText({
      model: google('gemini-2.5-flash'),
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Hello' },
            { type: 'file', data: Buffer.from('dummy'), mimeType: 'application/pdf' }
          ]
        }
      ]
    });
    console.log("Success:", res.text);
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
