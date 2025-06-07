const express = require('express');
const { createProxyMiddleware, fixRequestBody } = require('http-proxy-middleware');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001; // Using a different port from Vite

app.use(cors());

app.get('/api/music', (req, res) => {
  try {
    const musicDirectory = path.join(__dirname, 'public/media/music');
    console.log(`Scanning for music in: ${musicDirectory}`); // Log the directory path

    const dirents = fs.readdirSync(musicDirectory, { withFileTypes: true });

    const albums = dirents
      .filter(dirent => dirent.isDirectory())
      .map(dirent => {
        const albumPath = path.join(musicDirectory, dirent.name);
        try {
          const songFiles = fs.readdirSync(albumPath);
          const songs = songFiles
            .filter(file => /\.(mp3|flac|wav|m4a)$/i.test(file))
            .map(songFile => ({
              title: path.parse(songFile).name,
              artist: dirent.name.split(' - ')[0], // Simple artist parsing
              album: dirent.name,
              url: `/media/music/${dirent.name}/${encodeURIComponent(songFile)}`
            }));
          
          return {
            name: dirent.name,
            songs: songs
          };
        } catch (e) {
          console.error(`Could not read album directory ${albumPath}:`, e);
          return null; // Return null for albums that can't be read
        }
      });

    res.json(albums.filter(Boolean)); // Filter out nulls from failed reads
  } catch (err) {
    console.error('Error in /api/music:', err);
    if (err.code === 'ENOENT') {
      // If the directory doesn't exist, return an empty array gracefully
      return res.json([]);
    }
    // For any other error, send a 500 response with a JSON error message
    return res.status(500).json({ error: 'Server error while getting music list.' });
  }
});

const proxy = createProxyMiddleware({
  changeOrigin: true,
  logLevel: 'debug',
  onProxyReq: fixRequestBody,
  router: (req) => {
    let targetUrlString = req.query.url;

    if (!targetUrlString && req.headers.referer) {
      try {
        const refererUrl = new URL(req.headers.referer);
        // Make sure we only use referer from our own proxy
        if (refererUrl.hostname === req.hostname && refererUrl.port === String(PORT) && refererUrl.searchParams.has('url')) {
          targetUrlString = refererUrl.searchParams.get('url');
        }
      } catch (e) {
        console.error('Invalid Referer URL', req.headers.referer);
      }
    }

    if (targetUrlString) {
      if (!targetUrlString.startsWith('http')) {
        targetUrlString = 'https://' + targetUrlString;
      }
      try {
        const targetUrl = new URL(targetUrlString);
        return `${targetUrl.protocol}//${targetUrl.host}`;
      } catch (e) {
        console.error('Invalid target URL:', targetUrlString);
      }
    }
    
    return null; // Don't proxy if we can't determine a target
  },
  pathRewrite: (path, req) => {
    // Only rewrite for the initial request that has the `url` param.
    if (req.query.url) {
      let targetUrlString = req.query.url;
      if (!targetUrlString.startsWith('http')) {
        targetUrlString = 'https://' + targetUrlString;
      }
      try {
        const targetUrl = new URL(targetUrlString);
        return targetUrl.pathname + targetUrl.search;
      } catch (e) {
        // fallback to original path
      }
    }
    // For asset requests, `path` is what we want (e.g. /images/logo.gif)
    return path;
  },
  onError: (err, req, res) => {
    console.error('Proxy Error:', err.message);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
    }
    res.end('Proxy Error: ' + err.message);
  }
});

app.use('/', proxy);

// Add a final handler for requests that weren't proxied
app.use((req, res, next) => {
    res.status(404).send('Resource not found.');
});


app.listen(PORT, () => {
  console.log(`Proxy server listening on port ${PORT}`);
}); 