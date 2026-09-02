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
  const systemPrompt = "You are an expert AI tutor and study assistant inside the 'Varsity Resource Hub' platform. A student is asking you questions about a specific study material they are viewing. Analyze the material and answer their questions clearly, concisely, and accurately. If they ask for notes, provide well-structured, easy-to-understand study notes.";

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

  if (isFirstMessage && fileData && fileType) {
    const mimeType = fileType.toLowerCase().includes('pdf') ? 'application/pdf' : 'image/jpeg';
    
    // We add the file to the user's message
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

  try {
    // Using OpenRouter's auto-routed free model
    const result = streamText({
      model: openrouter('openrouter/free'),
      system: systemPrompt,
      messages: enhancedMessages,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API Error:", error);
    return new Response(JSON.stringify({ error: "Failed to process chat." }), { status: 500 });
  }
}
