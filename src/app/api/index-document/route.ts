import { NextResponse } from 'next/server';
import { embedMany } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { Index } from '@upstash/vector';
import pdfParse from 'pdf-parse';

export const maxDuration = 60; // Allow more time for large PDFs

// Simple text chunker
function chunkText(text: string, maxChunkSize: number = 1000, overlap: number = 200): string[] {
  const chunks: string[] = [];
  let startIndex = 0;
  
  while (startIndex < text.length) {
    let endIndex = startIndex + maxChunkSize;
    if (endIndex < text.length) {
      // Try to find a natural break point (paragraph or sentence)
      const lastNewline = text.lastIndexOf('\n\n', endIndex);
      const lastPeriod = text.lastIndexOf('. ', endIndex);
      
      if (lastNewline > startIndex + maxChunkSize / 2) {
        endIndex = lastNewline + 2;
      } else if (lastPeriod > startIndex + maxChunkSize / 2) {
        endIndex = lastPeriod + 2;
      }
    } else {
      endIndex = text.length;
    }
    
    chunks.push(text.slice(startIndex, endIndex).trim());
    startIndex = endIndex - overlap;
  }
  
  return chunks.filter(c => c.length > 50); // Filter out tiny chunks
}

export async function POST(req: Request) {
  try {
    const { fileUrl, fileId } = await req.json();

    if (!fileUrl || !fileId) {
      return NextResponse.json({ error: 'fileUrl and fileId are required' }, { status: 400 });
    }

    // 1. Download the PDF
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Parse the PDF
    const pdfData = await pdfParse(buffer);
    const documentText = pdfData.text;

    if (!documentText || documentText.trim().length === 0) {
      return NextResponse.json({ error: 'Could not extract text from PDF' }, { status: 400 });
    }

    // 3. Chunk the text
    const chunks = chunkText(documentText);
    
    if (chunks.length === 0) {
      return NextResponse.json({ error: 'No valid text chunks generated' }, { status: 400 });
    }

    // 4. Generate Embeddings using Gemini
    const google = createGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY || '',
    });

    const { embeddings } = await embedMany({
      model: google.textEmbeddingModel('text-embedding-004'),
      values: chunks,
    });

    // 5. Save to Upstash Vector
    const index = new Index({
      url: process.env.UPSTASH_VECTOR_REST_URL,
      token: process.env.UPSTASH_VECTOR_REST_TOKEN,
    });

    // Format for Upstash
    const vectorData = chunks.map((text, i) => ({
      id: `${fileId}-${i}`,
      vector: embeddings[i],
      metadata: {
        fileUrl,
        fileId,
        text
      }
    }));

    // Upstash vector accepts batches of up to 1000 items
    // Let's process in batches of 100 to be safe
    const batchSize = 100;
    for (let i = 0; i < vectorData.length; i += batchSize) {
      const batch = vectorData.slice(i, i + batchSize);
      await index.upsert(batch);
    }

    return NextResponse.json({ 
      success: true, 
      chunksProcessed: chunks.length,
      message: 'Document successfully indexed into Upstash Vector'
    });

  } catch (error: any) {
    console.error('Indexing Error:', error);
    return NextResponse.json(
      { error: 'Failed to index document', details: error.message },
      { status: 500 }
    );
  }
}
