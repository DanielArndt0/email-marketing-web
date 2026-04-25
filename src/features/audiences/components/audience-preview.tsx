"use client";

import { Building2, Mail, MapPin, RefreshCcw, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

import { useAudiencePreview } from "../hooks";
import type { Audience, AudiencePreviewItem } from "../types";

function getNestedValue(item: AudiencePreviewItem, path: string) {
  const parts = path.split(".");
  let current: unknown = item;

  for (const part of parts) {
    if (!current || typeof current !== "object") {
      return undefined;
    }

    current = (current as Record<string, unknown>)[part];
  }

  if (typeof current === "string" || typeof current === "number") {
    return String(current);
  }

  return undefined;
}

function getValue(item: AudiencePreviewItem, paths: string[]) {
  for (const path of paths) {
    const value = getNestedValue(item, path);

    if (value && value.trim()) {
      return value;
    }
  }

  return "";
}

function formatCnpj(value: string) {
  const digits = value.replace(/\D/g, "");

  if (digits.length !== 14) {
    return value || "—";
  }

  return digits.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5",
  );
}

function getSourceTypeLabel(sourceType: Audience["sourceType"]) {
  const labels: Record<Audience["sourceType"], string> = {
    "cnpj-api": "CNPJ API",
    "csv-import": "CSV import",
    "manual-list": "Lista manual",
  };

  return labels[sourceType] ?? sourceType;
}

export function AudiencePreview({
  audience,
  onClose,
}: {
  audience: Audience;
  onClose: () => void;
}) {
  const previewQuery = useAudiencePreview(audience.id);

  const items = previewQuery.data?.items ?? [];
  const total = previewQuery.data?.total ?? items.length;

  const leadsWithEmail = items.filter((item) => {
    const email = getValue(item, ["email", "metadata.email"]);
    return Boolean(email);
  }).length;

  const firstUf = items[0]
    ? getValue(items[0], ["metadata.uf", "uf", "stateCode"])
    : "";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Preview
          </p>

          <h2 className="mt-2 text-xl font-semibold text-slate-950">
            {audience.name}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Visualização dos leads retornados para esta audience.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => previewQuery.refetch()}
            disabled={previewQuery.isFetching}
          >
            <RefreshCcw className="h-4 w-4" />
            Atualizar
          </Button>

          <Button type="button" variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
            Fechar
          </Button>
        </div>
      </div>

      {previewQuery.isLoading ? (
        <EmptyState
          title="Carregando preview..."
          description="Consultando a Control API."
        />
      ) : previewQuery.isError ? (
        <EmptyState
          title="Não foi possível carregar o preview"
          description="Verifique se o endpoint de preview da audience está disponível na Control API."
        />
      ) : items.length === 0 ? (
        <EmptyState
          title="Nenhum lead encontrado"
          description="A audience não retornou contatos para os filtros atuais."
        />
      ) : (
        <div className="space-y-5">
          <div className="grid gap-3 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Leads
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-950">{total}</p>
              <p className="mt-1 text-xs text-slate-500">
                retornados no preview
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Origem
              </p>
              <p className="mt-2 text-base font-semibold text-slate-950">
                {getSourceTypeLabel(audience.sourceType)}
              </p>
              <p className="mt-1 text-xs text-slate-500">source type</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Com e-mail
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-950">
                {leadsWithEmail}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                leads com e-mail disponível
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                UF
              </p>
              <p className="mt-2 text-base font-semibold text-slate-950">
                {firstUf || "—"}
              </p>
              <p className="mt-1 text-xs text-slate-500">amostra retornada</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <div className="flex flex-col gap-1 border-b border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-slate-700">
                {total} {total === 1 ? "lead encontrado" : "leads encontrados"}
              </p>

              <p className="text-xs text-slate-400">
                Exibindo dados normalizados recebidos da Control API
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-white text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Empresa</th>
                    <th className="px-4 py-3 font-semibold">CNPJ</th>
                    <th className="px-4 py-3 font-semibold">Localização</th>
                    <th className="px-4 py-3 font-semibold">
                      CNAE / Atividade
                    </th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">E-mail</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {items.map((item, index) => {
                    const tradeName = getValue(item, ["metadata.nomeFantasia"]);

                    const companyName = getValue(item, [
                      "metadata.razaoSocial",
                    ]);

                    const email = getValue(item, ["email"]);

                    const cnpj = getValue(item, ["externalId"]);

                    const city = getValue(item, ["metadata.municipio"]);

                    const uf = getValue(item, ["metadata.uf"]);

                    const cnaeCode = getValue(item, [
                      "metadata.codigoCnaePrincipal",
                    ]);

                    const cnaeDescription = getValue(item, [
                      "metadata.descricaoCnaePrincipal",
                    ]);

                    const situation = getValue(item, [
                      "metadata.descricaoSituacaoCadastral",
                    ]);

                    const companySize = getValue(item, [
                      "metadata.descricaoPorteEmpresa",
                    ]);

                    return (
                      <tr
                        key={item.id ?? `${cnpj}-${index}`}
                        className="bg-white align-top transition hover:bg-slate-50/70"
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 rounded-xl bg-slate-100 p-2 text-slate-500">
                              <Building2 className="h-4 w-4" />
                            </div>

                            <div className="min-w-0">
                              <p className="font-medium text-slate-950">
                                {tradeName || companyName || "Empresa sem nome"}
                              </p>

                              {companyName ? (
                                <p className="mt-1 max-w-[360px] text-xs leading-5 text-slate-500">
                                  {companyName}
                                </p>
                              ) : null}

                              {companySize ? (
                                <p className="mt-2 text-xs text-slate-400">
                                  {companySize}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 font-mono text-xs text-slate-600">
                          {formatCnpj(cnpj)}
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2 text-slate-700">
                            <MapPin className="h-4 w-4 text-slate-400" />
                            <span>
                              {[city, uf].filter(Boolean).join("/") || "—"}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <p className="font-mono text-xs text-slate-600">
                            {cnaeCode || "—"}
                          </p>

                          {cnaeDescription ? (
                            <p className="mt-1 max-w-[360px] text-xs leading-5 text-slate-500">
                              {cnaeDescription}
                            </p>
                          ) : null}
                        </td>

                        <td className="px-4 py-4">
                          {situation ? (
                            <Badge
                              className={
                                situation.toLowerCase() === "active" ||
                                situation.toLowerCase() === "ativa"
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : "border-slate-200 bg-slate-50 text-slate-600"
                              }
                            >
                              {situation}
                            </Badge>
                          ) : (
                            "—"
                          )}
                        </td>

                        <td className="px-4 py-4">
                          {email ? (
                            <div className="flex items-center gap-2 text-slate-700">
                              <Mail className="h-4 w-4 text-slate-400" />
                              <span>{email}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">
                              Sem e-mail
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
