"use client";

import {
  Building2,
  Database,
  FileSpreadsheet,
  //  Hash,
  Mail,
  MapPin,
  RefreshCcw,
  X,
} from "lucide-react";

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

  if (
    typeof current === "string" ||
    typeof current === "number" ||
    typeof current === "boolean"
  ) {
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

function getMetadata(item: AudiencePreviewItem) {
  const metadata = (item as Record<string, unknown>).metadata;

  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return {};
  }

  return metadata as Record<string, unknown>;
}

function getUnknownValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map(getUnknownValue).filter(Boolean).join(", ");
  }

  try {
    return JSON.stringify(value);
  } catch {
    return "";
  }
}
function getPreviewNumber(
  data: unknown,
  keys: string[],
  fallback: number,
): number {
  if (!data || typeof data !== "object") {
    return fallback;
  }

  const record = data as Record<string, unknown>;

  for (const key of keys) {
    const value = record[key];

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);

      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return fallback;
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

function getStringFilter(audience: Audience, key: string) {
  const value = audience.filters?.[key];

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  return "";
}

function formatColumnLabel(column: string) {
  const labels: Record<string, string> = {
    email: "E-mail",
    externalId: "External ID",
    nome: "Nome",
    name: "Nome",
    empresa: "Empresa",
    company: "Empresa",
    companyName: "Empresa",
    razaoSocial: "Razão social",
    nomeFantasia: "Nome fantasia",
    telefone: "Telefone",
    phone: "Telefone",
    cidade: "Cidade",
    city: "Cidade",
    uf: "UF",
    estado: "Estado",
    state: "Estado",
  };

  return labels[column] ?? column;
}

function getCsvColumns(items: AudiencePreviewItem[]) {
  const columns = new Set<string>();

  columns.add("email");

  if (items.some((item) => getValue(item, ["externalId"]))) {
    columns.add("externalId");
  }

  for (const item of items) {
    const metadata = getMetadata(item);

    for (const key of Object.keys(metadata)) {
      if (key === "email" || key === "externalId" || key === "sourceType") {
        continue;
      }

      columns.add(key);
    }
  }

  return Array.from(columns);
}

function getCsvCellValue(item: AudiencePreviewItem, column: string) {
  if (column === "email") {
    return getValue(item, ["email", "metadata.email"]);
  }

  if (column === "externalId") {
    return getValue(item, ["externalId", "metadata.externalId"]);
  }

  const metadata = getMetadata(item);

  return getUnknownValue(metadata[column]);
}

function PreviewHeader({
  audience,
  onClose,
  onRefresh,
  isFetching,
  description,
}: {
  audience: Audience;
  onClose: () => void;
  onRefresh: () => void;
  isFetching: boolean;
  description: string;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
          Preview
        </p>

        <h2 className="mt-2 text-xl font-semibold text-slate-950">
          {audience.name}
        </h2>

        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onRefresh}
          disabled={isFetching}
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
  );
}

function StatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string | number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>

      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>
  );
}

function CnpjApiAudiencePreview({
  audience,
  items,
  total,
  leadsWithEmail,
}: {
  audience: Audience;
  items: AudiencePreviewItem[];
  total: number;
  leadsWithEmail: number;
}) {
  const firstUf = items[0]
    ? getValue(items[0], ["metadata.uf", "uf", "stateCode"])
    : "";

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-4">
        <StatCard
          label="Leads"
          value={total}
          description="retornados no preview"
        />

        <StatCard
          label="Origem"
          value={getSourceTypeLabel(audience.sourceType)}
          description="source type"
        />

        <StatCard
          label="Com e-mail"
          value={leadsWithEmail}
          description="leads com e-mail disponível"
        />

        <StatCard
          label="UF"
          value={firstUf || "—"}
          description="amostra retornada"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <div className="flex flex-col gap-1 border-b border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-slate-700">
            {total} {total === 1 ? "lead encontrado" : "leads encontrados"}
          </p>

          <p className="text-xs text-slate-400">
            Exibindo dados empresariais normalizados
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-white text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Empresa</th>
                <th className="px-4 py-3 font-semibold">CNPJ</th>
                <th className="px-4 py-3 font-semibold">Localização</th>
                <th className="px-4 py-3 font-semibold">CNAE / Atividade</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">E-mail</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {items.map((item, index) => {
                const tradeName = getValue(item, ["metadata.nomeFantasia"]);
                const companyName = getValue(item, ["metadata.razaoSocial"]);
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
  );
}

function CsvImportAudiencePreview({
  audience,
  items,
  total,
  leadsWithEmail,
}: {
  audience: Audience;
  items: AudiencePreviewItem[];
  total: number;
  leadsWithEmail: number;
}) {
  const columns = getCsvColumns(items);
  const emailColumn = getStringFilter(audience, "emailColumn") || "email";
  const delimiter = getStringFilter(audience, "delimiter") || ",";

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-4">
        <StatCard
          label="Registros"
          value={total}
          description="linhas resolvidas no preview"
        />

        <StatCard
          label="Com e-mail"
          value={leadsWithEmail}
          description={`usando a coluna ${emailColumn}`}
        />

        <StatCard
          label="Colunas"
          value={columns.length}
          description="detectadas no CSV"
        />

        <StatCard
          label="Delimitador"
          value={delimiter}
          description="configurado na audience"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <div className="flex flex-col gap-1 border-b border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-slate-700">
            {total}{" "}
            {total === 1 ? "registro encontrado" : "registros encontrados"}
          </p>

          <p className="text-xs text-slate-400">
            Exibindo colunas dinâmicas do CSV import
          </p>
        </div>

        <div className="overflow-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-white text-xs uppercase tracking-wide text-slate-400">
              <tr>
                {columns.map((column) => (
                  <th key={column} className="px-4 py-3 font-semibold">
                    {formatColumnLabel(column)}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {items.map((item, rowIndex) => (
                <tr
                  key={item.id ?? `${item.email}-${rowIndex}`}
                  className="bg-white transition hover:bg-slate-50/70"
                >
                  {columns.map((column) => {
                    const value = getCsvCellValue(item, column);

                    return (
                      <td
                        key={`${column}-${rowIndex}`}
                        className="max-w-[320px] truncate px-4 py-3 text-slate-700"
                        title={value}
                      >
                        {column === "email" && value ? (
                          <span className="inline-flex items-center gap-2">
                            <Mail className="h-4 w-4 text-slate-400" />
                            {value}
                          </span>
                        ) : (
                          value || "—"
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-start gap-3">
          <FileSpreadsheet className="mt-0.5 h-4 w-4 text-slate-400" />

          <div>
            <p className="text-sm font-medium text-slate-800">
              Preview específico de CSV import
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Este preview não tenta exibir dados empresariais. Ele mostra os
              registros resolvidos a partir do CSV e as colunas disponíveis para
              uso futuro no mapeamento de campanhas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ManualListAudiencePreview({
  audience,
  items,
  total,
  leadsWithEmail,
}: {
  audience: Audience;
  items: AudiencePreviewItem[];
  total: number;
  leadsWithEmail: number;
}) {
  const withExternalId = items.filter((item) =>
    Boolean(getValue(item, ["externalId"])),
  ).length;

  const limit = getStringFilter(audience, "limit") || "—";

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-4">
        <StatCard
          label="Destinatários"
          value={total}
          description="resolvidos no preview"
        />

        <StatCard
          label="Com e-mail"
          value={leadsWithEmail}
          description="destinatários válidos"
        />

        <StatCard
          label="Com external ID"
          value={withExternalId}
          description="identificador externo"
        />

        <StatCard
          label="Limite"
          value={limit}
          description="configurado na audience"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <div className="flex flex-col gap-1 border-b border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-slate-700">
            {total}{" "}
            {total === 1
              ? "destinatário encontrado"
              : "destinatários encontrados"}
          </p>

          <p className="text-xs text-slate-400">
            Exibindo contatos cadastrados manualmente
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-white text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">E-mail</th>
                <th className="px-4 py-3 font-semibold">External ID</th>
                <th className="px-4 py-3 font-semibold">Origem</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {items.map((item, index) => {
                const email = getValue(item, ["email"]);
                const externalId = getValue(item, ["externalId"]);

                return (
                  <tr
                    key={item.id ?? `${email}-${index}`}
                    className="bg-white transition hover:bg-slate-50/70"
                  >
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

                    <td className="px-4 py-4 font-mono text-xs text-slate-600">
                      {externalId || "—"}
                    </td>

                    <td className="px-4 py-4">
                      <Badge className="border-slate-200 bg-slate-50 text-slate-600">
                        {getSourceTypeLabel(audience.sourceType)}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-start gap-3">
          <Database className="mt-0.5 h-4 w-4 text-slate-400" />

          <div>
            <p className="text-sm font-medium text-slate-800">
              Preview específico de lista manual
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Este modo exibe apenas os destinatários informados manualmente e
              seus identificadores externos quando disponíveis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
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
  const total = getPreviewNumber(
    previewQuery.data,
    ["total", "count"],
    items.length,
  );

  const leadsWithEmail = items.filter((item) => {
    const email = getValue(item, ["email", "metadata.email"]);
    return Boolean(email);
  }).length;

  const sourceType = audience.sourceType;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
      <PreviewHeader
        audience={audience}
        onClose={onClose}
        onRefresh={() => previewQuery.refetch()}
        isFetching={previewQuery.isFetching}
        description={
          sourceType === "cnpj-api"
            ? "Visualização empresarial dos leads retornados pela CNPJ API."
            : sourceType === "csv-import"
              ? "Visualização dos registros resolvidos a partir do CSV importado."
              : "Visualização dos destinatários informados manualmente."
        }
      />

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
      ) : sourceType === "cnpj-api" ? (
        <CnpjApiAudiencePreview
          audience={audience}
          items={items}
          total={total}
          leadsWithEmail={leadsWithEmail}
        />
      ) : sourceType === "csv-import" ? (
        <CsvImportAudiencePreview
          audience={audience}
          items={items}
          total={total}
          leadsWithEmail={leadsWithEmail}
        />
      ) : (
        <ManualListAudiencePreview
          audience={audience}
          items={items}
          total={total}
          leadsWithEmail={leadsWithEmail}
        />
      )}
    </section>
  );
}
