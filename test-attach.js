const { streamText } = require('ai');
const { createOpenAI } = require('@ai-sdk/openai');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const key = env.match(/OPENROUTER_API_KEY="?([^"\n]+)"?/)[1];

async function test() {
  try {
    const openrouter = createOpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: key,
    });
    
    const result = streamText({
      model: openrouter('openrouter/free'),
      messages: [{
        role: 'user',
        content: 'hello',
        experimental_attachments: [{
          name: 'Study Material',
          contentType: 'application/pdf',
          url: 'https://example.com/dummy.pdf'
        }]
      }]
    });
    
    const stream = result.textStream;
    for await (const chunk of stream) {
      process.stdout.write(chunk);
    }
    console.log("\nDone");
  } catch (err) {
    console.error("Failed:", err);
  }
}
test();
