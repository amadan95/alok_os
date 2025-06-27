export const config = {
  runtime: 'edge'
};

// Default error message when API call fails
const DEFAULT_ERROR_MESSAGE = "Connection issue. Let's blame it on these vintage Y2K-era servers. Try again? 🔄";

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

// Helper function to detect and process URLs in messages
function processUrls(content) {
  // Simple URL regex pattern
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  
  // Check if content contains URLs
  const urls = content.match(urlRegex);
  if (!urls) return content;
  
  // Add instructions for handling the URLs
  let processedContent = content;
  
  urls.forEach(url => {
    // Check if URL is an image
    const isImage = imageExtensions.some(ext => url.toLowerCase().endsWith(ext));
    
    if (isImage) {
      processedContent += `\n\n(Note: This message contains an image URL: ${url}. Please acknowledge the image in your response.)`;
    } else {
      processedContent += `\n\n(Note: This message contains a link: ${url}. Please acknowledge the link in your response.)`;
    }
  });
  
  return processedContent;
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
    console.log('[API] ichat handler called');
    
    // Check if we have a POST request
    if (req.method !== 'POST') {
      console.log('[API] Not a POST request, returning default error');
      return new Response(JSON.stringify({
        content: DEFAULT_ERROR_MESSAGE
      }), {
        status: 200,
        headers
      });
    }
    
    // Get the API key from environment variables
    const apiKey = process.env.TOGETHER_API_KEY;
    console.log('[API] Together API Key available:', !!apiKey, apiKey ? `(starts with: ${apiKey.substring(0, 5)}...)` : '(missing)');
    
    if (!apiKey) {
      // If no API key, return the default error message
      console.error('[API] No Together API key found in environment variables');
      return new Response(JSON.stringify({
        content: DEFAULT_ERROR_MESSAGE
      }), {
        status: 200,
        headers
      });
    }
    
    // Parse the request body
    console.log('[API] Parsing request body');
    const body = await req.json();
    const messages = body.messages;
    console.log('[API] Got messages from req.body');
    
    if (!messages || !Array.isArray(messages)) {
      console.error('[API] Invalid messages format');
      // If invalid messages, return the default error message
      return new Response(JSON.stringify({
        content: DEFAULT_ERROR_MESSAGE
      }), {
        status: 200,
        headers
      });
    }
    
    // Process messages to handle multimedia content
    const processedMessages = messages.map(msg => {
      if (msg.role === 'user') {
        return {
          ...msg,
          content: processUrls(msg.content)
        };
      }
      return msg;
    });
    
    // Log sanitized messages (without system prompt content)
    console.log('[API] Messages:', JSON.stringify(sanitizeMessagesForLogs(processedMessages)).substring(0, 100) + '...');
    
    try {
      console.log('[API] Sending request to Together AI for model: deepseek-ai/DeepSeek-V3');
      
      // Generate a random token length between 100 and 500 for more natural responses
      const randomTokenLength = Math.floor(Math.random() * 401) + 100; // Random between 100 and 500
      console.log(`[API] Using random max_tokens: ${randomTokenLength}`);
      
      const response = await fetch('https://api.together.xyz/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`
        },
        body: JSON.stringify({
          model: 'deepseek-ai/DeepSeek-V3',
          messages: processedMessages,
          temperature: 0.85,
          max_tokens: randomTokenLength,
          stream: false
        })
      });
      
      console.log('[API] Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[API] Together AI error response:', errorText);
        throw new Error(`Together AI API returned ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('[API] Together AI response received');
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error('[API] Invalid response format');
        throw new Error('Invalid response format from Together AI');
      }
      
      const content = data.choices[0].message.content;
      console.log('[API] Sending response content:', content.substring(0, 100) + '...');
      
      // Return the response
      return new Response(JSON.stringify({
        content: content
      }), {
        status: 200,
        headers
      });
    } catch (error) {
      // Log detailed error information
      console.error('[API] Error calling Together AI:', error.message);
      
      // If the API call fails, return the default error message
      return new Response(JSON.stringify({
        content: DEFAULT_ERROR_MESSAGE
      }), {
        status: 200,
        headers
      });
    }
  } catch (error) {
    // Even if there's an error, return a valid response with the default error message
    console.error('[API] Unexpected error:', error.message);
    return new Response(JSON.stringify({
      content: DEFAULT_ERROR_MESSAGE
    }), { 
      status: 200,
      headers
    });
  }
} 