import { InferenceClient } from "@huggingface/inference";

// Get the API token from environment variables
const HF_TOKEN = process.env.HF_API_KEY;
// Use the Llama-3.1-8B-Instruct model as specified
const MODEL = "meta-llama/Llama-3.1-8B-Instruct";

export default async function handler(req) {
  console.log('[API] ichat handler called');
  
  // Check if API key is available
  if (!HF_TOKEN) {
    console.error('[API] No Hugging Face API key found in environment variables');
    return new Response(JSON.stringify({
      error: 'Configuration Error',
      details: 'Missing Hugging Face API key'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  console.log('[API] Using API key:', HF_TOKEN.substring(0, 5) + '...' + HF_TOKEN.substring(HF_TOKEN.length - 5));
  
  if (req.method !== 'POST') {
    console.log('[API] Method not allowed:', req.method);
    return new Response('Method Not Allowed', { status: 405 });
  }

  console.log('[API] Parsing request body');
  let messages;
  try {
    // Handle both Express-style req.body and fetch API Request objects
    if (req.body && typeof req.body !== 'string') {
      messages = req.body.messages;
      console.log('[API] Got messages from req.body');
    } else {
      const json = await req.json();
      messages = json.messages;
      console.log('[API] Got messages from req.json()');
    }
    
    console.log('[API] Messages:', JSON.stringify(messages).substring(0, 100) + '...');
  } catch (error) {
    console.error('[API] Error parsing request body:', error);
    return new Response('Invalid request body', { status: 400 });
  }

  if (!messages || !Array.isArray(messages)) {
    console.log('[API] Invalid or missing messages array');
    return new Response('Missing messages array', { status: 400 });
  }

  console.log('[API] Sending request to HuggingFace for model:', MODEL);
  try {
    // Initialize the Hugging Face Inference client with the API token
    const client = new InferenceClient(HF_TOKEN);
    
    // Call the chatCompletion method as shown in the documentation
    const chatCompletion = await client.chatCompletion({
      provider: "auto",
      model: MODEL,
      messages: messages
    });
    
    console.log('[API] HuggingFace response received');
    
    // Extract the content from the response
    const content = chatCompletion.choices[0].message.content;
    
    console.log('[API] Sending response content:', content);
    return new Response(JSON.stringify({ content }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[API] Error calling HuggingFace API:', error);
    return new Response(JSON.stringify({
      error: 'API Error',
      details: error.message
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 