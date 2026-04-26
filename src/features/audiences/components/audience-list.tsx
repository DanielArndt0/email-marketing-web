"use client";

import {
  Building2,
  Database,
  Eye,
  FileSpreadsheet,
  Pencil,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

import { useDeleteAudience } from "../hooks";
import type { Audience } from "../types";

function getSourceTypeLabel(sourceType: Audience["sourceType"]) {
  const labels: Record<Audience["sourceType"], string> = {
    "cnpj-api": "CNPJ API",
    "csv-import": "CSV import",
    "manual-list": "Lista manual",
  };

  return labels[sourceType] ?? sourceType;
}

function getSourceTypeIcon(sourceType: Audience["sourceType"]) {
  const icons: Record<Audience["sourceType"], typeof Building2> = {
    "cnpj-api": Building2,
    "csv-import": FileSpreadsheet,
    "manual-list": Database,
  };

  return icons[sourceType] ?? Database;
}

function getStringFilter(
  filters: Record<string, unknown> | undefined,
  key: string,
) {
  const value = filters?.[key];

  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);

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
) {
  const value = filters?.[key];

  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim()) return Number(value);

  return undefined;
}

function getModeLabel(mode: string) {
  const labels: Record<string, string> = {
    cnae: "CNAE",
    "razao-social": "Razão social",
    socio: "Sócio",
  };

  return labels[mode] ?? mode;
}

function parseCsvLine(line: string, delimiter: string) {
  const values: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"' && insideQuotes && nextChar === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === delimiter && !insideQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());

  return values;
}

function getCsvInfo(filters: Record<string, unknown> | undefined) {
  const csvContent = getStringFilter(filters, "csvContent");
  const delimiter = getStringFilter(filters, "delimiter") || ",";

  const lines = csvContent
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return {
      columns: 0,
      rows: 0,
    };
  }

  const headers = parseCsvLine(lines[0], delimiter);

  return {
    columns: headers.filter(Boolean).length,
    rows: Math.max(lines.length - 1, 0),
  };
}

function getManualRecipients(filters: Record<string, unknown> | undefined) {
  const recipients = filters?.recipients;

  if (!Array.isArray(recipients)) {
    return [];
  }

  return recipients.filter(
    (recipient) => recipient && typeof recipient === "object",
  ) as Record<string, unknown>[];
}

function getAudienceBadges(audience: Audience) {
  const filters = audience.filters ?? {};
  const badges = [getSourceTypeLabel(audience.sourceType)];

  if (audience.sourceType === "cnpj-api") {
    const mode = getStringFilter(filters, "mode");

    if (mode) {
      badges.push(getModeLabel(mode));
    }
  }

  return badges;
}

function getAudienceSummary(audience: Audience) {
  const filters = audience.filters ?? {};
  const limit = getNumberFilter(filters, "limit");

  if (audience.sourceType === "cnpj-api") {
    const mode = getStringFilter(filters, "mode");
    const uf = getStringFilter(filters, "uf");
    const municipio = getStringFilter(filters, "municipio");
    const page = getNumberFilter(filters, "page");

    const location = [municipio, uf].filter(Boolean).join("/");

    if (mode === "cnae") {
      const cnaes = getStringFilter(filters, "codigosCnae");

      return [
        cnaes ? `CNAEs ${cnaes}` : "CNAEs não informados",
        location || "Sem localização",
        page ? `página ${page}` : null,
        limit ? `limite ${limit}` : null,
      ].filter(Boolean);
    }

    if (mode === "razao-social") {
      const razaoSocial = getStringFilter(filters, "razaoSocial");

      return [
        razaoSocial
          ? `Razão social: ${razaoSocial}`
          : "Razão social não informada",
        location || "Sem localização",
        page ? `página ${page}` : null,
        limit ? `limite ${limit}` : null,
      ].filter(Boolean);
    }

    if (mode === "socio") {
      const nomeSocio = getStringFilter(filters, "nomeSocio");

      return [
        nomeSocio ? `Sócio: ${nomeSocio}` : "Sócio não informado",
        location || "Sem localização",
        page ? `página ${page}` : null,
        limit ? `limite ${limit}` : null,
      ].filter(Boolean);
    }

    return [
      "Filtros da CNPJ API configurados",
      location || "Sem localização",
      limit ? `limite ${limit}` : null,
    ].filter(Boolean);
  }

  if (audience.sourceType === "csv-import") {
    const emailColumn = getStringFilter(filters, "emailColumn") || "email";
    const delimiter = getStringFilter(filters, "delimiter") || ",";
    const csvInfo = getCsvInfo(filters);

    return [
      `coluna de e-mail: ${emailColumn}`,
      `delimitador: ${delimiter}`,
      `${csvInfo.columns} ${csvInfo.columns === 1 ? "coluna" : "colunas"}`,
      `${csvInfo.rows} ${csvInfo.rows === 1 ? "linha" : "linhas"}`,
      limit ? `limite ${limit}` : null,
    ].filter(Boolean);
  }

  const recipients = getManualRecipients(filters);
  const withExternalId = recipients.filter(
    (recipient) =>
      typeof recipient.externalId === "string" && recipient.externalId.trim(),
  ).length;

  return [
    `${recipients.length} ${
      recipients.length === 1 ? "destinatário" : "destinatários"
    }`,
    `${withExternalId} com externalId`,
    limit ? `limite ${limit}` : null,
  ].filter(Boolean);
}

function getAudienceDescription(audience: Audience) {
  if (audience.description?.trim()) {
    return audience.description;
  }

  if (audience.sourceType === "cnpj-api") {
    return "Público gerado a partir de filtros da CNPJ API.";
  }

  if (audience.sourceType === "csv-import") {
    return "Público gerado a partir de um conteúdo CSV importado.";
  }

  return "Público gerado a partir de uma lista manual de destinatários.";
}

export function AudienceList({
  audiences,
  onPreview,
  onEdit,
}: {
  audiences: Audience[];
  onPreview: (audience: Audience) => void;
  onEdit: (audience: Audience) => void;
}) {
  const deleteAudience = useDeleteAudience();

  if (audiences.length === 0) {
    return (
      <EmptyState
        title="Nenhuma audience cadastrada"
        description="Crie sua primeira audience para começar a montar campanhas."
      />
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-soft">
      <div className="border-b border-slate-200 px-6 py-5">
        <h2 className="text-lg font-semibold text-slate-950">
          Audiences cadastradas
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {audiences.length}{" "}
          {audiences.length === 1
            ? "audience cadastrada"
            : "audiences cadastradas"}
        </p>
      </div>

      <div className="divide-y divide-slate-100">
        {audiences.map((audience) => {
          const SourceIcon = getSourceTypeIcon(audience.sourceType);
          const badges = getAudienceBadges(audience);
          const summary = getAudienceSummary(audience);

          return (
            <article
              key={audience.id}
              className="flex flex-col gap-4 px-6 py-5 transition hover:bg-slate-50/60 lg:flex-row lg:items-start lg:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="mr-1 rounded-xl bg-slate-100 p-2 text-slate-500">
                    <SourceIcon className="h-4 w-4" />
                  </div>

                  <h3 className="font-semibold text-slate-950">
                    {audience.name}
                  </h3>

                  {badges.map((badge) => (
                    <Badge key={badge} className="bg-slate-50 text-slate-600">
                      {badge}
                    </Badge>
                  ))}
                </div>

                <p className="mt-2 text-sm text-slate-500">
                  {getAudienceDescription(audience)}
                </p>

                <p className="mt-3 flex flex-wrap items-center gap-y-1 text-sm text-slate-500">
                  {summary.map((item, index) => (
                    <span key={item}>
                      {index > 0 ? (
                        <span className="mx-2 text-slate-300">•</span>
                      ) : null}
                      <span>{item}</span>
                    </span>
                  ))}
                </p>
              </div>

              <div className="flex shrink-0 gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => onPreview(audience)}
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => onEdit(audience)}
                >
                  <Pencil className="h-4 w-4" />
                  Editar
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteAudience.mutate(audience.id)}
                  disabled={deleteAudience.isPending}
                  title="Excluir audience"
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
