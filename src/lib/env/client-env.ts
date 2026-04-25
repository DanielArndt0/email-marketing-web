import { z } from "zod";

const clientEnvSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().url().default("http://localhost:3333"),
  NEXT_PUBLIC_OPENAPI_SCHEMA_URL: z.string().url().optional(),
});

export const env = clientEnvSchema.parse({
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_OPENAPI_SCHEMA_URL: process.env.NEXT_PUBLIC_OPENAPI_SCHEMA_URL,
});
