/**
 * Hurup AI Proxy — Cloudflare Worker
 * 
 * Production-stable proxy that forwards chat completion requests to Krutrim Cloud.
 * Handles CORS so GitHub Pages (or any origin) can call it safely.
 *
 * SETUP:
 *   1. Create a Cloudflare Worker (e.g. "hurup-ai-proxy")
 *   2. Paste this code into the worker editor
 *   3. Add an environment variable (Settings → Variables):
 *        KRUTRIM_API_KEY = <your-default-krutrim-token>
 *   4. Deploy
 *
 * HOW IT WORKS:
 *   - Client POSTs to this worker with the same body it would send to Krutrim.
 *   - If the client sends an `X-User-Api-Key` header, that key is used instead
 *     of the worker's default key. The key never touches the browser's
 *     Authorization header (avoiding CORS preflight issues with custom auth).
 *   - The worker forwards to Krutrim, streams the response back, and adds
 *     Access-Control-Allow-Origin: * so any origin can call it.
 */

const KRUTRIM_ENDPOINT = 'https://cloud.olakrutrim.com/v1/chat/completions';

// Allowed origins — use '*' for public, or lock down to your domain
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-User-Api-Key, Authorization',
  'Access-Control-Max-Age': '86400',
};

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (request.method !== 'POST') {
      return jsonResponse(405, { error: 'Method not allowed. Use POST.' });
    }

    // Determine which API key to use:
    // 1. Client-supplied key via X-User-Api-Key header (personal key)
    // 2. Worker's default key from environment variable
    const userKey = (request.headers.get('X-User-Api-Key') || '').trim();
    const apiKey = userKey || (env.KRUTRIM_API_KEY || '').trim();

    if (!apiKey) {
      return jsonResponse(500, {
        error: 'No API key configured. Set KRUTRIM_API_KEY in the worker environment or send X-User-Api-Key header.'
      });
    }

    let body;
    try {
      body = await request.text();
      JSON.parse(body); // validate it's JSON
    } catch {
      return jsonResponse(400, { error: 'Invalid JSON body.' });
    }

    // Forward to Krutrim
    try {
      const upstream = await fetch(KRUTRIM_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body,
      });

      // Clone response with CORS headers
      const responseBody = await upstream.text();
      const responseHeaders = new Headers(CORS_HEADERS);
      responseHeaders.set('Content-Type', upstream.headers.get('Content-Type') || 'application/json');

      return new Response(responseBody, {
        status: upstream.status,
        headers: responseHeaders,
      });
    } catch (err) {
      return jsonResponse(502, {
        error: `Upstream error: ${err.message || 'Failed to reach Krutrim Cloud'}`
      });
    }
  },
};

function jsonResponse(status, data) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}
