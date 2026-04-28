"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Save,
  Sparkles,
  Users,
  ArrowRight,
  ArrowDown,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAudiences } from "@/features/audiences/hooks";
import type { Audience } from "@/features/audiences/types";
import { useTemplates } from "@/features/templates/hooks";
import type { EmailTemplate } from "@/features/templates/types";
import { getApiErrorMessage } from "@/lib/api/http-client";

import { useCreateCampaign, useUpdateCampaign } from "../hooks";
import {
  campaignFormSchema,
  toApiDateTime,
  toDateTimeLocalValue,
  type CampaignFormValues,
} from "../schemas";
import type { Campaign, CampaignStatus, CreateCampaignInput } from "../types";

type WizardStep = 0 | 1 | 2;

const steps = [
  {
    title: "Dados",
    description: "Nome, objetivo e status",
  },
  {
    title: "Vínculos",
    description: "Template e audience",
  },
  {
    title: "Resumo",
    description: "Conferência final",
  },
] as const;

function getTemplateVariables(template?: EmailTemplate | null): string[] {
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

function getAudienceFields(audience?: Audience | null): string[] {
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

function toOptionalString(value?: string | null) {
  const normalized = value?.trim();

  return normalized || undefined;
}

function getStatusLabel(status?: CampaignStatus) {
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

  return status ? labels[status] : "Rascunho";
}

function formatSchedulePreview(value?: string | null) {
  if (!value?.trim()) {
    return "Sem agendamento";
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

function StepIndicator({ currentStep }: { currentStep: WizardStep }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isDone = index < currentStep;

        return (
          <div
            key={step.title}
            className={
              isActive
                ? "rounded-2xl border border-slate-950 bg-slate-950 p-4 text-white"
                : isDone
                  ? "rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800"
                  : "rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-500"
            }
          >
            <div className="flex items-center gap-3">
              <div
                className={
                  isActive
                    ? "grid h-8 w-8 place-items-center rounded-xl bg-white text-sm font-semibold text-slate-950"
                    : isDone
                      ? "grid h-8 w-8 place-items-center rounded-xl bg-emerald-100 text-emerald-700"
                      : "grid h-8 w-8 place-items-center rounded-xl bg-white text-sm font-semibold text-slate-500"
                }
              >
                {isDone ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
              </div>

              <div>
                <p className="text-sm font-semibold">{step.title}</p>
                <p
                  className={
                    isActive
                      ? "mt-0.5 text-xs text-slate-300"
                      : "mt-0.5 text-xs opacity-80"
                  }
                >
                  {step.description}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
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

  const [currentStep, setCurrentStep] = useState<WizardStep>(0);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [templateVariableMappings, setTemplateVariableMappings] = useState<
    Record<string, string>
  >({});

  const templates = useMemo(
    () => templatesQuery.data ?? [],
    [templatesQuery.data],
  );

  const audiences = useMemo(
    () => audiencesQuery.data ?? [],
    [audiencesQuery.data],
  );

  const defaultValues = useMemo(() => getDefaultValues(campaign), [campaign]);

  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues,
  });

  useEffect(() => {
    form.reset(defaultValues);
    setCurrentStep(0);
    setSubmitError(null);
    setTemplateVariableMappings(campaign?.templateVariableMappings ?? {});
  }, [campaign?.templateVariableMappings, defaultValues, form]);

  const templateId = form.watch("templateId");
  const audienceId = form.watch("audienceId");
  const watchedName = form.watch("name");
  const watchedGoal = form.watch("goal");
  const watchedSubject = form.watch("subject");
  const watchedStatus = form.watch("status");
  const watchedScheduleAt = form.watch("scheduleAt");

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

  useEffect(() => {
    setTemplateVariableMappings((currentMappings) => {
      const nextMappings: Record<string, string> = {};

      templateVariables.forEach((variable) => {
        const existingField = currentMappings[variable];

        if (existingField && audienceFields.includes(existingField)) {
          nextMappings[variable] = existingField;
          return;
        }

        const exactMatch =
          audienceFields.find((field) => field === variable) ??
          audienceFields.find(
            (field) => field.toLowerCase() === variable.toLowerCase(),
          );

        if (exactMatch) {
          nextMappings[variable] = exactMatch;
        }
      });

      return nextMappings;
    });
  }, [audienceFields, templateVariables]);

  function handleMappingChange(variable: string, field: string) {
    setTemplateVariableMappings((current) => {
      const nextMappings = { ...current };

      if (!field) {
        delete nextMappings[variable];
        return nextMappings;
      }

      nextMappings[variable] = field;
      return nextMappings;
    });
  }

  const isPending = createCampaign.isPending || updateCampaign.isPending;

  async function goToNextStep() {
    setSubmitError(null);

    if (currentStep === 0) {
      const isValid = await form.trigger([
        "name",
        "goal",
        "subject",
        "status",
        "scheduleAt",
      ]);

      if (!isValid) {
        return;
      }

      setCurrentStep(1);
      return;
    }

    if (currentStep === 1) {
      const templateIdValue = toOptionalString(form.getValues("templateId"));
      const audienceIdValue = toOptionalString(form.getValues("audienceId"));

      let hasError = false;

      if (!templateIdValue) {
        form.setError("templateId", {
          type: "custom",
          message: "Selecione um template.",
        });
        hasError = true;
      }

      if (!audienceIdValue) {
        form.setError("audienceId", {
          type: "custom",
          message: "Selecione uma audience.",
        });
        hasError = true;
      }

      if (hasError) {
        return;
      }

      const unmappedVariables = templateVariables.filter(
        (variable) => !templateVariableMappings[variable],
      );

      if (unmappedVariables.length > 0) {
        setSubmitError(
          `Mapeie as variáveis do template antes de continuar: ${unmappedVariables
            .map((variable) => `{{${variable}}}`)
            .join(", ")}.`,
        );

        return;
      }

      form.clearErrors(["templateId", "audienceId"]);
      setCurrentStep(2);
    }
  }

  function goToPreviousStep() {
    setSubmitError(null);
    setCurrentStep((step) => (step > 0 ? ((step - 1) as WizardStep) : step));
  }

  async function handleSubmit(values: CampaignFormValues): Promise<void> {
    setSubmitError(null);

    const goal = toOptionalString(values.goal);
    const subject = toOptionalString(values.subject);
    const templateIdValue = toOptionalString(values.templateId);
    const audienceIdValue = toOptionalString(values.audienceId);
    const scheduleAt = values.scheduleAt?.trim()
      ? toApiDateTime(values.scheduleAt)
      : undefined;

    const normalizedTemplateVariableMappings = templateVariables.reduce<
      Record<string, string>
    >((mappings, variable) => {
      const field = templateVariableMappings[variable];

      if (field) {
        mappings[variable] = field;
      }

      return mappings;
    }, {});

    const payload: CreateCampaignInput = {
      name: values.name.trim(),
      status: values.status,
      ...(goal ? { goal } : {}),
      ...(subject ? { subject } : {}),
      ...(templateIdValue ? { templateId: templateIdValue } : {}),
      ...(audienceIdValue ? { audienceId: audienceIdValue } : {}),
      ...(scheduleAt ? { scheduleAt } : {}),
      templateVariableMappings: normalizedTemplateVariableMappings,
    };

    try {
      if (campaign) {
        await updateCampaign.mutateAsync({
          id: campaign.id,
          input: payload,
        });
      } else {
        await createCampaign.mutateAsync(payload);
      }

      onSaved();
    } catch (error) {
      setSubmitError(
        getApiErrorMessage(error, "Não foi possível salvar esta campanha."),
      );
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft md:p-6">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">
            {campaign ? "Editar campanha" : "Nova campanha"}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Configure a campanha em etapas para manter o fluxo simples.
          </p>
        </div>

        <Button type="button" variant="ghost" onClick={onCancel}>
          <X className="h-4 w-4" />
          Cancelar
        </Button>
      </div>

      <div className="mt-5">
        <StepIndicator currentStep={currentStep} />
      </div>

      {submitError ? (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{submitError}</p>
        </div>
      ) : null}

      <div className="mt-5">
        {currentStep === 0 ? (
          <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="mb-5">
              <h3 className="text-xl font-semibold text-slate-950">
                Dados da campanha
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Defina as informações básicas da campanha.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <FormField
                label="Nome"
                error={form.formState.errors.name?.message}
              >
                <Input
                  placeholder="Ex: Campanha B2B Londrina"
                  {...form.register("name")}
                />
              </FormField>

              <FormField
                label="Assunto"
                error={form.formState.errors.subject?.message}
              >
                <Input
                  placeholder="Ex: Uma oportunidade para sua empresa"
                  {...form.register("subject")}
                />
              </FormField>

              <div className="lg:col-span-2">
                <FormField
                  label="Objetivo"
                  error={form.formState.errors.goal?.message}
                >
                  <Textarea
                    className="min-h-[96px] resize-none"
                    placeholder="Ex: Prospecção de empresas de tecnologia no Paraná."
                    {...form.register("goal")}
                  />
                </FormField>
              </div>

              <FormField
                label="Status"
                error={form.formState.errors.status?.message}
              >
                <select
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
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

              <FormField
                label="Agendamento"
                error={form.formState.errors.scheduleAt?.message}
              >
                <Input type="datetime-local" {...form.register("scheduleAt")} />
              </FormField>
            </div>
          </section>
        ) : null}

        {currentStep === 1 ? (
          <section className="space-y-5">
            <section className="rounded-3xl border border-slate-200 bg-white p-5">
              <div className="mb-5">
                <h3 className="text-xl font-semibold text-slate-950">
                  Vínculos da campanha
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Escolha o template e a audience usados na campanha.
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <FormField
                  label="Template"
                  error={form.formState.errors.templateId?.message}
                >
                  <select
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
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

                <FormField
                  label="Audience"
                  error={form.formState.errors.audienceId?.message}
                >
                  <select
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
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
                <Sparkles className="mt-1 h-5 w-5 shrink-0 text-slate-500" />

                <div>
                  <h3 className="text-lg font-semibold text-slate-950">
                    Mapeamento de variáveis
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Confira as variáveis do template e os campos disponíveis da
                    audience.
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

                      <p className="line-clamp-2 text-sm text-slate-500">
                        {selectedTemplate.subject || "Sem assunto informado"}
                      </p>

                      <div className="max-h-[110px] overflow-y-auto pr-1">
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

                      <div className="max-h-[110px] overflow-y-auto pr-1">
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
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-slate-400">
                      Selecione uma audience para visualizar os campos.
                    </p>
                  )}
                </div>
              </div>
              {templateVariables.length > 0 ? (
                <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
                  <div>
                    <h4 className="font-semibold text-slate-950">
                      De/para das variáveis
                    </h4>

                    <p className="mt-1 text-sm text-slate-500">
                      Relacione cada variável do template com um campo
                      disponível na audience.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {templateVariables.map((variable) => {
                      const currentValue =
                        templateVariableMappings[variable] ?? "";

                      return (
                        <div
                          key={variable}
                          className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[220px_48px_minmax(0,1fr)]"
                        >
                          <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                              Variável
                            </p>

                            <div className="flex h-11 items-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900">
                              {`{{${variable}}}`}
                            </div>
                          </div>

                          <div className="flex items-center justify-center md:pt-7">
                            <ArrowDown className="h-4 w-4 text-slate-400 md:hidden" />
                            <ArrowRight className="hidden h-4 w-4 text-slate-400 md:block" />
                          </div>

                          <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                              Campo da audience
                            </p>

                            <select
                              value={currentValue}
                              onChange={(event) =>
                                handleMappingChange(
                                  variable,
                                  event.target.value,
                                )
                              }
                              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                            >
                              <option value="">Selecione um campo</option>

                              {audienceFields.map((field) => (
                                <option key={field} value={field}>
                                  {field}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </section>
          </section>
        ) : null}

        {currentStep === 2 ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-5">
            <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-950">
                  Conferência final
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Revise os principais dados antes de salvar a campanha.
                </p>
              </div>

              <Badge className="w-fit bg-slate-50 text-slate-600">
                {getStatusLabel(watchedStatus)}
              </Badge>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-5">
                <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Campanha
                  </p>

                  <h4 className="mt-2 text-lg font-semibold text-slate-950">
                    {watchedName?.trim() || "Nome não informado"}
                  </h4>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {watchedGoal?.trim() || "Sem objetivo informado."}
                  </p>

                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Assunto
                      </p>

                      <p className="mt-1 line-clamp-2 text-sm font-medium text-slate-900">
                        {watchedSubject?.trim() || "Sem assunto informado"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Agendamento
                      </p>

                      <div className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-900">
                        <CalendarClock className="h-4 w-4 text-slate-400" />
                        <span>{formatSchedulePreview(watchedScheduleAt)}</span>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Vínculos
                  </p>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-slate-400" />

                        <p className="text-sm font-semibold text-slate-950">
                          Template
                        </p>
                      </div>

                      <p className="mt-2 text-sm text-slate-700">
                        {selectedTemplate?.name || "Não selecionado"}
                      </p>

                      <p className="mt-1 line-clamp-1 text-xs text-slate-400">
                        {selectedTemplate?.subject || "Sem assunto informado"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-slate-400" />

                        <p className="text-sm font-semibold text-slate-950">
                          Audience
                        </p>
                      </div>

                      <p className="mt-2 text-sm text-slate-700">
                        {selectedAudience?.name || "Não selecionada"}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {selectedAudience
                          ? `Origem: ${selectedAudience.sourceType}`
                          : "Sem origem"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Mapeamento
                    </p>

                    {Object.keys(templateVariableMappings).length > 0 ? (
                      <div className="mt-3 space-y-2">
                        {Object.entries(templateVariableMappings).map(
                          ([variable, field]) => (
                            <div
                              key={variable}
                              className="flex items-center justify-between gap-3 text-sm"
                            >
                              <span className="font-mono font-medium text-slate-900">
                                {"{{" + variable + "}}"}
                              </span>

                              <span className="text-slate-400">→</span>

                              <span className="font-medium text-slate-700">
                                {field}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-slate-400">
                        Nenhum mapeamento configurado.
                      </p>
                    )}
                  </div>
                </section>
              </div>

              <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <h4 className="text-base font-semibold text-slate-950">
                  Pronto para salvar
                </h4>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  A campanha será criada com os dados informados e ficará
                  disponível na listagem para ajustes futuros.
                </p>

                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <span className="text-slate-500">Status</span>
                    <span className="font-medium text-slate-950">
                      {getStatusLabel(watchedStatus)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <span className="text-slate-500">Template</span>
                    <span className="max-w-[160px] truncate font-medium text-slate-950">
                      {selectedTemplate?.name || "—"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Audience</span>
                    <span className="max-w-[160px] truncate font-medium text-slate-950">
                      {selectedAudience?.name || "—"}
                    </span>
                  </div>
                </div>
              </aside>
            </div>
          </section>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {currentStep > 0 ? (
              <Button
                type="button"
                variant="secondary"
                onClick={goToPreviousStep}
                disabled={isPending}
              >
                <ChevronLeft className="h-4 w-4" />
                Voltar
              </Button>
            ) : null}
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isPending}
            >
              Cancelar
            </Button>

            {currentStep < 2 ? (
              <Button type="button" onClick={goToNextStep} disabled={isPending}>
                Próximo
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                disabled={isPending}
                onClick={form.handleSubmit(handleSubmit)}
              >
                <Save className="h-4 w-4" />
                {isPending ? "Salvando..." : "Salvar campanha"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
