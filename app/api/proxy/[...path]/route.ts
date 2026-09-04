import { NextRequest, NextResponse } from 'next/server';
import { getBaseUrl } from '@/lib/api';

/**
 * Catch-all API proxy route.
 * Forwards all requests from the browser to the backend API server,
 * avoiding CORS preflight issues entirely.
 *
 * Example: POST /api/proxy/applications/ → POST http://localhost:8080/api/applications/
 */

const BACKEND_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080/api';

async function proxyRequest(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const targetPath = '/' + (path || []).join('/');
  const url = new URL(req.url);
  const queryString = url.search;
  const backendUrl = `${BACKEND_BASE}${targetPath}${queryString}`;

  // Forward headers, removing host-related ones
  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    if (!['host', 'connection', 'transfer-encoding'].includes(key.toLowerCase())) {
      headers[key] = value;
    }
  });

  try {
    const fetchOptions: RequestInit = {
      method: req.method,
      headers,
    };

    // Forward body for methods that have one
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const contentType = req.headers.get('content-type') || '';
      if (contentType.includes('multipart/form-data')) {
        fetchOptions.body = await req.arrayBuffer();
      } else {
        fetchOptions.body = await req.text();
      }
    }

    const backendRes = await fetch(backendUrl, fetchOptions);

    // Forward backend response headers
    const responseHeaders = new Headers();
    backendRes.headers.forEach((value, key) => {
      if (!['transfer-encoding', 'content-encoding'].includes(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    });

    const responseBody = await backendRes.arrayBuffer();

    return new NextResponse(responseBody, {
      status: backendRes.status,
      statusText: backendRes.statusText,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error('[API Proxy] Error:', error.message);
    return NextResponse.json(
      { detail: 'Gagal terhubung ke server backend: ' + error.message },
      { status: 502 }
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const DELETE = proxyRequest;
export const PATCH = proxyRequest;
