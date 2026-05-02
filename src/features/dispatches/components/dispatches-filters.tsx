import { Search } from "lucide-react";

import type { DispatchStatus } from "../types";

type StatusFilter = DispatchStatus | "all";

type DispatchesFiltersProps = {
  search: string;
  status: StatusFilter;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: StatusFilter) => void;
};

const statusOptions: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "queued", label: "Na fila" },
  { value: "processing", label: "Processando" },
  { value: "sent", label: "Enviados" },
  { value: "failed", label: "Falhas" },
  { value: "retrying", label: "Retry" },
  { value: "canceled", label: "Cancelados" },
];

export function DispatchesFilters({
  search,
  status,
  onSearchChange,
  onStatusChange,
}: DispatchesFiltersProps) {
  return (
    <section className="app-card-flat rounded-2xl p-5">
      <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
        <label className="block">
          <span className="app-label text-sm font-medium">Buscar envio</span>

          <div className="relative mt-2">
            <Search className="app-soft pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />

            <input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Campanha, destinatário ou assunto"
              className="app-input-muted h-11 w-full rounded-xl pl-10 pr-3 text-sm"
            />
          </div>
        </label>

        <label className="block">
          <span className="app-label text-sm font-medium">Status</span>

          <select
            value={status}
            onChange={(event) =>
              onStatusChange(event.target.value as StatusFilter)
            }
            className="app-select-muted mt-2"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
