import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { CAMPAIGN_STATUS_OPTIONS } from "../../campaign-form.constants";
import type { CampaignStepProps } from "../../campaign-form.types";

export function CampaignDataStep({ form }: CampaignStepProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
      <div className="mb-5">
        <h3 className="text-xl font-semibold text-slate-950">
          Dados da campanha
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Defina as informações básicas da campanha.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <FormField label="Nome" error={form.formState.errors.name?.message}>
          <Input
            placeholder="Ex: Campanha B2B Londrina"
            {...form.register("name")}
          />
        </FormField>

        <FormField
          label="Assunto"
          error={form.formState.errors.subject?.message}
        >
          <Input
            placeholder="Ex: Uma oportunidade para sua empresa"
            {...form.register("subject")}
          />
        </FormField>

        <div className="lg:col-span-2">
          <FormField
            label="Objetivo"
            error={form.formState.errors.goal?.message}
          >
            <Textarea
              className="min-h-[96px] resize-none"
              placeholder="Ex: Prospecção de empresas de tecnologia no Paraná."
              {...form.register("goal")}
            />
          </FormField>
        </div>

        <FormField label="Status" error={form.formState.errors.status?.message}>
          <select
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            {...form.register("status")}
          >
            {CAMPAIGN_STATUS_OPTIONS.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          label="Agendamento"
          error={form.formState.errors.scheduleAt?.message}
        >
          <Input type="datetime-local" {...form.register("scheduleAt")} />
        </FormField>
      </div>
    </section>
  );
}
