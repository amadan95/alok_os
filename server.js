import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import http from 'http';
import { WebSocketServer } from 'ws';
import './check-env.js'; // Ensure environment variables are loaded

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();

// Function to create the server
async function createServer() {
  // Create Vite server in middleware mode
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  // Body parser middleware for API routes - MUST BE BEFORE API ROUTES
  app.use(express.json());

  // Debug middleware to log all requests
  app.use((req, res, next) => {
    console.log('[DEBUG]', req.method, req.url);
    next();
  });

  // API routes
  app.all('/api/:route', async (req, res) => {
    try {
      const route = req.params.route;
      console.log('[DEBUG]', `${route} API route hit`);
      
      // Load the handler dynamically
      const handlerPath = `./api/${route}.js`;
      console.log('[DEBUG]', `Loading handler from ${handlerPath}`);
      
      try {
        const { default: handler } = await import(handlerPath);
        console.log('[DEBUG]', 'Handler loaded, calling with request');
        
        // Create a Request object from the Express request
        const url = new URL(req.url, `http://${req.headers.host}`);
        const headers = new Headers();
        
        // Copy headers from Express request to Headers object
        for (const [key, value] of Object.entries(req.headers)) {
          headers.set(key, value);
        }
        
        // Create request body if needed
        let body;
        if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
          body = JSON.stringify(req.body);
          console.log('[DEBUG]', 'Request body:', JSON.stringify(req.body).substring(0, 100) + '...');
        }
        
        const request = new Request(url, {
          method: req.method,
          headers: headers,
          body: body
        });
        
        // Call the handler with the Request object
        const response = await handler(request);
        console.log('[DEBUG]', 'Handler response received');
        
        // Send the response back to the client
        res.status(response.status);
        
        // Copy headers from Response to Express response
        for (const [key, value] of response.headers.entries()) {
          res.setHeader(key, value);
        }
        
        // Send the response body
        const responseBody = await response.text();
        console.log('[DEBUG]', 'Sending response with status', response.status);
        res.send(responseBody);
      } catch (error) {
        console.error('[ERROR]', `Error loading or executing handler for ${route}:`, error);
        res.status(500).json({ error: 'Internal server error' });
      }
    } catch (error) {
      console.error('[ERROR]', 'API route error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Use Vite's connect instance as middleware AFTER API routes
  app.use(vite.middlewares);

  // Serve static files from the public directory
  app.use(express.static(path.join(__dirname, 'public')));

  // Create HTTP server
  const server = http.createServer(app);

  // Create WebSocket server
  const wss = new WebSocketServer({ server });

  // WebSocket connection handler
  wss.on('connection', (ws) => {
    console.log('[WebSocket] Client connected');
    
    // Handle messages from clients
    ws.on('message', (message) => {
      console.log('[WebSocket] Received message:', message);
      
      // Echo the message back to the client
      ws.send(`Echo: ${message}`);
    });
    
    // Handle client disconnect
    ws.on('close', () => {
      console.log('[WebSocket] Client disconnected');
    });
  });

  // Handle WebSocket server errors
  wss.on('error', (error) => {
    console.error('[WebSocket] Server error:', error);
  });

  // Start the server
  const PORT = process.env.PORT || 5173;
  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`API endpoint should be available at http://localhost:${PORT}/api/ichat`);
  });
}

// Create and start the server
createServer().catch((error) => {
  console.error('Error starting server:', error);
  process.exit(1);
}); 