import { PageHeader } from "@/components/layout/page-header";
import { env } from "@/lib/env/client-env";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Configurações"
        title="Configurações básicas"
        description="Informações do ambiente atual do painel."
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="text-lg font-semibold text-slate-950">Control API</h2>
        <p className="mt-2 text-sm text-slate-500">
          A URL base deve ser configurada em <code>.env.local</code>.
        </p>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm">
          NEXT_PUBLIC_API_BASE_URL={env.NEXT_PUBLIC_API_BASE_URL}
        </div>
      </section>
    </div>
  );
}
