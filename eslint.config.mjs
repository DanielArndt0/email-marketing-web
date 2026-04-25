import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended
});

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",
      "coverage/**",
      "node_modules/**",
      "next-env.d.ts",
      "src/types/control-api-openapi.ts"
    ]
  },

  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier")
];

export default eslintConfig;