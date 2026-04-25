"use client";

import { Database, Eye, Filter, MapPin, Pencil, Trash2 } from "lucide-react";

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

function getSourceTypeDescription(sourceType: Audience["sourceType"]) {
  const descriptions: Record<Audience["sourceType"], string> = {
    "cnpj-api": "Público gerado a partir de filtros da base CNPJ.",
    "csv-import": "Público importado por arquivo CSV.",
    "manual-list": "Público criado a partir de contatos manuais.",
  };

  return descriptions[sourceType] ?? "Origem personalizada.";
}

function getStringFilter(
  filters: Record<string, unknown> | undefined,
  key: string,
) {
  const value = filters?.[key];

  if (typeof value === "string") return value;

  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === "string").join(", ");
  }

  if (typeof value === "number") return String(value);

  return "";
}

function getModeLabel(mode: string) {
  const labels: Record<string, string> = {
    cnae: "CNAE",
    "razao-social": "Razão social",
    socio: "Sócio",
  };

  return labels[mode] ?? mode;
}

function getMainFilter(audience: Audience) {
  const filters = audience.filters ?? {};

  if (audience.sourceType !== "cnpj-api") {
    return "Sem filtros CNPJ API.";
  }

  const mode = getStringFilter(filters, "mode");

  if (mode === "cnae") {
    const cnaes = getStringFilter(filters, "codigosCnae");
    return cnaes ? `CNAEs: ${cnaes}` : "CNAEs não informados";
  }

  if (mode === "razao-social") {
    const razaoSocial = getStringFilter(filters, "razaoSocial");
    return razaoSocial
      ? `Razão social: ${razaoSocial}`
      : "Razão social não informada";
  }

  if (mode === "socio") {
    const nomeSocio = getStringFilter(filters, "nomeSocio");
    return nomeSocio ? `Sócio: ${nomeSocio}` : "Nome do sócio não informado";
  }

  return "Filtros CNPJ API configurados.";
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
      <div className="flex flex-col gap-2 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
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

        <p className="text-xs text-slate-400">
          Públicos reutilizáveis para campanhas
        </p>
      </div>

      <div className="divide-y divide-slate-100">
        {audiences.map((audience) => {
          const filters = audience.filters ?? {};

          const mode = getStringFilter(filters, "mode");
          const uf = getStringFilter(filters, "uf");
          const municipio = getStringFilter(filters, "municipio");
          const page = getStringFilter(filters, "page");
          const limit = getStringFilter(filters, "limit");

          const location = [municipio, uf].filter(Boolean).join("/");
          const mainFilter = getMainFilter(audience);

          return (
            <article
              key={audience.id}
              className="p-5 transition hover:bg-slate-50/70"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-950">
                      {audience.name}
                    </h3>

                    <Badge>{getSourceTypeLabel(audience.sourceType)}</Badge>

                    {mode ? (
                      <Badge className="bg-slate-100 text-slate-600">
                        {getModeLabel(mode)}
                      </Badge>
                    ) : null}
                  </div>

                  {audience.description ? (
                    <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
                      {audience.description}
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-slate-400">
                      Sem descrição informada
                    </p>
                  )}

                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                        <Database className="h-3.5 w-3.5" />
                        Origem
                      </div>

                      <p className="mt-2 text-sm font-medium text-slate-700">
                        {getSourceTypeDescription(audience.sourceType)}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                        <Filter className="h-3.5 w-3.5" />
                        Filtro principal
                      </div>

                      <p className="mt-2 text-sm font-medium text-slate-700">
                        {mainFilter}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                        <MapPin className="h-3.5 w-3.5" />
                        Localização
                      </div>

                      <p className="mt-2 text-sm font-medium text-slate-700">
                        {location || "Sem localização específica"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                    {page ? <span>Página {page}</span> : null}
                    {page && limit ? <span>•</span> : null}
                    {limit ? <span>Limite {limit}</span> : null}
                  </div>
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
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
