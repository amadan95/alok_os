import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'url';
import { createProxyMiddleware } from 'http-proxy-middleware';
import * as cheerio from 'cheerio';
import zlib from 'zlib';
import https from 'https'; // Use the standard https module

const customProxyPlugin = () => {
  return {
    name: 'custom-proxy-plugin',
    configureServer(server) {
      server.middlewares.use('/proxy/', (req, res) => {
        const targetUrlString = req.url.substring(1); // Remove the leading '/'
        let targetUrl;
        try {
          targetUrl = new URL(targetUrlString);
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          return res.end('Invalid URL specified for proxy.');
        }

        const options = {
          hostname: targetUrl.hostname,
          port: targetUrl.port || 443,
          path: targetUrl.pathname + targetUrl.search,
          method: req.method,
          headers: {
            ...req.headers,
            host: targetUrl.hostname,
            'accept-encoding': 'gzip, deflate',
          },
        };

        const proxyReq = https.request(options, (proxyRes) => {
            // Handle redirects
            if (proxyRes.statusCode >= 300 && proxyRes.statusCode < 400 && proxyRes.headers.location) {
                const redirectUrl = new URL(proxyRes.headers.location, targetUrlString).href;
                res.writeHead(302, { 'Location': `/proxy/${redirectUrl}` });
                return res.end();
            }

            const body = [];
            proxyRes.on('data', (chunk) => body.push(chunk));
            proxyRes.on('end', () => {
                const buffer = Buffer.concat(body);
                const contentEncoding = proxyRes.headers['content-encoding'];

                const handleBody = (err, decodedBody) => {
                    if (err) {
                        console.error('Error decoding body:', err);
                        res.writeHead(500);
                        return res.end('Error decoding response');
                    }

                    // Forward headers, but remove ones that are invalidated by our decompression
                    Object.keys(proxyRes.headers).forEach((key) => {
                        const lowerKey = key.toLowerCase();
                        if (
                            lowerKey !== 'content-security-policy' &&
                            lowerKey !== 'x-frame-options' &&
                            lowerKey !== 'content-encoding' && // CRITICAL: Remove, we are decompressing
                            lowerKey !== 'content-length'      // CRITICAL: Remove, length has changed
                        ) {
                            res.setHeader(key, proxyRes.headers[key]);
                        }
                    });

                    // Explicitly remove headers if they were not caught above
                    res.removeHeader('X-Frame-Options');
                    res.removeHeader('Content-Security-Policy');
                    
                    const contentType = proxyRes.headers['content-type'];
                    if (contentType && contentType.includes('text/html')) {
                        const $ = cheerio.load(decodedBody.toString());
                        const base = new URL(targetUrlString);

                        // A function to resolve a URL relative to the original page's URL
                        // and then wrap it in our proxy path.
                        function resolveAndProxy(urlToResolve) {
                            if (!urlToResolve || urlToResolve.startsWith('data:') || urlToResolve.startsWith('blob:')) {
                                return urlToResolve;
                            }
                            try {
                                const absoluteUrl = new URL(urlToResolve, base).href;
                                return `/proxy/${absoluteUrl}`;
                            } catch (e) {
                                return urlToResolve; // Don't change invalid URLs
                            }
                        }

                        // Rewrite all common attributes that contain URLs
                        $('a, link').each((i, el) => {
                            const href = $(el).attr('href');
                            if (href) $(el).attr('href', resolveAndProxy(href));
                        });

                        $('script, img, iframe, source, embed').each((i, el) => {
                            const src = $(el).attr('src');
                            if (src) $(el).attr('src', resolveAndProxy(src));
                        });

                        $('form').each((i, el) => {
                            const action = $(el).attr('action');
                            if (action) $(el).attr('action', resolveAndProxy(action));
                        });

                        res.writeHead(proxyRes.statusCode);
                        res.end($.html());
                    } else {
                        res.writeHead(proxyRes.statusCode);
                        res.end(decodedBody);
                    }
                };
                
                if (contentEncoding === 'gzip') {
                    zlib.gunzip(buffer, handleBody);
                } else if (contentEncoding === 'deflate') {
                    zlib.inflate(buffer, handleBody);
                } else {
                    handleBody(null, buffer);
                }
            });
        }).on('error', (e) => {
          console.error(`Proxy Error: ${e.message}`);
          res.writeHead(502);
          res.end('Proxy Error');
        });

        req.pipe(proxyReq, { end: true });
      });
    },
  };
};

// https://vitejs.dev/config/
export default defineConfig({
  base: './', // This ensures assets are loaded relative to the base URL
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    assetsInlineLimit: 0, // Ensure all assets are copied as files
  },
  server: {
    port: 5173,
  },
  plugins: [customProxyPlugin()],
  preview: {
    port: 5173,
    strictPort: false,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  publicDir: 'public',
}); 