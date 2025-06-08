const express = require('express');
const { createProxyMiddleware, fixRequestBody } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());

// Middleware to remove security headers from proxied responses
app.use((req, res, next) => {
  const originalSetHeader = res.setHeader;
  res.setHeader = function(name, value) {
    const lowerName = name.toLowerCase();
    if (lowerName === 'x-frame-options' || lowerName === 'content-security-policy') {
      return;
    }
    originalSetHeader.call(this, name, value);
  };
  next();
});

// The single, clean endpoint for the iPod app
app.get('/api/music', (req, res) => {
  const googleDrivePlaylist = {
    playlistName: "Alok's Google Drive Mix",
    tracks: [
      {
        title: 'Dark Fantasy',
        artist: 'Kanye West',
        album: 'My Beautiful Dark Twisted Fantasy',
        duration: 280, // Placeholder
        previewUrl: 'https://drive.google.com/file/d/10ryk8CRJVhfyEJL8VA4kJeqexaPBpoUS/view?usp=sharing',
        albumArt: null,
      },
      {
        title: 'Chanel',
        artist: 'Frank Ocean',
        album: 'Single',
        duration: 210, // Placeholder
        previewUrl: 'https://drive.google.com/file/d/1ml9V2-HHzClleuk5_c3OQkZ1-sNhCB22/view?usp=sharing',
        albumArt: null,
      },
      {
        title: 'Icon',
        artist: 'Jaden',
        album: 'SYRE',
        duration: 220, // Placeholder
        previewUrl: 'https://drive.google.com/file/d/12S6M0LJ4mXklHUq6r0dhmez7tE77Kc_U/view?usp=drive_link',
        albumArt: null,
      },
      {
        title: "God's Plan (Cover)",
        artist: 'Ali Gatie',
        album: 'Single',
        duration: 180, // Placeholder
        previewUrl: 'https://drive.google.com/file/d/1zwvQm5SrU0Swh4IC3uWkPzziPDKMy3YB/view?usp=drive_link',
        albumArt: null,
      },
      {
        title: 'Mask Off',
        artist: 'Future',
        album: 'FUTURE',
        duration: 204, // Placeholder
        previewUrl: 'https://drive.google.com/file/d/1HpuX4hv-oAhVssa1DEVdVFCeLWNrrMYy/view?usp=drive_link',
        albumArt: null,
      },
    ]
  };
  res.json(googleDrivePlaylist);
});

const proxy = createProxyMiddleware({
  router: (req) => {
    const targetUrlString = req.query.url;
    if (!targetUrlString) {
      return null;
    }
    try {
      const targetUrl = new URL(targetUrlString);
      return targetUrl.origin;
    } catch (e) {
      console.error(`Invalid proxy URL: ${targetUrlString}`);
      return null;
    }
  },
  pathRewrite: (path, req) => {
    const targetUrlString = req.query.url;
    // For Google Drive, we need to transform the URL
    if (targetUrlString.includes('drive.google.com')) {
      const url = new URL(targetUrlString);
      const fileId = url.pathname.split('/')[3];
      const newPath = `/uc?export=download&id=${fileId}`;
      console.log(`Rewriting Google Drive path to: ${newPath}`);
      return newPath;
    }
    // Fallback for other URLs
    const targetUrl = new URL(targetUrlString);
    const newPath = targetUrl.pathname + targetUrl.search;
    console.log(`Rewriting path to: ${newPath}`);
    return newPath;
  },
  changeOrigin: true,
  followRedirects: true, // Important for Google Drive
  logLevel: 'debug',
  onProxyReq: fixRequestBody,
  onProxyRes: (proxyRes, req, res) => {
    // ... existing code ...
  },
  onError: (err, req, res) => {
    console.error(`Proxy Error: ${err.message}`);
    res.status(500).send('Proxy Error');
  }
});

app.use('/', proxy);

const server = app.listen(PORT, () => {
  console.log(`Proxy server listening on port ${PORT}`);
  console.log(`Server PID: ${process.pid}`);
});

const gracefulShutdown = () => {
  console.log('Received signal, shutting down gracefully...');
  server.close(() => {
    console.log('Closed out remaining connections.');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Listen for termination signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is already in use. If you just restarted, wait a moment.`);
  } else {
    console.error('Server error:', err);
  }
}); 