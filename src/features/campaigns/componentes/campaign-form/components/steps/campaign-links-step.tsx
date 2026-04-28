import { Sparkles } from "lucide-react";

import { FormField } from "@/components/ui/form-field";

import type { CampaignLinksStepProps } from "../../campaign-form.types";
import { AudienceSummaryCard } from "../mapping/audience-summary-card";
import { TemplateSummaryCard } from "../mapping/template-summary-card";
import { VariableMappingSection } from "../mapping/variable-mapping-section";

export function CampaignLinksStep({
  form,
  templates,
  audiences,
  selectedTemplate,
  selectedAudience,
  templateVariables,
  leadPathOptions,
  templateVariableMappings,
  onMappingSourceChange,
  onMappingPathChange,
  onMappingStaticValueChange,
}: CampaignLinksStepProps) {
  return (
    <section className="space-y-5">
      <section className="rounded-3xl border border-slate-200 bg-white p-5">
        <div className="mb-5">
          <h3 className="text-xl font-semibold text-slate-950">
            Vínculos da campanha
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Escolha o template e a audience usados na campanha.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <FormField
            label="Template"
            error={form.formState.errors.templateId?.message}
          >
            <select
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              {...form.register("templateId")}
            >
              <option value="">Selecione um template</option>

              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            label="Audience"
            error={form.formState.errors.audienceId?.message}
          >
            <select
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              {...form.register("audienceId")}
            >
              <option value="">Selecione uma audience</option>

              {audiences.map((audience) => (
                <option key={audience.id} value={audience.id}>
                  {audience.name}
                </option>
              ))}
            </select>
          </FormField>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-1 h-5 w-5 shrink-0 text-slate-500" />

          <div>
            <h3 className="text-lg font-semibold text-slate-950">
              Mapeamento de variáveis
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Confira as variáveis do template e os paths disponíveis do lead.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <TemplateSummaryCard
            selectedTemplate={selectedTemplate}
            templateVariables={templateVariables}
          />

          <AudienceSummaryCard
            selectedAudience={selectedAudience}
            leadPathOptions={leadPathOptions}
          />
        </div>

        <VariableMappingSection
          templateVariables={templateVariables}
          leadPathOptions={leadPathOptions}
          templateVariableMappings={templateVariableMappings}
          onMappingSourceChange={onMappingSourceChange}
          onMappingPathChange={onMappingPathChange}
          onMappingStaticValueChange={onMappingStaticValueChange}
        />
      </section>
    </section>
  );
}
