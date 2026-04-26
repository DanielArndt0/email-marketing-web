import axios from "axios";

import { env } from "@/lib/env/client-env";

export type ApiErrorPayload = {
  message?: string;
  error?: string;
  statusCode?: number;
  code?: string;
  campaignsCount?: number;
  [key: string]: unknown;
};

export class ApiHttpError extends Error {
  status?: number;
  payload?: ApiErrorPayload;

  constructor(message: string, status?: number, payload?: ApiErrorPayload) {
    super(message);
    this.name = "ApiHttpError";
    this.status = status;
    this.payload = payload;
  }
}

export function getApiErrorMessage(
  error: unknown,
  fallback = "Erro inesperado ao comunicar com a API.",
) {
  if (error instanceof ApiHttpError) {
    const message = normalizeApiMessage(error.message);
    const campaignsCount = error.payload?.campaignsCount;

    if (typeof campaignsCount === "number") {
      return `${message} ${campaignsCount} ${
        campaignsCount === 1 ? "campanha vinculada" : "campanhas vinculadas"
      }.`;
    }

    return message;
  }

  if (error instanceof Error) {
    return normalizeApiMessage(error.message);
  }

  return fallback;
}

function normalizeApiMessage(message: string) {
  if (
    message.includes("campaigns_template_id_fkey") ||
    (message.includes("templates") && message.includes("campaigns"))
  ) {
    return "Este template não pode ser excluído porque já está vinculado a uma ou mais campanhas.";
  }

  if (
    message.includes("campaigns_audience_id_fkey") ||
    (message.includes("audience") && message.includes("campanha"))
  ) {
    return "Esta audience não pode ser excluída porque já está vinculada a uma ou mais campanhas.";
  }

  return message || "Erro inesperado ao comunicar com a API.";
}

export const httpClient = axios.create({
  baseURL: env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const payload = error?.response?.data as ApiErrorPayload | undefined;

    const message =
      payload?.message ??
      payload?.error ??
      error?.message ??
      "Erro inesperado ao comunicar com a API.";

    return Promise.reject(
      new ApiHttpError(message, error?.response?.status, payload),
    );
  },
);
