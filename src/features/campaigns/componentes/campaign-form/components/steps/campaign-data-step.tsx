"use client";

import type { UseFormReturn } from "react-hook-form";

import { Input } from "@/components/ui/input";

import type { CampaignFormValues } from "../../campaign-form.types";

type CampaignDataStepProps = {
  form: UseFormReturn<CampaignFormValues>;
};

export function CampaignDataStep({ form }: CampaignDataStepProps) {
  const errors = form.formState.errors;

  return (
    <section className="app-card-muted rounded-3xl p-5">
      <h2 className="text-lg font-semibold app-heading">Dados da campanha</h2>

      <p className="mt-1 text-sm app-muted">
        Defina as informações básicas da campanha.
      </p>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div>
          <label className="text-sm font-medium app-heading">Nome</label>

          <Input
            {...form.register("name")}
            placeholder="Ex: Campanha B2B Londrina"
            className="mt-2 app-input-surface"
          />

          {errors.name?.message ? (
            <p className="mt-1 text-xs text-red-600 dark:text-red-300">
              {String(errors.name.message)}
            </p>
          ) : null}
        </div>

        <div>
          <label className="text-sm font-medium app-heading">Assunto</label>

          <Input
            {...form.register("subject")}
            placeholder="Ex: Uma oportunidade para sua empresa"
            className="mt-2 app-input-surface"
          />

          {errors.subject?.message ? (
            <p className="mt-1 text-xs text-red-600 dark:text-red-300">
              {String(errors.subject.message)}
            </p>
          ) : null}
        </div>

        <div className="lg:row-span-2">
          <label className="text-sm font-medium app-heading">Objetivo</label>

          <textarea
            {...form.register("goal")}
            placeholder="Ex: Prospecção de empresas de tecnologia no Paraná."
            className="app-input-surface mt-2 min-h-[122px] w-full resize-none rounded-xl px-3 py-3 text-sm outline-none transition focus:ring-2 focus:ring-slate-200 dark:focus:ring-neutral-700"
          />

          {errors.goal?.message ? (
            <p className="mt-1 text-xs text-red-600 dark:text-red-300">
              {String(errors.goal.message)}
            </p>
          ) : null}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium app-heading">Status</label>

            <select
              {...form.register("status")}
              className="app-select-surface mt-2 h-11 w-full rounded-xl px-3 text-sm outline-none transition focus:ring-2 focus:ring-slate-200 dark:focus:ring-neutral-700"
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

            {errors.status?.message ? (
              <p className="mt-1 text-xs text-red-600 dark:text-red-300">
                {String(errors.status.message)}
              </p>
            ) : null}
          </div>

          <div>
            <label className="text-sm font-medium app-heading">
              Agendamento
            </label>

            <Input
              type="datetime-local"
              {...form.register("scheduleAt")}
              className="mt-2 app-input-surface"
            />

            {errors.scheduleAt?.message ? (
              <p className="mt-1 text-xs text-red-600 dark:text-red-300">
                {String(errors.scheduleAt.message)}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
