const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const harmon = require('harmon');

const app = express();
const PORT = 3001;

// Middleware to remove X-Frame-Options header from all responses
app.use((req, res, next) => {
    res.removeHeader('X-Frame-Options');
    next();
});

// Endpoint for the iPod app (Google Drive links)
app.get('/api/music', (req, res) => {
  const googleDrivePlaylist = {
    playlistName: "Alok's Google Drive Mix",
    tracks: [
      {
        title: 'Dark Fantasy',
        artist: 'Kanye West',
        album: 'My Beautiful Dark Twisted Fantasy',
        duration: 280,
        previewUrl: 'https://drive.google.com/file/d/10ryk8CRJVhfyEJL8VA4kJeqexaPBpoUS/view?usp=sharing',
        albumArt: null,
      },
      {
        title: 'Chanel',
        artist: 'Frank Ocean',
        album: 'Single',
        duration: 210,
        previewUrl: 'https://drive.google.com/file/d/1ml9V2-HHzClleuk5_c3OQkZ1-sNhCB22/view?usp=sharing',
        albumArt: null,
      },
      {
        title: 'Icon',
        artist: 'Jaden',
        album: 'SYRE',
        duration: 220,
        previewUrl: 'https://drive.google.com/file/d/12S6M0LJ4mXklHUq6r0dhmez7tE77Kc_U/view?usp=drive_link',
        albumArt: null,
      },
      {
        title: "God's Plan (Cover)",
        artist: 'Ali Gatie',
        album: 'Single',
        duration: 180,
        previewUrl: 'https://drive.google.com/file/d/1zwvQm5SrU0Swh4IC3uWkPzziPDKMy3YB/view?usp=drive_link',
        albumArt: null,
      },
      {
        title: 'Mask Off',
        artist: 'Future',
        album: 'FUTURE',
        duration: 204,
        previewUrl: 'https://drive.google.com/file/d/1HpuX4hv-oAhVssa1DEVdVFCeLWNrrMYy/view?usp=drive_link',
        albumArt: null,
      },
    ]
  };
  res.json(googleDrivePlaylist);
});


// Main proxy for the Safari app
const safariProxy = createProxyMiddleware({
    target: 'https://www.google.com',
    changeOrigin: true,
    selfHandleResponse: true, // Important: allows us to modify the response
    logLevel: 'debug',
    onProxyRes: (proxyRes, req, res) => {
        // Remove headers that can prevent embedding or cause issues
        delete proxyRes.headers['x-frame-options'];
        delete proxyRes.headers['content-security-policy'];
        
        const targetUrl = new URL(req.proxy.target.href);
        const targetHost = targetUrl.protocol + '//' + targetUrl.host;

        // Use harmon to inject a <base> tag into the <head> of the HTML response
        // This makes all relative links on the page (like CSS, JS, and <a> tags)
        // point to the correct proxied origin.
        const injector = harmon([], [{
            query: 'head',
            func: (node) => {
                const baseTag = `<base href="${targetHost}">`;
                node.createWriteStream({ position: 'after' }).end(baseTag);
            }
        }]);

        try {
            // Pipe the response through the injector and then to the client
            proxyRes.pipe(injector).pipe(res);
        } catch (error) {
            console.error('Error during response rewriting:', error);
            res.status(500).send('Error processing the proxied response.');
        }
    },
    onError: (err, req, res) => {
        console.error('Proxy Error:', err);
        res.status(502).send('Proxy encountered an error.');
    }
});

app.use('/', safariProxy);

// Graceful shutdown
const server = app.listen(PORT, () => {
    console.log(`✅ Proxy server listening on port ${PORT}. PID: ${process.pid}`);
});

process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
}); 