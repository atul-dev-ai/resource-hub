import { streamText, embed } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { Index } from '@upstash/vector';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, fileUrl, fileType } = await req.json();

  // Create OpenRouter client
  const openrouter = createOpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY || '',
  });

  // Inject the file data into the first user message if it's a new conversation
  const enhancedMessages = [...messages];
  const lastUserMessage = messages.length > 0 ? messages[messages.length - 1].content : "";
  const isFirstMessage = messages.length > 0 && messages[messages.length - 1].role === 'user' && messages.length === 1;

  let documentText = '';
  
  if (fileUrl && fileType) {
    if (fileType.toLowerCase().includes('pdf')) {
      // RAG Retrieval Logic
      try {
        const index = new Index({
          url: process.env.UPSTASH_VECTOR_REST_URL,
          token: process.env.UPSTASH_VECTOR_REST_TOKEN,
        });

        const google = createGoogleGenerativeAI({
          apiKey: process.env.GEMINI_API_KEY || '',
        });

        // 1. Generate embedding for the user's question
        const { embedding } = await embed({
          model: google.textEmbeddingModel('gemini-embedding-2'),
          value: lastUserMessage,
        });

        // 2. Query Upstash Vector
        const results = await index.query({
          vector: embedding,
          topK: 5,
          includeMetadata: true,
          filter: `fileUrl = '${fileUrl}'` 
        });

        if (results && results.length > 0) {
          // Found chunks in RAG database!
          const chunks = results.map(r => r.metadata?.text).filter(Boolean);
          documentText = chunks.join('\n\n...\n\n');
        } else if (isFirstMessage) {
          // Fallback: If not indexed yet (e.g. old file), parse the PDF on the fly
          const response = await fetch(fileUrl);
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const pdfParse = require('pdf-parse');
          const pdfData = await pdfParse(buffer);
          documentText = pdfData.text;
        }
      } catch (e) {
        console.error("RAG Retrieval Error:", e);
      }
    } else if (isFirstMessage) {
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
${documentText ? `\nHere are relevant excerpts from the user's study material:\n\n${documentText.substring(0, 15000)}\n\nPlease reference this material to answer their questions.` : ''}`;

  try {
    const google = createGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY || '',
    });

    // Using direct Gemini API for fast and reliable responses
    const result = streamText({
      model: google('gemini-2.5-flash'),
      system: systemPrompt,
      messages: enhancedMessages,
    });

    return result.toUIMessageStreamResponse();
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to process chat.", 
        details: error.message || error.toString() 
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
