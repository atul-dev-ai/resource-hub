import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

async function test() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    console.log("Fetching PDF...");
    const response = await fetch("https://dndcrhcsythuuokydpim.supabase.co/storage/v1/object/public/academic_resources/86f2b46e-db29-4f1f-ac00-509c323c12c3/1778421610856-Lecture_4_pdf.pdf");
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    
    console.log("Calling Gemini SDK directly...");
    const result = await model.generateContent([
      "What is this PDF about? Give a 1 sentence summary.",
      {
        inlineData: {
          data: base64,
          mimeType: "application/pdf"
        }
      }
    ]);
    console.log("Result:", result.response.text());
  } catch (e) {
    console.error("Test failed:", e);
  }
}
test();
