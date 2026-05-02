"use client";

import { useMemo, useState } from "react";

import { PageHeader } from "@/components/layout/page-header";

import { mockDispatches } from "../mock";
import type { DispatchStatus } from "../types";
import { DispatchesFilters } from "./dispatches-filters";
import { DispatchesList } from "./dispatches-list";
import { DispatchesMetrics } from "./dispatches-metrics";

type StatusFilter = DispatchStatus | "all";

export function DispatchesPageClient() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");

  const filteredDispatches = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return mockDispatches.filter((dispatch) => {
      const matchesStatus = status === "all" || dispatch.status === status;

      const matchesSearch =
        !normalizedSearch ||
        dispatch.campaignName.toLowerCase().includes(normalizedSearch) ||
        dispatch.recipientEmail.toLowerCase().includes(normalizedSearch) ||
        dispatch.subject.toLowerCase().includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [search, status]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Dispatches"
        title="Envios"
        description="Monitore envios de e-mail, acompanhe falhas, tentativas, filas e conteúdo renderizado."
      />

      <DispatchesMetrics dispatches={mockDispatches} />

      <DispatchesFilters
        search={search}
        status={status}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
      />

      <DispatchesList dispatches={filteredDispatches} />
    </div>
  );
}
