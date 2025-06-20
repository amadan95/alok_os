export const config = {
  runtime: 'edge'
};

// Fallback responses in case the API call fails
const fallbackResponses = [
  "Oh look, another chat request. How original. What's on your mind... besides the obvious fascination with this retro interface? 🙄",
  "Let me guess, you want me to tell you how amazing this Mac OS X environment is? Fine, it's pretty cool. Now what?",
  "Frank Ocean, Kendrick, MF DOOM in the library? At least your music taste isn't as questionable as your chat timing. What's up?",
  "Wow, you found the chat app. Gold star for basic navigation skills. What can I help with? Or are we just clicking random icons?",
  "Tiger desktop, huh? Nostalgic or just can't afford the upgrade? Either way, I'm here. What do you need? 💻"
];

// Get a random fallback response
function getFallbackResponse() {
  const index = Math.floor(Math.random() * fallbackResponses.length);
  return fallbackResponses[index];
}

// Helper function to sanitize logs by redacting system prompt content
function sanitizeMessagesForLogs(messages) {
  if (!messages || !Array.isArray(messages)) return "Invalid messages format";
  
  return messages.map(msg => {
    if (msg.role === 'system') {
      return { role: 'system', content: '[REDACTED SYSTEM PROMPT]' };
    }
    return msg;
  });
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
    
    // Log sanitized messages (without system prompt content)
    console.log('[API] Messages received:', sanitizeMessagesForLogs(messages));
    
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
        temperature: 0.85,  // Higher temperature for more sarcastic, creative responses
        max_tokens: 200    // Allow for slightly longer responses to fit in sarcasm
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