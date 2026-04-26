"use client";

import { CalendarClock, FileText, Send, Target, Users, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import type { Campaign, CampaignStatus } from "../types";

function getStatusLabel(status: CampaignStatus) {
  const labels: Record<CampaignStatus, string> = {
    draft: "Rascunho",
    ready: "Pronta",
    scheduled: "Agendada",
    running: "Em execução",
    paused: "Pausada",
    completed: "Concluída",
    canceled: "Cancelada",
    failed: "Falhou",
  };

  return labels[status] ?? status;
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return "Não informado";
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

function InfoCard({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: typeof Send;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-slate-500">
        <Icon className="h-4 w-4" />
        <p className="text-xs font-medium uppercase tracking-wide">{label}</p>
      </div>

      <p className="mt-3 text-lg font-semibold text-slate-950">{value}</p>

      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>
  );
}

export function CampaignPreview({
  campaign,
  onClose,
}: {
  campaign: Campaign;
  onClose: () => void;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Preview
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold text-slate-950">
              {campaign.name}
            </h2>

            <Badge className="bg-slate-50 text-slate-600">
              {getStatusLabel(campaign.status)}
            </Badge>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Conferência geral da campanha antes de preparar execução.
          </p>
        </div>

        <Button type="button" variant="ghost" onClick={onClose}>
          <X className="h-4 w-4" />
          Fechar
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <InfoCard
          icon={Target}
          label="Objetivo"
          value={campaign.goal || "—"}
          description="objetivo interno da campanha"
        />

        <InfoCard
          icon={FileText}
          label="Template"
          value={campaign.template?.name ?? campaign.templateId ?? "—"}
          description="conteúdo vinculado"
        />

        <InfoCard
          icon={Users}
          label="Audience"
          value={campaign.audience?.name ?? campaign.audienceId ?? "—"}
          description="público vinculado"
        />

        <InfoCard
          icon={CalendarClock}
          label="Agendamento"
          value={formatDateTime(campaign.scheduleAt)}
          description="data programada"
        />
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <h3 className="text-lg font-semibold text-slate-950">
          Resumo da campanha
        </h3>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Assunto
            </p>

            <p className="mt-2 text-sm text-slate-700">
              {campaign.subject || "Sem assunto informado"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Última execução
            </p>

            <p className="mt-2 text-sm text-slate-700">
              {formatDateTime(campaign.lastExecutionAt)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
