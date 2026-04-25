import axios from "axios";

import { env } from "@/lib/env/client-env";

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
    const message =
      error?.response?.data?.message ??
      error?.response?.data?.error ??
      error?.message ??
      "Erro inesperado ao comunicar com a API.";

    return Promise.reject(new Error(message));
  },
);
