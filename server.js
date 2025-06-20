import express from 'express';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

// Helper function to sanitize request body for logging
function sanitizeRequestForLogs(req) {
  if (req.path.includes('/api/ichat') && req.body && req.body.messages) {
    // Create a deep copy of the request body
    const sanitizedBody = JSON.parse(JSON.stringify(req.body));
    
    // Redact system prompt content
    if (sanitizedBody.messages && Array.isArray(sanitizedBody.messages)) {
      sanitizedBody.messages = sanitizedBody.messages.map(msg => {
        if (msg.role === 'system') {
          return { role: 'system', content: '[REDACTED SYSTEM PROMPT]' };
        }
        return msg;
      });
    }
    
    return { ...req, body: sanitizedBody };
  }
  
  return req;
}

async function createServer() {
  const app = express();
  
  // Debug middleware to log all requests
  app.use((req, res, next) => {
    console.log(`[DEBUG] ${req.method} ${req.path}`);
    next();
  });
  
  // JSON body parser
  app.use(express.json());
  
  // API routes - IMPORTANT: Define API routes BEFORE Vite middleware
  app.post('/api/ichat', async (req, res) => {
    console.log('[DEBUG] iChat API route hit');
    try {
      console.log('[DEBUG] Loading handler from ./api/ichat.js');
      const handler = (await import('./api/ichat.js')).default;
      console.log('[DEBUG] Handler loaded, calling with request');
      
      // Don't log the full request with sensitive data
      const response = await handler(req);
      console.log('[DEBUG] Handler response received');
      
      // Extract status and headers from the Response object
      const status = response.status;
      const headers = Object.fromEntries(response.headers.entries());
      
      // Get the response body
      const body = await response.text();
      
      // Set headers
      Object.entries(headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });
      
      // Send response
      console.log(`[DEBUG] Sending response with status ${status}`);
      res.status(status).send(body);
    } catch (error) {
      console.error('Error handling iChat API request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // Create Vite server in middleware mode
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });
  
  // Use vite's connect instance as middleware AFTER defining API routes
  app.use(vite.middlewares);
  
  // Serve static files
  app.use(express.static(join(__dirname, 'public')));
  
  const PORT = process.env.PORT || 5173;
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`API endpoint should be available at http://localhost:${PORT}/api/ichat`);
  });
}

createServer(); 