import { embed } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { Index } from '@upstash/vector';

async function test() {
  try {
    const google = createGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY || '',
    });
    
    console.log("Generating embedding with text-embedding-004...");
    const { embedding } = await embed({
      model: google.textEmbeddingModel('text-embedding-004'),
      value: "Make comprehensive notes",
    });
    console.log("Embedding generated! length:", embedding.length);
  } catch (e) {
    console.error("004 Test failed:", e.message);
  }
  
  try {
    const google = createGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY || '',
    });
    console.log("Generating embedding with embedding-001...");
    const { embedding } = await embed({
      model: google.textEmbeddingModel('embedding-001'),
      value: "Make comprehensive notes",
    });
    console.log("Embedding generated! length:", embedding.length);
  } catch (e) {
    console.error("001 Test failed:", e.message);
  }
}
test();
