"use client";

import { Check, ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";

export type SearchableSelectOption = {
  value: string;
  label: string;
};

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Selecione...",
  searchPlaceholder = "Pesquisar...",
  emptyMessage = "Nenhum resultado encontrado.",
}: {
  value?: string;
  onChange: (value: string) => void;
  options: readonly SearchableSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedOption = options.find((option) => option.value === value);

  const filteredOptions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return options;
    }

    return options.filter((option) =>
      `${option.label} ${option.value}`
        .toLowerCase()
        .includes(normalizedSearch),
    );
  }, [options, search]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="app-input-surface flex h-10 w-full items-center justify-between rounded-xl px-3 text-left text-sm"
      >
        <span className={selectedOption ? "app-heading" : "app-soft"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <ChevronDown className="app-soft h-4 w-4" />
      </button>

      {open ? (
        <div className="app-card absolute z-50 mt-2 w-full overflow-hidden rounded-xl">
          <div className="app-list-header p-2">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={searchPlaceholder}
              className="app-input h-9 w-full rounded-lg px-3 text-sm"
            />
          </div>

          <div className="max-h-64 overflow-auto p-1">
            {filteredOptions.length === 0 ? (
              <div className="app-soft px-3 py-3 text-sm">{emptyMessage}</div>
            ) : (
              filteredOptions.map((option) => {
                const selected = option.value === value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition",
                      selected
                        ? "app-heading font-medium"
                        : "app-muted hover:bg-[var(--app-surface-hover)] hover:text-[var(--app-text-strong)]",
                    )}
                  >
                    <span>
                      {option.label}
                      <span className="app-soft ml-2 text-xs">
                        {option.value}
                      </span>
                    </span>

                    {selected ? <Check className="h-4 w-4" /> : null}
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
