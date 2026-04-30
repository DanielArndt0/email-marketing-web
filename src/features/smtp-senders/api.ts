import { endpoints } from "@/lib/api/endpoints";
import { deleteJson, getJson, postJson } from "@/lib/api/http";
import { httpClient } from "@/lib/api/http-client";

import type {
  CreateSmtpSenderInput,
  DeleteSmtpSenderResponse,
  SmtpSender,
  SmtpSenderListQuery,
  SmtpSenderListResponse,
  TestSmtpSenderInput,
  TestSmtpSenderResponse,
  UpdateSmtpSenderInput,
} from "./types";

function buildSmtpSenderListQuery(query?: SmtpSenderListQuery) {
  const searchParams = new URLSearchParams();

  if (query?.page) {
    searchParams.set("page", String(query.page));
  }

  if (query?.pageSize) {
    searchParams.set("pageSize", String(query.pageSize));
  }

  if (typeof query?.isActive === "boolean") {
    searchParams.set("isActive", String(query.isActive));
  }

  const queryString = searchParams.toString();

  return queryString
    ? `${endpoints.smtpSenders.list}?${queryString}`
    : endpoints.smtpSenders.list;
}

export async function listSmtpSenders(query?: SmtpSenderListQuery) {
  return getJson<SmtpSenderListResponse>(buildSmtpSenderListQuery(query));
}

export async function getSmtpSender(id: string) {
  return getJson<SmtpSender>(endpoints.smtpSenders.byId(id));
}

export async function createSmtpSender(input: CreateSmtpSenderInput) {
  return postJson<SmtpSender, CreateSmtpSenderInput>(
    endpoints.smtpSenders.create,
    input,
  );
}

export async function updateSmtpSender(
  id: string,
  input: UpdateSmtpSenderInput,
) {
  const response = await httpClient.patch<SmtpSender>(
    endpoints.smtpSenders.byId(id),
    input,
  );

  return response.data;
}

export async function deleteSmtpSender(id: string) {
  return deleteJson<DeleteSmtpSenderResponse>(endpoints.smtpSenders.byId(id));
}

export async function testSmtpSender(
  id: string,
  input: TestSmtpSenderInput = {},
) {
  return postJson<TestSmtpSenderResponse, TestSmtpSenderInput>(
    endpoints.smtpSenders.test(id),
    input,
  );
}
