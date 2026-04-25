import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export default function Page() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Campaigns"
        title="Campanhas"
        description="Gestão de campanhas com vínculo de template, audience e preparação para execução futura."
      />

      <EmptyState
        title="Módulo preparado para implementação"
        description="A estrutura já está pronta. O próximo passo é mapear os contratos reais da Control API pelo Swagger e implementar os forms e services."
      />
    </div>
  );
}
