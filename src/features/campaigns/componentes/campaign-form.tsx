"use client";

import {
  CalendarClock,
  FileText,
  GitBranch,
  Save,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { useAudiences } from "@/features/audiences/hooks";
import type { Audience } from "@/features/audiences/types";
import { useTemplates } from "@/features/templates/hooks";
import type { EmailTemplate } from "@/features/templates/types";

import { useCreateCampaign, useUpdateCampaign } from "../hooks";
import {
  campaignFormSchema,
  toApiDateTime,
  toDateTimeLocalValue,
  toNullableString,
  type CampaignFormValues,
} from "../schemas";
import type { Campaign, CampaignStatus } from "../types";

function getTemplateVariables(template?: EmailTemplate | null) {
  const rawVariables = (template as { variables?: unknown } | null | undefined)
    ?.variables;

  if (!Array.isArray(rawVariables)) {
    return [];
  }

  return rawVariables
    .map((variable) => {
      if (typeof variable === "string") {
        return variable;
      }

      if (variable && typeof variable === "object") {
        const record = variable as Record<string, unknown>;

        if (typeof record.key === "string") {
          return record.key;
        }

        if (typeof record.name === "string") {
          return record.name;
        }
      }

      return "";
    })
    .filter(Boolean);
}

function getAudienceFields(audience?: Audience | null) {
  if (!audience) {
    return [];
  }

  const filters = audience.filters ?? {};

  if (audience.sourceType === "manual-list") {
    const columns = filters.columns;

    if (Array.isArray(columns)) {
      return columns
        .map((column) => (typeof column === "string" ? column : ""))
        .filter(Boolean);
    }

    const recipients = filters.recipients;

    if (Array.isArray(recipients)) {
      const fields = new Set<string>();

      recipients.forEach((recipient) => {
        if (recipient && typeof recipient === "object") {
          Object.keys(recipient).forEach((key) => fields.add(key));
        }
      });

      return Array.from(fields);
    }

    return ["email"];
  }

  if (audience.sourceType === "csv-import") {
    const csvContent =
      typeof filters.csvContent === "string" ? filters.csvContent : "";
    const delimiter =
      typeof filters.delimiter === "string" && filters.delimiter
        ? filters.delimiter
        : ",";

    const firstLine = csvContent
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .split("\n")
      .find(Boolean);

    if (!firstLine) {
      return [
        typeof filters.emailColumn === "string" ? filters.emailColumn : "email",
      ];
    }

    return firstLine
      .split(delimiter)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [
    "email",
    "nomeFantasia",
    "razaoSocial",
    "cnpj",
    "municipio",
    "uf",
    "codigoCnaePrincipal",
    "descricaoCnaePrincipal",
  ];
}

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

function getDefaultValues(campaign: Campaign | null): CampaignFormValues {
  return {
    name: campaign?.name ?? "",
    goal: campaign?.goal ?? "",
    subject: campaign?.subject ?? "",
    status: campaign?.status ?? "draft",
    templateId: campaign?.templateId ?? "",
    audienceId: campaign?.audienceId ?? "",
    scheduleAt: toDateTimeLocalValue(campaign?.scheduleAt),
  };
}

export function CampaignForm({
  campaign,
  onCancel,
  onSaved,
}: {
  campaign: Campaign | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const createCampaign = useCreateCampaign();
  const updateCampaign = useUpdateCampaign();

  const templatesQuery = useTemplates();
  const audiencesQuery = useAudiences();

  const templates = templatesQuery.data ?? [];
  const audiences = audiencesQuery.data ?? [];

  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: getDefaultValues(campaign),
  });

  const templateId = form.watch("templateId");
  const audienceId = form.watch("audienceId");

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === templateId) ?? null,
    [templates, templateId],
  );

  const selectedAudience = useMemo(
    () => audiences.find((audience) => audience.id === audienceId) ?? null,
    [audiences, audienceId],
  );

  const templateVariables = useMemo(
    () => getTemplateVariables(selectedTemplate),
    [selectedTemplate],
  );

  const audienceFields = useMemo(
    () => getAudienceFields(selectedAudience),
    [selectedAudience],
  );

  const isPending = createCampaign.isPending || updateCampaign.isPending;

  async function handleSubmit(values: CampaignFormValues) {
    const payload = {
      name: values.name.trim(),
      goal: toNullableString(values.goal),
      subject: toNullableString(values.subject),
      status: values.status,
      templateId: toNullableString(values.templateId),
      audienceId: toNullableString(values.audienceId),
      scheduleAt: toApiDateTime(values.scheduleAt),
    };

    if (campaign) {
      await updateCampaign.mutateAsync({
        id: campaign.id,
        input: payload,
      });
    } else {
      await createCampaign.mutateAsync(payload);
    }

    onSaved();
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft md:p-6">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">
            {campaign ? "Editar campanha" : "Nova campanha"}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Vincule template, audience e dados básicos para preparar a campanha.
          </p>
        </div>

        <Button type="button" variant="ghost" onClick={onCancel}>
          <X className="h-4 w-4" />
          Cancelar
        </Button>
      </div>

      <form className="mt-6" onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
          <aside className="space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="text-xl font-semibold text-slate-950">
                Dados da campanha
              </h3>

              <p className="mt-2 text-sm leading-7 text-slate-500">
                Defina nome, objetivo, assunto e status atual da campanha.
              </p>

              <div className="mt-6 space-y-5">
                <FormField
                  label="Nome"
                  error={form.formState.errors.name?.message}
                >
                  <Input
                    placeholder="Ex: Campanha B2B Londrina"
                    {...form.register("name")}
                  />
                </FormField>

                <FormField label="Objetivo">
                  <Textarea
                    className="min-h-[110px] resize-none"
                    placeholder="Ex: Prospecção de empresas de tecnologia no Paraná."
                    {...form.register("goal")}
                  />
                </FormField>

                <FormField label="Assunto">
                  <Input
                    placeholder="Ex: Uma oportunidade para sua empresa"
                    {...form.register("subject")}
                  />
                </FormField>

                <FormField
                  label="Status"
                  error={form.formState.errors.status?.message}
                >
                  <select
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    {...form.register("status")}
                  >
                    <option value="draft">Rascunho</option>
                    <option value="ready">Pronta</option>
                    <option value="scheduled">Agendada</option>
                    <option value="running">Em execução</option>
                    <option value="paused">Pausada</option>
                    <option value="completed">Concluída</option>
                    <option value="canceled">Cancelada</option>
                    <option value="failed">Falhou</option>
                  </select>
                </FormField>

                <FormField label="Agendamento">
                  <Input
                    type="datetime-local"
                    {...form.register("scheduleAt")}
                  />
                </FormField>
              </div>
            </div>
          </aside>

          <div className="min-w-0 space-y-5">
            <section className="rounded-3xl border border-slate-200 bg-white p-5">
              <div>
                <h3 className="text-2xl font-semibold text-slate-950">
                  Vínculos da campanha
                </h3>

                <p className="mt-2 text-sm leading-7 text-slate-500">
                  Escolha o template e a audience que serão usados na preparação
                  da campanha.
                </p>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <FormField label="Template">
                  <select
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    {...form.register("templateId")}
                  >
                    <option value="">Selecione um template</option>

                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Audience">
                  <select
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    {...form.register("audienceId")}
                  >
                    <option value="">Selecione uma audience</option>

                    {audiences.map((audience) => (
                      <option key={audience.id} value={audience.id}>
                        {audience.name}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-1 h-5 w-5 text-slate-500" />

                <div>
                  <h3 className="text-lg font-semibold text-slate-950">
                    Preparação para mapeamento de variáveis
                  </h3>

                  <p className="mt-1 text-sm leading-7 text-slate-500">
                    Esta etapa mostra as variáveis do template e os campos da
                    audience. O mapeamento final pode ser implementado na
                    próxima evolução da Campaign.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-500" />
                    <h4 className="font-semibold text-slate-950">
                      Template selecionado
                    </h4>
                  </div>

                  {selectedTemplate ? (
                    <div className="mt-4 space-y-3">
                      <p className="text-sm font-medium text-slate-900">
                        {selectedTemplate.name}
                      </p>

                      <p className="text-sm text-slate-500">
                        {selectedTemplate.subject || "Sem assunto informado"}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {templateVariables.length > 0 ? (
                          templateVariables.map((variable) => (
                            <Badge
                              key={variable}
                              className="bg-slate-50 text-slate-600"
                            >
                              {"{{" + variable + "}}"}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-slate-400">
                            Nenhuma variável declarada
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-slate-400">
                      Selecione um template para visualizar as variáveis.
                    </p>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-500" />
                    <h4 className="font-semibold text-slate-950">
                      Audience selecionada
                    </h4>
                  </div>

                  {selectedAudience ? (
                    <div className="mt-4 space-y-3">
                      <p className="text-sm font-medium text-slate-900">
                        {selectedAudience.name}
                      </p>

                      <p className="text-sm text-slate-500">
                        Origem: {selectedAudience.sourceType}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {audienceFields.length > 0 ? (
                          audienceFields.map((field) => (
                            <Badge
                              key={field}
                              className="bg-slate-50 text-slate-600"
                            >
                              {field}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-slate-400">
                            Nenhum campo detectado
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-slate-400">
                      Selecione uma audience para visualizar os campos.
                    </p>
                  )}
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5">
              <div className="flex items-start gap-3">
                <GitBranch className="mt-1 h-5 w-5 text-slate-500" />

                <div>
                  <h3 className="text-lg font-semibold text-slate-950">
                    Próxima etapa
                  </h3>

                  <p className="mt-1 text-sm leading-7 text-slate-500">
                    Depois que o CRUD de campanhas estiver estável, o próximo
                    passo é salvar o mapeamento entre variáveis do template e
                    campos da audience.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button type="submit" disabled={isPending}>
            <Save className="h-4 w-4" />
            {isPending ? "Salvando..." : "Salvar campanha"}
          </Button>
        </div>
      </form>
    </section>
  );
}
