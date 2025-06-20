import { InferenceClient } from "@huggingface/inference";

// Get the API token from environment variables
const HF_TOKEN = process.env.HF_API_KEY;
// Use the Llama-3.1-8B-Instruct model as specified
const MODEL = "meta-llama/Llama-3.1-8B-Instruct";

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

export default async function handler(req) {
  console.log('[API] ichat handler called');
  console.log('[API] Request method:', req.method);
  console.log('[API] Request headers:', JSON.stringify(Object.fromEntries(req.headers.entries())));
  
  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    console.log('[API] Handling OPTIONS preflight request');
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }
  
  // Check if API key is available
  if (!HF_TOKEN) {
    console.error('[API] No Hugging Face API key found in environment variables');
    console.error('[API] Available environment variables:', Object.keys(process.env).join(', '));
    return new Response(JSON.stringify({
      error: 'Configuration Error',
      details: 'Missing Hugging Face API key'
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  console.log('[API] Using API key:', HF_TOKEN.substring(0, 5) + '...' + HF_TOKEN.substring(HF_TOKEN.length - 5));
  
  if (req.method !== 'POST') {
    console.log('[API] Method not allowed:', req.method);
    return new Response(JSON.stringify({
      error: 'Method Not Allowed',
      details: `Method ${req.method} is not supported`
    }), { 
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
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
      console.log('[API] Raw request JSON:', JSON.stringify(json));
      messages = json.messages;
      console.log('[API] Got messages from req.json()');
    }
    
    console.log('[API] Messages:', JSON.stringify(messages).substring(0, 100) + '...');
  } catch (error) {
    console.error('[API] Error parsing request body:', error);
    console.error('[API] Error stack:', error.stack);
    return new Response(JSON.stringify({
      error: 'Invalid Request',
      details: `Failed to parse request body: ${error.message}`
    }), { 
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  if (!messages || !Array.isArray(messages)) {
    console.log('[API] Invalid or missing messages array');
    return new Response(JSON.stringify({
      error: 'Invalid Request',
      details: 'Missing or invalid messages array'
    }), { 
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
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
    console.log('[API] Response structure:', JSON.stringify(Object.keys(chatCompletion)));
    
    // Extract the content from the response
    const content = chatCompletion.choices[0].message.content;
    
    console.log('[API] Sending response content:', content);
    return new Response(JSON.stringify({ content }), {
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('[API] Error calling HuggingFace API:', error);
    console.error('[API] Error stack:', error.stack);
    return new Response(JSON.stringify({
      error: 'API Error',
      details: error.message
    }), { 
      status: 500,
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
} 