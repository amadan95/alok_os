export const config = {
  runtime: 'edge'
};

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
  
  // Return a simple hardcoded response for any request
  return new Response(JSON.stringify({
    content: "Hello! I'm Alok, your virtual buddy in this retro Mac OS X environment. How can I help you today?"
  }), {
    status: 200,
    headers
  });
} 