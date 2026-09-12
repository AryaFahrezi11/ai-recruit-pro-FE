import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export const dynamic = 'force-dynamic';

async function proxyRequest(req: NextRequest, context: any) {
  try {
    const params = context?.params ? await context.params : {};
    const pathArray = params?.path || [];
    const targetPath = '/' + (Array.isArray(pathArray) ? pathArray.join('/') : pathArray);
    const url = new URL(req.url);
    const queryString = url.search;
    const backendUrl = BACKEND_BASE + targetPath + queryString;

    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      if (!['host', 'connection', 'transfer-encoding'].includes(key.toLowerCase())) {
        headers[key] = value;
      }
    });

    const fetchOptions: RequestInit = {
      method: req.method,
      headers,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const contentType = req.headers.get('content-type') || '';
      if (contentType.includes('multipart/form-data')) {
        fetchOptions.body = await req.arrayBuffer();
      } else {
        fetchOptions.body = await req.text();
      }
    }

    const backendRes = await fetch(backendUrl, fetchOptions);

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
