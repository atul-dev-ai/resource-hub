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
  
  if (fileUrls && fileUrls.length > 0) {
    const fileUrl = fileUrls[0]; // fallback for RAG filter and pdf parsing
    const isPdf = fileUrl.toLowerCase().includes('.pdf');
    
    if (isPdf) {
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
          model: google.textEmbeddingModel('text-embedding-004'),
          value: lastUserMessage,
        });

        // Temporarily disable RAG query to avoid cross-document contamination
        // until we fix the metadata filtering issue in Upstash.
        /*
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
        }
        */
      } catch (e: any) {
        console.error("RAG Retrieval Error (falling back to direct parse):", e.message || e);
      }
      
      // Fallback: If not indexed yet or RAG failed, parse the PDF on the fly
      if (!documentText) {
        try {
          const response = await fetch(fileUrl);
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const pdfParse = require('pdf-parse');
          const pdfData = await pdfParse(buffer);
          documentText = pdfData.text;
        } catch (e: any) {
          console.error("Direct PDF Parse Error:", e.message || e);
        }
      }
    }
    
    // Attach all images for vision models properly using multi-part content
    // We must do this on EVERY request because the frontend doesn't store the backend-injected file parts
    const firstUserMsgIndex = enhancedMessages.findIndex((m: any) => m.role === 'user');
    
    if (firstUserMsgIndex !== -1) {
      const firstUserMsg = enhancedMessages[firstUserMsgIndex];
      const newContent: any[] = [{ type: 'text', text: firstUserMsg.content as string }];
      
      for (const url of fileUrls) {
         if (!url.toLowerCase().includes('.pdf')) {
            newContent.push({ type: 'image', image: url });
         }
      }
      
      // Only update if we added images or document text
      if (newContent.length > 1 || documentText) {
        if (documentText) {
          const textMsg = newContent.find((c: any) => c.type === 'text');
          if (textMsg) {
            textMsg.text = `${textMsg.text}\n\n--- MATERIAL CONTEXT ---\n${documentText.substring(0, 30000)}\n--- END MATERIAL ---\n\nUse the material context provided above as your primary source of truth to answer the question.`;
          }
        }
        
        enhancedMessages[firstUserMsgIndex] = {
          ...firstUserMsg,
          content: newContent
        };
      }
    }
  }

const systemPrompt = `You are MRINMOYEE AI, an intelligent study assistant for university students.
Your goal is to help them understand their course materials.
Always provide accurate, educational, and structured responses using Markdown.
You have been provided with the user's material in the first message (either as text or images). Always reference it. Never ask the user to upload it.`;

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
