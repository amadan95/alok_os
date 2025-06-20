export const config = {
  runtime: 'edge'
};

// Fallback responses in case the API call fails
const fallbackResponses = [
  "Hey! Yeah, this Mac OS X environment is pretty nostalgic. What else would you like to chat about?",
  "Honestly, I'm just vibing in this retro Mac interface. What's up with you?",
  "The music library here is pretty solid - Frank Ocean, Kendrick, MF DOOM. You have good taste!",
  "Yeah, I'm here. What's on your mind? We can chat about the apps or whatever you're into.",
  "This Tiger desktop brings back memories. What can I help you with today?"
];

// Get a random fallback response
function getFallbackResponse() {
  const index = Math.floor(Math.random() * fallbackResponses.length);
  return fallbackResponses[index];
}

export default async function handler(req) {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, no-cache'
  };

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers
    });
  }
  
  try {
    // Check if we have a POST request
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({
        content: getFallbackResponse()
      }), {
        status: 200,
        headers
      });
    }
    
    // Get the API key
    const apiKey = process.env.HF_API_KEY;
    if (!apiKey) {
      // If no API key, return a fallback response
      return new Response(JSON.stringify({
        content: getFallbackResponse()
      }), {
        status: 200,
        headers
      });
    }
    
    // Parse the request body
    const body = await req.json();
    const messages = body.messages;
    
    if (!messages || !Array.isArray(messages)) {
      // If invalid messages, return a fallback response
      return new Response(JSON.stringify({
        content: getFallbackResponse()
      }), {
        status: 200,
        headers
      });
    }
    
    try {
      // Dynamically import the Hugging Face client
      const { InferenceClient } = await import('@huggingface/inference');
      
      // Initialize the client
      const client = new InferenceClient(apiKey);
      
      // Set a timeout for the API call
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('API call timed out')), 5000);
      });
      
      // Make the API call with a timeout
      const responsePromise = client.chatCompletion({
        model: "meta-llama/Llama-3.1-8B-Instruct",
        messages: messages,
        temperature: 0.7,  // Slightly higher temperature for more creative responses
        max_tokens: 150    // Allow for slightly longer responses
      });
      
      // Race between the API call and the timeout
      const response = await Promise.race([responsePromise, timeoutPromise]);
      
      // Return the response
      return new Response(JSON.stringify({
        content: response.choices[0].message.content
      }), {
        status: 200,
        headers
      });
    } catch (error) {
      // If the API call fails, return a fallback response
      return new Response(JSON.stringify({
        content: getFallbackResponse()
      }), {
        status: 200,
        headers
      });
    }
  } catch (error) {
    // Even if there's an error, return a valid response
    return new Response(JSON.stringify({
      content: getFallbackResponse()
    }), { 
      status: 200,
      headers
    });
  }
} 