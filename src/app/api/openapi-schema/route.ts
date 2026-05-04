import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getOpenApiSchemaUrl() {
  const openApiSchemaUrl = process.env.OPENAPI_SCHEMA_URL;

  if (!openApiSchemaUrl) {
    throw new Error("OPENAPI_SCHEMA_URL não está configurada.");
  }

  return openApiSchemaUrl;
}

export async function GET() {
  try {
    const response = await fetch(getOpenApiSchemaUrl(), {
      cache: "no-store",
    });

    const contentType =
      response.headers.get("content-type") ?? "application/json";

    const body = await response.text();

    return new NextResponse(body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        "content-type": contentType,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Não foi possível carregar o schema OpenAPI.";

    return NextResponse.json(
      {
        message,
      },
      {
        status: 500,
      },
    );
  }
}
