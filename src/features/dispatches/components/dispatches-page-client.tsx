"use client";

import { useMemo, useState } from "react";

import { PageHeader } from "@/components/layout/page-header";

import { mockMonitoredCampaigns } from "../mock";
import type { DispatchStatus, MonitoredCampaign } from "../types";
import { DispatchDetailsPanel } from "./dispatch-details-panel";
import { DispatchesFilters } from "./dispatches-filters";
import { DispatchesList } from "./dispatches-list";
import { DispatchesMetrics } from "./dispatches-metrics";

type StatusFilter = DispatchStatus | "all";

export function DispatchesPageClient() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [selectedCampaign, setSelectedCampaign] =
    useState<MonitoredCampaign | null>(null);

  const filteredCampaigns = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return mockMonitoredCampaigns.filter((campaign) => {
      const matchesStatus = status === "all" || campaign.status === status;

      const matchesSearch =
        !normalizedSearch ||
        campaign.campaignName.toLowerCase().includes(normalizedSearch) ||
        campaign.subject.toLowerCase().includes(normalizedSearch) ||
        campaign.smtpFromEmail.toLowerCase().includes(normalizedSearch) ||
        campaign.deliveries.some((delivery) =>
          delivery.recipientEmail.toLowerCase().includes(normalizedSearch),
        );

      return matchesStatus && matchesSearch;
    });
  }, [search, status]);

  function handleSelectCampaign(campaign: MonitoredCampaign) {
    setSelectedCampaign(campaign);
  }

  function handleCloseDetails() {
    setSelectedCampaign(null);
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Dispatches"
        title="Envios"
        description="Monitore campanhas em execução, falhas por destinatário, tentativas, fila e retry."
      />

      <DispatchesMetrics campaigns={mockMonitoredCampaigns} />

      <DispatchesFilters
        search={search}
        status={status}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
      />

      {selectedCampaign ? (
        <DispatchDetailsPanel
          campaign={selectedCampaign}
          onClose={handleCloseDetails}
        />
      ) : null}

      <DispatchesList
        campaigns={filteredCampaigns}
        selectedCampaignId={selectedCampaign?.id}
        onSelectCampaign={handleSelectCampaign}
      />
    </div>
  );
}
