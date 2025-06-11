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
  const upstreamResponse = await fetch(targetUrl.toString(), {
    headers: {
      ...request.headers,
      Host: targetUrl.hostname,
      Referer: targetUrl.origin,
    },
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
  const headers = new Headers(upstreamResponse.headers);
  headers.delete('X-Frame-Options');
  headers.delete('Content-Security-Policy');
  headers.delete('Permissions-Policy');

  // For non-HTML we can stream through untouched
  const contentType = headers.get('content-type') || '';
  if (!contentType.includes('text/html')) {
    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers,
    });
  }

  // For HTML, rewrite asset links so they also pass through the proxy
  const rewriter = new HTMLRewriter();
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

  return new Response(rewriter.transform(upstreamResponse.body), {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers,
  });
} 