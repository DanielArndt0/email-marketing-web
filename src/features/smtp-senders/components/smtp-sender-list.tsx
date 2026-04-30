"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Mail,
  Pencil,
  PlugZap,
  ShieldCheck,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getApiErrorMessage } from "@/lib/api/http-client";

import { useDeleteSmtpSender, useTestSmtpSender } from "../hooks";
import type { SmtpSender } from "../types";

type Feedback = {
  type: "success" | "error";
  message: string;
};

function formatDateTime(value?: string | null) {
  if (!value) {
    return "Nunca testado";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Data inválida";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function getTestStatusBadge(sender: SmtpSender) {
  if (!sender.lastTestStatus) {
    return (
      <Badge className="border-slate-200 bg-slate-50 text-slate-600 dark:border-neutral-600 dark:bg-neutral-700/40 dark:text-neutral-200">
        Não testado
      </Badge>
    );
  }

  const normalizedStatus = sender.lastTestStatus.toLowerCase();

  if (normalizedStatus === "success" || normalizedStatus === "ok") {
    return (
      <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
        Teste OK
      </Badge>
    );
  }

  return (
    <Badge className="border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
      Teste falhou
    </Badge>
  );
}

export function SmtpSenderList({
  senders,
  total,
  isLoading,
  isError,
  onEdit,
}: {
  senders: SmtpSender[];
  total: number;
  isLoading: boolean;
  isError: boolean;
  onEdit: (sender: SmtpSender) => void;
}) {
  const deleteSender = useDeleteSmtpSender();
  const testSender = useTestSmtpSender();

  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);

  async function handleTest(sender: SmtpSender) {
    setFeedback(null);
    setTestingId(sender.id);

    try {
      const result = await testSender.mutateAsync({
        id: sender.id,
        input: {},
      });

      setFeedback({
        type: "success",
        message: result.message || `Remetente "${sender.name}" testado.`,
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message: getApiErrorMessage(
          error,
          "Não foi possível testar este remetente.",
        ),
      });
    } finally {
      setTestingId(null);
    }
  }

  async function handleDelete(sender: SmtpSender) {
    setFeedback(null);

    try {
      await deleteSender.mutateAsync(sender.id);

      setFeedback({
        type: "success",
        message: `Remetente "${sender.name}" excluído com sucesso.`,
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message: getApiErrorMessage(
          error,
          "Não foi possível excluir este remetente.",
        ),
      });
    }
  }

  if (isLoading) {
    return (
      <EmptyState
        title="Carregando remetentes..."
        description="Consultando remetentes SMTP cadastrados na Control API."
      />
    );
  }

  if (isError) {
    return (
      <EmptyState
        title="Não foi possível carregar os remetentes"
        description="Verifique se a Control API está rodando e se o endpoint /smtp-senders está disponível."
      />
    );
  }

  if (senders.length === 0) {
    return (
      <EmptyState
        title="Nenhum remetente cadastrado"
        description="Cadastre seu primeiro remetente SMTP para usar nas campanhas."
      />
    );
  }

  return (
    <section className="app-list rounded-2xl">
      <div className="app-list-header px-6 py-5">
        <h2 className="text-lg font-semibold app-heading">
          Remetentes cadastrados
        </h2>

        <p className="mt-1 text-sm app-muted">
          {total}{" "}
          {total === 1 ? "remetente cadastrado" : "remetentes cadastrados"}
        </p>
      </div>

      {feedback ? (
        <div className="px-6 pt-5">
          <div
            className={
              feedback.type === "success"
                ? "flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                : "flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
            }
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            )}

            <p className="min-w-0 flex-1">{feedback.message}</p>

            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="rounded-lg p-1 transition hover:bg-white/70 dark:hover:bg-white/10"
              aria-label="Fechar aviso"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}

      <div>
        {senders.map((sender) => {
          const isTesting = testingId === sender.id;

          return (
            <article
              key={sender.id}
              className="app-list-row flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-start lg:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="app-icon-box mr-1 rounded-xl p-2">
                    <Mail className="h-4 w-4" />
                  </div>

                  <h3 className="font-semibold app-heading">{sender.name}</h3>

                  {sender.isActive ? (
                    <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                      Ativo
                    </Badge>
                  ) : (
                    <Badge className="border-slate-200 bg-slate-50 text-slate-600 dark:border-neutral-600 dark:bg-neutral-700/40 dark:text-neutral-200">
                      Inativo
                    </Badge>
                  )}

                  {sender.secure ? (
                    <Badge className="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
                      Secure
                    </Badge>
                  ) : null}

                  {getTestStatusBadge(sender)}
                </div>

                <p className="mt-2 text-sm app-muted">
                  {sender.fromName} &lt;{sender.fromEmail}&gt;
                </p>

                {sender.replyToEmail ? (
                  <p className="mt-1 text-xs app-soft">
                    Reply-to: {sender.replyToEmail}
                  </p>
                ) : null}

                {sender.lastTestError ? (
                  <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span className="line-clamp-2">{sender.lastTestError}</span>
                  </div>
                ) : null}

                <div className="mt-4 grid gap-3 text-sm app-muted md:grid-cols-3">
                  <div className="flex items-center gap-2">
                    <PlugZap className="h-4 w-4 app-soft" />
                    <span className="truncate">
                      {sender.host}:{sender.port}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 app-soft" />
                    <span className="truncate">
                      {sender.username || "Sem username"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 app-soft" />
                    <span className="truncate">
                      {formatDateTime(sender.lastTestedAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => void handleTest(sender)}
                  disabled={isTesting || testSender.isPending}
                >
                  <PlugZap className="h-4 w-4" />
                  {isTesting ? "Testando..." : "Testar"}
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => onEdit(sender)}
                >
                  <Pencil className="h-4 w-4" />
                  Editar
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => void handleDelete(sender)}
                  disabled={deleteSender.isPending}
                  title="Excluir remetente"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
