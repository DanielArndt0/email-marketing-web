import { Clock, MailCheck, MailWarning, Send } from "lucide-react";

import type { MonitoredCampaign } from "../types";

type DispatchesMetricsProps = {
  campaigns: MonitoredCampaign[];
};

export function DispatchesMetrics({ campaigns }: DispatchesMetricsProps) {
  const totalCampaigns = campaigns.length;
  const totalSent = campaigns.reduce((sum, item) => sum + item.sentCount, 0);
  const totalFailed = campaigns.reduce(
    (sum, item) => sum + item.failedCount,
    0,
  );
  const totalQueued = campaigns.reduce(
    (sum, item) => sum + item.queuedCount,
    0,
  );

  const metrics = [
    {
      label: "Campanhas monitoradas",
      value: totalCampaigns,
      icon: Send,
      description: "Disparos acompanhados",
    },
    {
      label: "E-mails enviados",
      value: totalSent,
      icon: MailCheck,
      description: "Finalizados com sucesso",
    },
    {
      label: "E-mails com falha",
      value: totalFailed,
      icon: MailWarning,
      description: "Exigem análise ou retry",
    },
    {
      label: "E-mails na fila",
      value: totalQueued,
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
