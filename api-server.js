import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import cors from 'cors';

// Load environment variables
dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();

// Enable CORS for all routes
app.use(cors());

// JSON body parser
app.use(express.json());

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`[API-SERVER] ${req.method} ${req.path}`);
  next();
});

// API routes
app.post('/api/ichat', async (req, res) => {
  console.log('[API-SERVER] iChat API route hit');
  try {
    console.log('[API-SERVER] Loading handler from ./api/ichat.js');
    const handler = (await import('./api/ichat.js')).default;
    console.log('[API-SERVER] Handler loaded, calling with request');
    const response = await handler(req);
    console.log('[API-SERVER] Handler response received');
    
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
    console.log(`[API-SERVER] Sending response with status ${status}`);
    res.status(status).send(body);
  } catch (error) {
    console.error('[API-SERVER] Error handling iChat API request:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
  console.log(`API endpoint available at http://localhost:${PORT}/api/ichat`);
}); 