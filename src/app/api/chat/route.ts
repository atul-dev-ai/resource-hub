import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, fileUrl, fileType } = await req.json();

  // Create OpenRouter client
  const openrouter = createOpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY || '',
  });

  // Prepare system prompt


  // Fetch the file if URL is provided
  let fileData: Uint8Array | undefined;
  if (fileUrl) {
    try {
      const response = await fetch(fileUrl);
      if (response.ok) {
        fileData = new Uint8Array(await response.arrayBuffer());
      }
    } catch (e) {
      console.error("Failed to fetch file for AI context:", e);
    }
  }

  // Inject the file data into the first user message if it's a new conversation
  const enhancedMessages = [...messages];
  const isFirstMessage = messages.length > 0 && messages[messages.length - 1].role === 'user' && messages.length === 1;

  let documentText = '';
  
  if (isFirstMessage && fileUrl && fileType) {
    if (fileType.toLowerCase().includes('pdf')) {
      try {
        const response = await fetch(fileUrl);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const pdfParse = require('pdf-parse');
        const pdfData = await pdfParse(buffer);
        documentText = pdfData.text;
      } catch (e) {
        console.error("Error parsing PDF:", e);
      }
    } else {
      // It's an image, attach it for vision models
      const mimeType = 'image/jpeg';
      enhancedMessages[0] = {
        ...enhancedMessages[0],
        experimental_attachments: [
          {
            name: 'Study Material',
            contentType: mimeType,
            url: fileUrl,
          }
        ]
      };
    }
  }

  const systemPrompt = `You are an intelligent study assistant for a university student.
Your goal is to help them understand their course materials.
Always provide accurate, educational, and structured responses.
Format your responses using Markdown.
${documentText ? `\nHere is the extracted text from the user's study material (PDF):\n\n${documentText.substring(0, 15000)}\n\nPlease reference this material to answer their questions.` : ''}`;

  try {
    // Using OpenRouter's auto-routed free model
    const result = streamText({
      model: openrouter('openrouter/free'),
      system: systemPrompt,
      messages: enhancedMessages,
    });

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.textStream) {
            controller.enqueue(new TextEncoder().encode(`0:${JSON.stringify(chunk)}\n`));
          }
        } catch (e) {
          console.error("Stream error:", e);
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Vercel-AI-Data-Stream': 'v1',
      },
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    return new Response(JSON.stringify({ error: "Failed to process chat." }), { status: 500 });
  }
}
