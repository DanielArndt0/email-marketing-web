import { Eye, RotateCcw } from "lucide-react";

import type { EmailDispatch } from "../types";
import { DispatchStatusBadge } from "./dispatch-status-badge";

type DispatchesListProps = {
  dispatches: EmailDispatch[];
};

function formatDateTime(value?: string | null) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function DispatchesList({ dispatches }: DispatchesListProps) {
  if (dispatches.length === 0) {
    return (
      <section className="app-empty-state rounded-2xl p-10 text-center">
        <h2 className="app-heading text-lg font-semibold">
          Nenhum envio encontrado
        </h2>
        <p className="app-muted mt-2 text-sm">
          Ajuste os filtros para visualizar outros registros.
        </p>
      </section>
    );
  }

  return (
    <section className="app-list rounded-2xl">
      <div className="app-list-header px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="app-heading text-lg font-semibold">
              Envios monitorados
            </h2>
            <p className="app-muted mt-1 text-sm">
              Acompanhe status, tentativas, provedor e últimas falhas.
            </p>
          </div>

          <span className="app-badge app-badge-surface px-3 py-1">
            {dispatches.length} registros
          </span>
        </div>
      </div>

      <div className="divide-y divide-[var(--app-border-soft)]">
        {dispatches.map((dispatch) => (
          <article
            key={dispatch.id}
            className="app-list-row grid gap-4 px-5 py-4 xl:grid-cols-[1.4fr_1.1fr_160px_180px_150px]"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="app-heading font-semibold">
                  {dispatch.campaignName}
                </h3>

                <DispatchStatusBadge status={dispatch.status} />
              </div>

              <p className="app-muted mt-1 text-sm">{dispatch.subject}</p>
              <p className="app-soft mt-1 text-xs">ID: {dispatch.id}</p>
            </div>

            <div>
              <p className="app-soft text-xs font-semibold uppercase tracking-wide">
                Destinatário
              </p>
              <p className="app-text mt-1 truncate text-sm">
                {dispatch.recipientEmail}
              </p>
              <p className="app-soft mt-1 text-xs">
                Provedor: {dispatch.provider}
              </p>
            </div>

            <div>
              <p className="app-soft text-xs font-semibold uppercase tracking-wide">
                Tentativas
              </p>
              <p className="app-text mt-1 text-sm">
                {dispatch.attemptCount}/{dispatch.maxAttempts}
              </p>
            </div>

            <div>
              <p className="app-soft text-xs font-semibold uppercase tracking-wide">
                Entrada na fila
              </p>
              <p className="app-text mt-1 text-sm">
                {formatDateTime(dispatch.queuedAt)}
              </p>
            </div>

            <div className="flex items-center justify-start gap-2 xl:justify-end">
              <button
                type="button"
                className="app-button app-button-muted h-9 px-3 text-sm"
              >
                <Eye className="h-4 w-4" />
                Detalhes
              </button>

              <button
                type="button"
                className="app-button app-button-surface h-9 px-3 text-sm"
                disabled={dispatch.status !== "failed"}
              >
                <RotateCcw className="h-4 w-4" />
                Retry
              </button>
            </div>

            {dispatch.lastError ? (
              <div className="xl:col-span-5">
                <div className="app-alert-danger rounded-xl px-4 py-3 text-sm">
                  {dispatch.lastError}
                </div>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
