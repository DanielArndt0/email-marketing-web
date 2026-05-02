import type { DispatchStatus } from "../types";

const statusLabels: Record<DispatchStatus, string> = {
  queued: "Na fila",
  processing: "Processando",
  sent: "Enviado",
  failed: "Falhou",
  retrying: "Tentando novamente",
  canceled: "Cancelado",
};

const statusClasses: Record<DispatchStatus, string> = {
  queued: "app-badge app-badge-info",
  processing: "app-badge app-badge-muted",
  sent: "app-badge app-badge-success",
  failed: "app-badge app-badge-danger",
  retrying: "app-badge app-badge-warning",
  canceled: "app-badge app-badge-soft",
};

export function DispatchStatusBadge({ status }: { status: DispatchStatus }) {
  return (
    <span className={`${statusClasses[status]} px-3 py-1`}>
      {statusLabels[status]}
    </span>
  );
}
