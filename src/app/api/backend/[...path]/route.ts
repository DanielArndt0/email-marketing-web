import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ProxyRouteContext = {
  params: Promise<{
    path?: string[];
  }>;
};

const BLOCKED_PROXY_HEADERS = new Set([
  "accept-encoding",
  "connection",
  "content-length",
  "host",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

function getApiBaseUrl() {
  const apiBaseUrl = process.env.API_BASE_URL;

  if (!apiBaseUrl) {
    throw new Error("API_BASE_URL não está configurada.");
  }

  return apiBaseUrl.replace(/\/$/, "");
}

function buildTargetUrl(request: NextRequest, pathSegments: string[] = []) {
  const baseUrl = getApiBaseUrl();
  const path = pathSegments.map(encodeURIComponent).join("/");
  const search = request.nextUrl.search;

  return `${baseUrl}/${path}${search}`;
}

function buildProxyHeaders(request: NextRequest) {
  const headers = new Headers();

  request.headers.forEach((value, key) => {
    const normalizedKey = key.toLowerCase();

    if (!BLOCKED_PROXY_HEADERS.has(normalizedKey)) {
      headers.set(key, value);
    }
  });

  return headers;
}

function buildProxyResponseHeaders(response: Response) {
  const headers = new Headers(response.headers);

  headers.delete("content-encoding");
  headers.delete("content-length");
  headers.delete("transfer-encoding");

  return headers;
}

async function proxyRequest(request: NextRequest, context: ProxyRouteContext) {
  try {
    const { path = [] } = await context.params;
    const targetUrl = buildTargetUrl(request, path);
    const method = request.method.toUpperCase();
    const hasBody = method !== "GET" && method !== "HEAD";

    const response = await fetch(targetUrl, {
      method,
      headers: buildProxyHeaders(request),
      body: hasBody ? await request.arrayBuffer() : undefined,
      cache: "no-store",
    });

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: buildProxyResponseHeaders(response),
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Não foi possível comunicar com a Control API.";

    return NextResponse.json(
      {
        message,
      },
      {
        status: 502,
      },
    );
  }
}

export async function GET(request: NextRequest, context: ProxyRouteContext) {
  return proxyRequest(request, context);
}

export async function POST(request: NextRequest, context: ProxyRouteContext) {
  return proxyRequest(request, context);
}

export async function PATCH(request: NextRequest, context: ProxyRouteContext) {
  return proxyRequest(request, context);
}

export async function PUT(request: NextRequest, context: ProxyRouteContext) {
  return proxyRequest(request, context);
}

export async function DELETE(request: NextRequest, context: ProxyRouteContext) {
  return proxyRequest(request, context);
}
