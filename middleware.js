export const config = {
  matcher: '/proxy',
};

async function handleRequest(request) {
  const { searchParams } = new URL(request.url);
  const targetUrlString = searchParams.get('url');

  if (!targetUrlString) {
    return new Response('Invalid URL', { status: 400 });
  }

  let targetUrl;
  try {
    targetUrl = new URL(targetUrlString);
  } catch (e) {
    return new Response('Invalid URL format', { status: 400 });
  }

  // Fetch the external page
  const res = await fetch(targetUrl.toString(), {
    headers: {
      ...request.headers,
      'Host': targetUrl.hostname,
      'Referer': targetUrl.origin,
    },
    redirect: 'manual', // We'll handle redirects manually
  });

  // Handle redirects
  if (res.status >= 300 && res.status < 400 && res.headers.has('location')) {
    const redirectUrl = new URL(res.headers.get('location'), targetUrl).href;
    const newLocation = new URL(request.url);
    newLocation.pathname = '/proxy';
    newLocation.search = `?url=${encodeURIComponent(redirectUrl)}`;

    return new Response(null, {
      status: 302,
      headers: {
        'Location': newLocation.toString(),
      },
    });
  }
  
  // Create new headers, stripping security headers
  const headers = new Headers(res.headers);
  headers.delete('X-Frame-Options');
  headers.delete('Content-Security-Policy');
  headers.delete('Permissions-Policy');

  // Use HTMLRewriter to rewrite links on the fly
  const rewriter = new HTMLRewriter();

  const rewriteAndProxy = (attribute) => (element) => {
    const url = element.getAttribute(attribute);
    if (url) {
      try {
        const absoluteUrl = new URL(url, targetUrl).href;
        element.setAttribute(attribute, `/proxy?url=${encodeURIComponent(absoluteUrl)}`);
      } catch (e) {
        // Ignore invalid URLs
      }
    }
  };

  rewriter.on('a, link', {
    element: rewriteAndProxy('href'),
  });
  rewriter.on('img, script, iframe, source, embed', {
    element: rewriteAndProxy('src'),
  });
   rewriter.on('form', {
    element: rewriteAndProxy('action'),
  });

  // Transform the response stream
  const transformedStream = rewriter.transform(res.body);

  return new Response(transformedStream, {
    status: res.status,
    statusText: res.statusText,
    headers,
  });
}

export function middleware(request) {
  return handleRequest(request);
} 