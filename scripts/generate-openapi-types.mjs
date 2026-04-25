import { existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;

  const content = readFileSync(filePath, "utf8");

  for (const line of content.split("\n")) {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmedLine.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const value = trimmedLine
      .slice(separatorIndex + 1)
      .trim()
      .replace(/^["']|["']$/g, "");

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(resolve(process.cwd(), ".env"));
loadEnvFile(resolve(process.cwd(), ".env.local"));

const openApiSchemaUrl = process.env.NEXT_PUBLIC_OPENAPI_SCHEMA_URL;

if (!openApiSchemaUrl) {
  console.error(
    "Erro: defina NEXT_PUBLIC_OPENAPI_SCHEMA_URL no arquivo .env.local.",
  );
  process.exit(1);
}

const outputFile = "src/types/control-api-openapi.ts";

console.log(`Gerando tipos OpenAPI a partir de: ${openApiSchemaUrl}`);
console.log(`Arquivo de saída: ${outputFile}`);

execFileSync(
  "npx",
  ["openapi-typescript", openApiSchemaUrl, "-o", outputFile],
  {
    stdio: "inherit",
    shell: process.platform === "win32",
  },
);
