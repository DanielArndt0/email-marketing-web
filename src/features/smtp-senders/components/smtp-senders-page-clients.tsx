"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

import { useSmtpSenders } from "../hooks";
import type { SmtpSender } from "../types";
import { SmtpSenderForm } from "./smtp-sender-form";
import { SmtpSenderList } from "./smtp-sender-list";

export function SmtpSendersPageClient() {
  const smtpSendersQuery = useSmtpSenders({
    page: 1,
    pageSize: 20,
  });

  const [isCreating, setIsCreating] = useState(false);
  const [editingSender, setEditingSender] = useState<SmtpSender | null>(null);

  const response = smtpSendersQuery.data;
  const senders = response?.items ?? [];

  const showForm = isCreating || editingSender !== null;

  function handleCreate() {
    setEditingSender(null);
    setIsCreating(true);
  }

  function handleCloseForm() {
    setIsCreating(false);
    setEditingSender(null);
  }

  function handleEdit(sender: SmtpSender) {
    setIsCreating(false);
    setEditingSender(sender);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          eyebrow="Remetentes"
          title="Remetentes SMTP"
          description="Cadastre, gerencie e teste remetentes SMTP que serão usados nas campanhas."
        />

        <Button type="button" onClick={handleCreate}>
          <Plus className="h-4 w-4" />
          Novo remetente
        </Button>
      </div>

      {showForm ? (
        <SmtpSenderForm sender={editingSender} onCancel={handleCloseForm} />
      ) : null}

      <SmtpSenderList
        senders={senders}
        total={response?.total ?? senders.length}
        isLoading={smtpSendersQuery.isLoading}
        isError={smtpSendersQuery.isError}
        onEdit={handleEdit}
      />
    </div>
  );
}
