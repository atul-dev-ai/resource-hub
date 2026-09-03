import { streamText, embed } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { Index } from '@upstash/vector';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, fileUrls, fileType } = await req.json();

  // Create OpenRouter client
  const openrouter = createOpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY || '',
  });

  // Sanitize incoming messages to avoid AI SDK Zod validation errors from old/corrupt localStorage formats
  const enhancedMessages = messages.map((msg: any) => ({
    role: msg.role,
    content: typeof msg.content === 'string' && msg.content 
      ? msg.content 
      : (msg.parts ? msg.parts.map((p: any) => p.text || '').join('') : '')
  }));
  const lastUserMessage = enhancedMessages.length > 0 ? enhancedMessages[enhancedMessages.length - 1].content : "";
  const isFirstMessage = messages.length > 0 && messages[messages.length - 1].role === 'user' && messages.length === 1;

  let documentText = '';
  
  if (fileUrls && fileUrls.length > 0 && fileType) {
    const fileUrl = fileUrls[0]; // fallback for RAG filter and pdf parsing
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
        } else {
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
    }
    
    if (isFirstMessage) {
      // Attach all images or PDFs for vision/document models properly using multi-part content
      const lastUserMsg = enhancedMessages[enhancedMessages.length - 1];
      const newContent: any[] = [{ type: 'text', text: lastUserMsg.content as string }];
      
      for (const url of fileUrls) {
         if (fileType.toLowerCase().includes('pdf')) {
            try {
               const response = await fetch(url);
               const arrayBuffer = await response.arrayBuffer();
               const buffer = Buffer.from(arrayBuffer);
               newContent.push({
                 type: 'file',
                 data: buffer.toString('base64'),
                 mimeType: 'application/pdf'
               });
            } catch (e) {
               console.error("Failed to fetch PDF buffer for AI:", e);
            }
         } else {
            newContent.push({ type: 'image', image: url });
         }
      }
      
      enhancedMessages[enhancedMessages.length - 1] = {
        role: 'user',
        content: newContent
      };
    }
  }

let systemPromptContext = '';
if (isFirstMessage && fileUrls && fileUrls.length > 0) {
  systemPromptContext = `The user has attached their study material. Please carefully analyze the attached document or images and use it to generate comprehensive notes or answer their questions directly. Extract and format any relevant information.`;
} else if (documentText) {
  systemPromptContext = `Here are relevant excerpts from the user's study material:\n\n${documentText.substring(0, 15000)}\n\nPlease reference this material to answer their questions.`;
} else {
  systemPromptContext = `The user is asking a general question or the document text is still being processed. Please use your general knowledge to answer them as best as you can.`;
}

const systemPrompt = `You are an intelligent study assistant for a university student.
Your goal is to help them understand their course materials.
Always provide accurate, educational, and structured responses.
Format your responses using Markdown.
Never say you cannot read or access files or PDFs. The system will automatically extract and provide the relevant text from the user's files to you (or pass the image directly).

${systemPromptContext}`;

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
