export const config = {
  runtime: 'edge',
};

// Helper: build a proxied URL pointing back to this function
function buildProxyUrl(originalRequest, target) {
  const u = new URL(originalRequest.url);
  u.pathname = '/api/proxy';
  u.search = `?url=${encodeURIComponent(target)}`;
  return u.toString();
}

export default async function handler(request) {
  const { searchParams } = new URL(request.url);
  const targetUrlString = searchParams.get('url');

  if (!targetUrlString) {
    return new Response('Missing "url" query parameter', { status: 400 });
  }

  let targetUrl;
  try {
    targetUrl = new URL(targetUrlString);
  } catch {
    return new Response('Invalid URL', { status: 400 });
  }

  // Forward the request to the target URL
  const outboundHeaders = new Headers();
  for (const [key, value] of request.headers.entries()) {
    const lower = key.toLowerCase();
    // Skip problematic headers
    if (['host', 'connection', 'content-length', 'content-encoding', 'transfer-encoding'].includes(lower)) continue;
    outboundHeaders.set(key, value);
  }
  outboundHeaders.set('referer', targetUrl.origin);
  // Add Accept-Encoding header to handle content encoding issues
  outboundHeaders.set('Accept-Encoding', 'identity');

  try {
    const upstreamResponse = await fetch(targetUrl.toString(), {
      headers: outboundHeaders,
      redirect: 'manual',
    });

    // Handle HTTP redirects manually so they also flow through the proxy
    if (upstreamResponse.status >= 300 && upstreamResponse.status < 400 && upstreamResponse.headers.has('location')) {
      const resolved = new URL(upstreamResponse.headers.get('location'), targetUrl).href;
      return new Response(null, {
        status: 302,
        headers: {
          Location: buildProxyUrl(request, resolved),
        },
      });
    }

    // Clone & filter headers
    const headers = new Headers();
    for (const [key, value] of upstreamResponse.headers.entries()) {
      const lower = key.toLowerCase();
      // Skip problematic headers
      if (['x-frame-options', 'content-security-policy', 'content-encoding', 'transfer-encoding'].includes(lower)) continue;
      headers.set(key, value);
    }
    
    // Handle Permissions-Policy header - filter out problematic directives
    if (headers.has('Permissions-Policy')) {
      const permissionsPolicy = headers.get('Permissions-Policy');
      // List of recognized Permissions-Policy features
      const recognizedFeatures = [
        'accelerometer', 'ambient-light-sensor', 'autoplay', 'battery', 'camera',
        'display-capture', 'document-domain', 'encrypted-media', 'execution-while-not-rendered',
        'execution-while-out-of-viewport', 'fullscreen', 'gamepad', 'geolocation',
        'gyroscope', 'hid', 'idle-detection', 'magnetometer', 'microphone',
        'midi', 'navigation-override', 'payment', 'picture-in-picture',
        'publickey-credentials-get', 'screen-wake-lock', 'serial', 'speaker-selection',
        'usb', 'web-share', 'xr-spatial-tracking'
      ];
      
      // Filter out unrecognized directives
      const filteredPolicy = permissionsPolicy
        .split(',')
        .filter(directive => {
          const feature = directive.trim().split('=')[0].trim();
          return recognizedFeatures.includes(feature);
        })
        .join(',');
      
      if (filteredPolicy) {
        headers.set('Permissions-Policy', filteredPolicy);
      } else {
        headers.delete('Permissions-Policy');
      }
    }

    // Get the response body
    const arrayBuffer = await upstreamResponse.arrayBuffer();
    
    // For non-HTML we can stream through untouched
    const contentType = headers.get('content-type') || '';

    // If HTMLRewriter is not available in the edge runtime, fall back to streaming response untouched
    const Rewriter = typeof HTMLRewriter !== 'undefined' ? HTMLRewriter : null;

    if (!contentType.includes('text/html') || !Rewriter) {
      return new Response(arrayBuffer, {
        status: upstreamResponse.status,
        statusText: upstreamResponse.statusText,
        headers,
      });
    }

    // For HTML, rewrite asset links so they also pass through the proxy
    const htmlContent = new TextDecoder().decode(arrayBuffer);
    const rewriter = new Rewriter();
    const rewrite = (attr) => (element) => {
      const value = element.getAttribute(attr);
      if (!value) return;
      try {
        const absolute = new URL(value, targetUrl).href;
        element.setAttribute(attr, `/api/proxy?url=${encodeURIComponent(absolute)}`);
      } catch {
        /* ignore invalid */
      }
    };

    rewriter.on('a, link', { element: rewrite('href') });
    rewriter.on('img, script, iframe, source, embed', { element: rewrite('src') });
    rewriter.on('form', { element: rewrite('action') });

    return new Response(rewriter.transform(new Response(htmlContent)), {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers,
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new Response(`Proxy Error: ${error.message}`, { 
      status: 500,
      headers: {
        'Content-Type': 'text/plain'
      }
    });
  }
} 