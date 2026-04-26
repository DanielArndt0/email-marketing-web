"use client";

import { Eye, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

import { useDeleteAudience } from "../hooks";
import type { Audience } from "../types";

function getSourceTypeLabel(sourceType: Audience["sourceType"]) {
  const labels: Record<Audience["sourceType"], string> = {
    "cnpj-api": "CNPJ API",
    "csv-import": "CSV",
    "manual-list": "Manual",
  };

  return labels[sourceType] ?? sourceType;
}

function getStringFilter(
  filters: Record<string, unknown> | undefined,
  key: string,
) {
  const value = filters?.[key];

  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);

  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === "string").join(", ");
  }

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
    return "Sem filtro específico";
  }

  const mode = getStringFilter(filters, "mode");

  if (mode === "cnae") {
    const cnaes = getStringFilter(filters, "codigosCnae");
    return cnaes ? `CNAEs ${cnaes}` : "CNAEs não informados";
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

  return "Filtros configurados";
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
          const filters = audience.filters ?? {};

          const mode = getStringFilter(filters, "mode");
          const uf = getStringFilter(filters, "uf");
          const municipio = getStringFilter(filters, "municipio");
          const page = getStringFilter(filters, "page");
          const limit = getStringFilter(filters, "limit");

          const location = [municipio, uf].filter(Boolean).join("/");
          const mainFilter = getMainFilter(audience);

          const metadata = [
            mainFilter,
            location || "Sem localização",
            page ? `página ${page}` : null,
            limit ? `limite ${limit}` : null,
          ].filter(Boolean);

          return (
            <article
              key={audience.id}
              className="flex flex-col gap-4 px-6 py-5 transition hover:bg-slate-50/60 lg:flex-row lg:items-start lg:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-slate-950">
                    {audience.name}
                  </h3>

                  <Badge className="bg-slate-50 text-slate-600">
                    {getSourceTypeLabel(audience.sourceType)}
                  </Badge>

                  {mode ? (
                    <Badge className="bg-slate-50 text-slate-600">
                      {getModeLabel(mode)}
                    </Badge>
                  ) : null}
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  {audience.description || "Sem descrição informada"}
                </p>

                <p className="mt-3 text-sm text-slate-500">
                  {metadata.map((item, index) => (
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
