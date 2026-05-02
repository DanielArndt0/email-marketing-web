import { Clock, MailCheck, MailWarning, Send } from "lucide-react";

import type { EmailDispatch } from "../types";

type DispatchesMetricsProps = {
  dispatches: EmailDispatch[];
};

export function DispatchesMetrics({ dispatches }: DispatchesMetricsProps) {
  const total = dispatches.length;
  const sent = dispatches.filter((item) => item.status === "sent").length;
  const failed = dispatches.filter((item) => item.status === "failed").length;
  const queued = dispatches.filter((item) => item.status === "queued").length;

  const metrics = [
    {
      label: "Total de envios",
      value: total,
      icon: Send,
      description: "Registros encontrados",
    },
    {
      label: "Enviados",
      value: sent,
      icon: MailCheck,
      description: "Finalizados com sucesso",
    },
    {
      label: "Falhas",
      value: failed,
      icon: MailWarning,
      description: "Exigem análise ou retry",
    },
    {
      label: "Na fila",
      value: queued,
      icon: Clock,
      description: "Aguardando processamento",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;

        return (
          <article key={metric.label} className="app-card-flat rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="app-muted text-sm">{metric.label}</p>
                <strong className="app-heading mt-2 block text-3xl">
                  {metric.value}
                </strong>
              </div>

              <div className="app-icon-box rounded-xl p-3">
                <Icon className="h-5 w-5" />
              </div>
            </div>

            <p className="app-soft mt-4 text-sm">{metric.description}</p>
          </article>
        );
      })}
    </div>
  );
}
