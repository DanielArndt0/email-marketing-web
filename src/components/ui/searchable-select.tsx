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
        className="flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 text-left text-sm text-slate-950 outline-none transition hover:bg-slate-50 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
      >
        <span className={selectedOption ? "text-slate-950" : "text-slate-400"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <ChevronDown className="h-4 w-4 text-slate-400" />
      </button>

      {open ? (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-soft">
          <div className="border-b border-slate-100 p-2">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={searchPlaceholder}
              className="h-9 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />
          </div>

          <div className="max-h-64 overflow-auto p-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-3 text-sm text-slate-400">
                {emptyMessage}
              </div>
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
                      "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition hover:bg-slate-50",
                      selected
                        ? "font-medium text-slate-950"
                        : "text-slate-600",
                    )}
                  >
                    <span>
                      {option.label}
                      <span className="ml-2 text-xs text-slate-400">
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
