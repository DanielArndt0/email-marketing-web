import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createSmtpSender,
  deleteSmtpSender,
  listSmtpSenders,
  testSmtpSender,
  updateSmtpSender,
} from "./api";
import type {
  SmtpSenderListQuery,
  TestSmtpSenderInput,
  UpdateSmtpSenderInput,
} from "./types";

export const smtpSenderKeys = {
  all: ["smtp-senders"] as const,
  lists: () => [...smtpSenderKeys.all, "list"] as const,
  list: (query?: SmtpSenderListQuery) =>
    [...smtpSenderKeys.lists(), query ?? {}] as const,
};

export function useSmtpSenders(query?: SmtpSenderListQuery) {
  return useQuery({
    queryKey: smtpSenderKeys.list(query),
    queryFn: () => listSmtpSenders(query),
  });
}

export function useCreateSmtpSender() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSmtpSender,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: smtpSenderKeys.all });
    },
  });
}

export function useUpdateSmtpSender() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateSmtpSenderInput }) =>
      updateSmtpSender(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: smtpSenderKeys.all });
    },
  });
}

export function useDeleteSmtpSender() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSmtpSender,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: smtpSenderKeys.all });
    },
  });
}

export function useTestSmtpSender() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input?: TestSmtpSenderInput }) =>
      testSmtpSender(id, input ?? {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: smtpSenderKeys.all });
    },
  });
}
