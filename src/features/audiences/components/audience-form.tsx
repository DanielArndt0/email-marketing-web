"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save, X } from "lucide-react";
import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { useCreateAudience, useUpdateAudience } from "../hooks";
import {
  audienceFormSchema,
  buildAudienceFilters,
  type AudienceFormValues,
} from "../schemas";
import type {
  Audience,
  AudienceSourceType,
  CnpjApiAudienceMode,
} from "../types";

function getStringFilter(
  filters: Record<string, unknown> | undefined,
  key: string,
) {
  const value = filters?.[key];

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .join(", ");
  }

  return "";
}

function getNumberFilter(
  filters: Record<string, unknown> | undefined,
  key: string,
  fallback: number,
) {
  const value = filters?.[key];

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}

export function AudienceForm({
  audience,
  onCancel,
  onSaved,
}: {
  audience: Audience | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const createAudience = useCreateAudience();
  const updateAudience = useUpdateAudience();

  const isEditing = Boolean(audience);
  const filters = audience?.filters;

  const defaultValues = useMemo<AudienceFormValues>(
    () => ({
      name: audience?.name ?? "",
      description: audience?.description ?? "",
      sourceType: audience?.sourceType ?? "cnpj-api",

      mode: (getStringFilter(filters, "mode") as CnpjApiAudienceMode) || "cnae",
      page: getNumberFilter(filters, "page", 1),
      limit: getNumberFilter(filters, "limit", 50),
      uf: getStringFilter(filters, "uf"),
      municipio: getStringFilter(filters, "municipio"),
      codigosCnae: getStringFilter(filters, "codigosCnae"),
      razaoSocial: getStringFilter(filters, "razaoSocial"),
      nomeSocio: getStringFilter(filters, "nomeSocio"),
    }),
    [audience, filters],
  );

  const form = useForm<AudienceFormValues>({
    resolver: zodResolver(audienceFormSchema),
    defaultValues,
  });

  const sourceType = useWatch({
    control: form.control,
    name: "sourceType",
  });

  const mode = useWatch({
    control: form.control,
    name: "mode",
  });

  async function onSubmit(values: AudienceFormValues) {
    const payload = {
      name: values.name.trim(),
      ...(values.description?.trim()
        ? { description: values.description.trim() }
        : {}),
      sourceType: values.sourceType as AudienceSourceType,
      filters: buildAudienceFilters(values),
    };

    if (audience) {
      await updateAudience.mutateAsync({
        id: audience.id,
        input: payload,
      });
    } else {
      await createAudience.mutateAsync(payload);
    }

    onSaved();
  }

  const isPending = createAudience.isPending || updateAudience.isPending;

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft"
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">
            {isEditing ? "Editar audience" : "Nova audience"}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Configure a origem dos leads e os filtros que serão usados pela
            Control API.
          </p>
        </div>

        <Button type="button" variant="ghost" onClick={onCancel}>
          <X className="h-4 w-4" />
          Cancelar
        </Button>
      </div>

      <div className="space-y-5">
        <div className="grid gap-4 lg:grid-cols-2">
          <FormField label="Nome" error={form.formState.errors.name?.message}>
            <Input
              placeholder="Ex: Empresas de tecnologia em Londrina"
              {...form.register("name")}
            />
          </FormField>

          <FormField
            label="Origem dos leads"
            error={form.formState.errors.sourceType?.message}
          >
            <select
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              {...form.register("sourceType")}
            >
              <option value="cnpj-api">CNPJ API</option>
              <option value="csv-import">CSV import</option>
              <option value="manual-list">Lista manual</option>
            </select>
          </FormField>
        </div>

        <FormField label="Descrição">
          <Textarea
            className="min-h-24"
            placeholder="Ex: Público usado para campanha de prospecção regional."
            {...form.register("description")}
          />
        </FormField>

        {sourceType === "cnpj-api" ? (
          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="mb-5">
              <h3 className="text-base font-semibold text-slate-950">
                Filtros da CNPJ API
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Escolha o modo de busca e informe os campos necessários.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <FormField
                label="Modo"
                error={form.formState.errors.mode?.message}
              >
                <select
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  {...form.register("mode")}
                >
                  <option value="cnae">CNAE</option>
                  <option value="razao-social">Razão social</option>
                  <option value="socio">Sócio</option>
                </select>
              </FormField>

              <FormField label="UF">
                <Input
                  placeholder="PR"
                  maxLength={2}
                  {...form.register("uf")}
                />
              </FormField>

              <FormField label="Município">
                <Input placeholder="Londrina" {...form.register("municipio")} />
              </FormField>

              <FormField label="Página">
                <Input type="number" min={1} {...form.register("page")} />
              </FormField>

              <FormField label="Limite">
                <Input
                  type="number"
                  min={1}
                  max={500}
                  {...form.register("limit")}
                />
              </FormField>

              {mode === "cnae" ? (
                <FormField
                  label="CNAEs"
                  error={form.formState.errors.codigosCnae?.message}
                >
                  <Input
                    placeholder="6201501, 6202300"
                    {...form.register("codigosCnae")}
                  />
                </FormField>
              ) : null}

              {mode === "razao-social" ? (
                <FormField
                  label="Razão social"
                  error={form.formState.errors.razaoSocial?.message}
                >
                  <Input
                    placeholder="Ex: tecnologia"
                    {...form.register("razaoSocial")}
                  />
                </FormField>
              ) : null}

              {mode === "socio" ? (
                <FormField
                  label="Nome do sócio"
                  error={form.formState.errors.nomeSocio?.message}
                >
                  <Input
                    placeholder="Ex: João Silva"
                    {...form.register("nomeSocio")}
                  />
                </FormField>
              ) : null}
            </div>
          </section>
        ) : (
          <section className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
            <h3 className="text-base font-semibold text-slate-950">
              {sourceType === "csv-import" ? "CSV import" : "Lista manual"}
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Esta origem já fica registrada na audience, mas a tela de
              configuração detalhada ainda depende do contrato final da Control
              API para upload CSV ou cadastro manual de contatos.
            </p>
          </section>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            <Save className="h-4 w-4" />
            {isPending ? "Salvando..." : "Salvar audience"}
          </Button>
        </div>
      </div>
    </form>
  );
}
