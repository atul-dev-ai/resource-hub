import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import fs from 'fs';

async function test() {
  try {
    const google = createGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY || '',
    });
    
    // Fetch a sample PDF
    console.log("Fetching PDF...");
    const response = await fetch("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf");
    const arrayBuffer = await response.arrayBuffer();
    
    console.log("Calling Gemini...");
    const result = await generateText({
      model: google('gemini-2.5-flash'),
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'What is inside this PDF?' },
            { type: 'file', data: arrayBuffer, mimeType: 'application/pdf' }
          ]
        }
      ]
    });
    console.log("Result:", result.text);
  } catch (e) {
    console.error("Test failed:", e);
  }
}
test();
