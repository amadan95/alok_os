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
    // Return a simple hardcoded response for any request
    return new Response(JSON.stringify({
      content: "Hello! I'm Alok, your virtual buddy in this retro Mac OS X environment. How can I help you today?"
    }), {
      headers
    });
  } catch (error) {
    // Even if there's an error, return a valid response
    return new Response(JSON.stringify({
      content: "I'm here and ready to chat! What would you like to talk about?"
    }), { 
      headers
    });
  }
} 