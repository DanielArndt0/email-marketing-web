import { httpClient } from "@/lib/api/http-client";

export async function getJson<T>(
  url: string,
  params?: Record<string, unknown>,
): Promise<T> {
  const response = await httpClient.get<T>(url, { params });
  return response.data;
}

export async function postJson<TResponse, TBody = unknown>(
  url: string,
  body?: TBody,
): Promise<TResponse> {
  const response = await httpClient.post<TResponse>(url, body);
  return response.data;
}

export async function putJson<TResponse, TBody = unknown>(
  url: string,
  body?: TBody,
): Promise<TResponse> {
  const response = await httpClient.put<TResponse>(url, body);
  return response.data;
}

export async function patchJson<TResponse, TBody = unknown>(
  url: string,
  body?: TBody,
): Promise<TResponse> {
  const response = await httpClient.patch<TResponse>(url, body);
  return response.data;
}

export async function deleteJson<TResponse = void>(
  url: string,
): Promise<TResponse> {
  const response = await httpClient.delete<TResponse>(url);
  return response.data;
}
