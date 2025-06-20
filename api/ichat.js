export default async function handler(req) {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers
    });
  }
  
  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({
        error: 'Method Not Allowed'
      }), { 
        status: 405,
        headers
      });
    }

    // Check for API key
    const apiKey = process.env.HF_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({
        error: 'Missing API Key'
      }), { 
        status: 500,
        headers
      });
    }

    // Parse request
    const body = await req.json();
    const messages = body.messages;
    
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({
        error: 'Invalid request format'
      }), { 
        status: 400,
        headers
      });
    }

    // Hard-coded response for testing
    return new Response(JSON.stringify({
      content: "Hello! I'm Alok, your virtual buddy in this retro Mac OS X environment. How can I help you today?"
    }), {
      headers
    });
    
    /* Uncomment this section once the hard-coded response test works
    
    // Import the HuggingFace client
    const { InferenceClient } = await import("@huggingface/inference");
    
    // Initialize client
    const client = new InferenceClient(apiKey);
    
    // Make API call
    const response = await client.chatCompletion({
      model: "meta-llama/Llama-3.1-8B-Instruct",
      messages: messages
    });
    
    // Return response
    return new Response(JSON.stringify({
      content: response.choices[0].message.content
    }), {
      headers
    });
    */
    
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Server Error',
      message: error.message
    }), { 
      status: 500,
      headers
    });
  }
} 