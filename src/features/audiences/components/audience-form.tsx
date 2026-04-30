"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Code2, Plus, Save, Table2, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Textarea } from "@/components/ui/textarea";
import { brazilStates } from "@/lib/brazil/states";

import { useCreateAudience, useUpdateAudience } from "../hooks";
import {
  audienceFormSchema,
  parseCnaeCodes,
  type AudienceFormValues,
} from "../schemas";
import type { Audience } from "../types";

type AudienceWithDescription = Audience & {
  description?: string | null;
};

type AudienceFormProps = {
  audience?: AudienceWithDescription | null;
  onCancel: () => void;
  onSaved: () => void;
};

type ManualRow = Record<string, string>;

function getStringValue(value: unknown): string {
  if (typeof value === "string") return value;

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return "";
}

function getNumberValue(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) return parsed;
  }

  return fallback;
}

function normalizeColumnName(value: string): string {
  return value.trim().replace(/\s+/g, "_").replace(/[^\w]/g, "");
}

function hasColumn(columns: string[], column: string): boolean {
  return columns.some((item) => item.toLowerCase() === column.toLowerCase());
}

function parseCsvLine(line: string, delimiter: string): string[] {
  const values: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"' && insideQuotes && nextChar === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === delimiter && !insideQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());

  return values;
}

function parseCsvContent(
  content: string,
  delimiter: string,
): {
  headers: string[];
  rows: string[][];
} {
  const normalized = content
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (normalized.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = parseCsvLine(normalized[0], delimiter);
  const rows = normalized.slice(1).map((line) => parseCsvLine(line, delimiter));

  return { headers, rows };
}

function extractManualState(audience?: AudienceWithDescription | null): {
  columns: string[];
  rows: ManualRow[];
  limit: number;
} {
  const filters = audience?.filters ?? {};
  const recipientsRaw = (filters as Record<string, unknown>).recipients;
  const limit = getNumberValue((filters as Record<string, unknown>).limit, 50);

  if (!Array.isArray(recipientsRaw) || recipientsRaw.length === 0) {
    return {
      columns: ["email"],
      rows: [{ email: "" }],
      limit,
    };
  }

  const recipients = recipientsRaw.filter(
    (item): item is Record<string, unknown> =>
      !!item && typeof item === "object" && !Array.isArray(item),
  );

  const allColumns = new Set<string>(["email"]);

  recipients.forEach((recipient) => {
    Object.keys(recipient).forEach((key) => {
      const normalized = normalizeColumnName(key);

      if (normalized) {
        allColumns.add(normalized);
      }
    });
  });

  const columns = Array.from(allColumns);

  const rows: ManualRow[] = recipients.map((recipient) => {
    const row: ManualRow = {};

    columns.forEach((column) => {
      row[column] = getStringValue(recipient[column]);
    });

    return row;
  });

  return {
    columns,
    rows: rows.length > 0 ? rows : [{ email: "" }],
    limit,
  };
}

function buildManualRecipients(
  columns: string[],
  rows: ManualRow[],
): Record<string, string>[] {
  return rows
    .map((row) => {
      const entry: Record<string, string> = {};

      columns.forEach((column) => {
        const value = (row[column] ?? "").trim();

        if (value) {
          entry[column] = value;
        }
      });

      return entry;
    })
    .filter((entry) => typeof entry.email === "string" && entry.email.trim());
}

function getDefaultFormValues(
  audience?: AudienceWithDescription | null,
): AudienceFormValues {
  const filters = audience?.filters ?? {};
  const sourceType =
    audience?.sourceType ?? ("cnpj-api" as AudienceFormValues["sourceType"]);

  const modeValue = getStringValue((filters as Record<string, unknown>).mode);

  return {
    name: audience?.name ?? "",
    description: audience?.description ?? "",
    sourceType,
    mode:
      modeValue === "razao-social"
        ? "razao-social"
        : modeValue === "socio"
          ? "socio"
          : "cnae",
    page: getNumberValue((filters as Record<string, unknown>).page, 1),
    limit: getNumberValue((filters as Record<string, unknown>).limit, 50),
    uf: getStringValue((filters as Record<string, unknown>).uf),
    municipio: getStringValue((filters as Record<string, unknown>).municipio),
    codigosCnae: Array.isArray((filters as Record<string, unknown>).codigosCnae)
      ? ((filters as Record<string, unknown>).codigosCnae as unknown[])
          .map((item) => getStringValue(item))
          .filter(Boolean)
          .join(", ")
      : getStringValue((filters as Record<string, unknown>).codigosCnae),
    razaoSocial: getStringValue(
      (filters as Record<string, unknown>).razaoSocial,
    ),
    nomeSocio: getStringValue((filters as Record<string, unknown>).nomeSocio),
    csvContent: getStringValue((filters as Record<string, unknown>).csvContent),
    emailColumn:
      getStringValue((filters as Record<string, unknown>).emailColumn) ||
      "email",
    delimiter:
      getStringValue((filters as Record<string, unknown>).delimiter) || ",",
    manualRecipients: "",
  };
}

function buildFilters(
  values: AudienceFormValues,
  manualColumns: string[],
  manualRows: ManualRow[],
): Record<string, unknown> {
  if (values.sourceType === "cnpj-api") {
    return {
      mode: values.mode,
      page: values.page ?? 1,
      limit: values.limit ?? 50,
      ...(values.uf?.trim() ? { uf: values.uf.trim().toUpperCase() } : {}),
      ...(values.municipio?.trim()
        ? { municipio: values.municipio.trim() }
        : {}),
      ...(values.mode === "cnae"
        ? { codigosCnae: parseCnaeCodes(values.codigosCnae) }
        : {}),
      ...(values.mode === "razao-social" && values.razaoSocial?.trim()
        ? { razaoSocial: values.razaoSocial.trim() }
        : {}),
      ...(values.mode === "socio" && values.nomeSocio?.trim()
        ? { nomeSocio: values.nomeSocio.trim() }
        : {}),
    };
  }

  if (values.sourceType === "csv-import") {
    return {
      csvContent: values.csvContent?.trim() ?? "",
      emailColumn: values.emailColumn?.trim() || "email",
      delimiter: values.delimiter?.trim() || ",",
      limit: values.limit ?? 50,
    };
  }

  return {
    columns: manualColumns,
    recipients: buildManualRecipients(manualColumns, manualRows),
    limit: values.limit ?? 50,
  };
}

export function AudienceForm({
  audience,
  onCancel,
  onSaved,
}: AudienceFormProps) {
  const createAudience = useCreateAudience();
  const updateAudience = useUpdateAudience();

  const form = useForm<AudienceFormValues>({
    resolver: zodResolver(audienceFormSchema),
    defaultValues: getDefaultFormValues(audience),
  });

  const [csvView, setCsvView] = useState<"code" | "table">("code");
  const [newColumnName, setNewColumnName] = useState("");
  const [manualColumns, setManualColumns] = useState<string[]>(["email"]);
  const [manualRows, setManualRows] = useState<ManualRow[]>([{ email: "" }]);

  useEffect(() => {
    form.reset(getDefaultFormValues(audience));

    const manualState = extractManualState(audience);
    setManualColumns(manualState.columns);
    setManualRows(manualState.rows);
    setCsvView("code");
    setNewColumnName("");
  }, [audience, form]);

  const sourceType = form.watch("sourceType");
  const mode = form.watch("mode");
  const csvContent = form.watch("csvContent") ?? "";
  const delimiter = form.watch("delimiter") || ",";

  useEffect(() => {
    if (sourceType !== "manual-list") return;

    const recipients = buildManualRecipients(manualColumns, manualRows);

    form.setValue(
      "manualRecipients",
      recipients.length > 0 ? JSON.stringify(recipients) : "",
      {
        shouldDirty: true,
        shouldValidate: false,
      },
    );
  }, [form, manualColumns, manualRows, sourceType]);

  const csvPreview = useMemo(
    () => parseCsvContent(csvContent, delimiter),
    [csvContent, delimiter],
  );

  const isPending = createAudience.isPending || updateAudience.isPending;

  function addManualColumn(): void {
    const normalized = normalizeColumnName(newColumnName);

    if (!normalized) return;
    if (hasColumn(manualColumns, normalized)) return;

    setManualColumns((current) => [...current, normalized]);
    setManualRows((current) =>
      current.map((row) => ({
        ...row,
        [normalized]: "",
      })),
    );
    setNewColumnName("");
  }

  function renameManualColumn(previous: string, next: string): void {
    const normalized = normalizeColumnName(next);

    if (!normalized) return;
    if (previous.toLowerCase() === "email") return;
    if (normalized.toLowerCase() === "email") return;

    const exists = manualColumns.some(
      (column) =>
        column.toLowerCase() === normalized.toLowerCase() &&
        column.toLowerCase() !== previous.toLowerCase(),
    );

    if (exists) return;

    setManualColumns((current) =>
      current.map((column) => (column === previous ? normalized : column)),
    );

    setManualRows((current) =>
      current.map((row) => {
        const nextRow: ManualRow = { ...row };

        nextRow[normalized] = nextRow[previous] ?? "";
        delete nextRow[previous];

        return nextRow;
      }),
    );
  }

  function removeManualColumn(column: string): void {
    if (column.toLowerCase() === "email") return;

    setManualColumns((current) => current.filter((item) => item !== column));
    setManualRows((current) =>
      current.map((row) => {
        const nextRow = { ...row };
        delete nextRow[column];
        return nextRow;
      }),
    );
  }

  function addManualRow(): void {
    const nextRow: ManualRow = {};

    manualColumns.forEach((column) => {
      nextRow[column] = "";
    });

    setManualRows((current) => [...current, nextRow]);
  }

  function removeManualRow(index: number): void {
    setManualRows((current) => {
      if (current.length <= 1) {
        return [{ email: "" }];
      }

      return current.filter((_, rowIndex) => rowIndex !== index);
    });
  }

  function updateManualCell(
    rowIndex: number,
    column: string,
    value: string,
  ): void {
    setManualRows((current) =>
      current.map((row, index) =>
        index === rowIndex
          ? {
              ...row,
              [column]: value,
            }
          : row,
      ),
    );
  }

  async function handleSubmit(values: AudienceFormValues): Promise<void> {
    if (values.sourceType === "csv-import" && !values.csvContent?.trim()) {
      form.setError("csvContent", {
        type: "custom",
        message: "Cole o conteúdo do CSV ou selecione um arquivo.",
      });
      return;
    }

    if (values.sourceType === "manual-list") {
      const recipients = buildManualRecipients(manualColumns, manualRows);

      if (recipients.length === 0) {
        form.setError("manualRecipients", {
          type: "custom",
          message: "Adicione pelo menos 1 linha com e-mail preenchido.",
        });
        return;
      }
    }

    const payload = {
      name: values.name.trim(),
      description: values.description?.trim() || undefined,
      sourceType: values.sourceType,
      filters: buildFilters(values, manualColumns, manualRows),
    };

    try {
      if (audience?.id) {
        await updateAudience.mutateAsync({
          id: audience.id,
          input: payload,
        });
      } else {
        await createAudience.mutateAsync(payload);
      }

      onSaved();
    } catch {
      // o tratamento visual do erro pode continuar no hook / toast global
    }
  }

  async function handleCsvFileChange(
    event: ChangeEvent<HTMLInputElement>,
  ): Promise<void> {
    const file = event.target.files?.[0];

    if (!file) return;

    const text = await file.text();

    form.setValue("csvContent", text, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft md:p-6">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">
            {audience ? "Editar audience" : "Nova audience"}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Configure a origem dos leads e os filtros que serão usados pela
            Control API.
          </p>
        </div>

        <Button type="button" variant="ghost" onClick={onCancel}>
          <X className="h-4 w-4" />
          Cancelar
        </Button>
      </div>

      <form className="mt-6" onSubmit={form.handleSubmit(handleSubmit)}>
        <input type="hidden" {...form.register("manualRecipients")} />

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="text-xl font-semibold text-slate-950">
                Dados da audience
              </h3>

              <p className="mt-2 text-sm leading-7 text-slate-500">
                Defina o nome, a origem e uma descrição para identificar este
                público.
              </p>

              <div className="mt-6 space-y-5">
                <FormField
                  label="Nome"
                  error={form.formState.errors.name?.message}
                >
                  <Input
                    className="app-input-surface"
                    placeholder="Ex: Empresas de tecnologia em Londrina"
                    {...form.register("name")}
                  />
                </FormField>

                <FormField
                  label="Origem dos leads"
                  error={form.formState.errors.sourceType?.message}
                >
                  <select
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    {...form.register("sourceType")}
                  >
                    <option value="cnpj-api">CNPJ API</option>
                    <option value="csv-import">CSV import</option>
                    <option value="manual-list"></option>
                  </select>
                </FormField>

                <FormField label="Descrição">
                  <Textarea
                    placeholder="Ex: Público usado para campanha de prospecção regional."
                    className="min-h-[126px] max-h-[220px] resize-none overflow-auto app-input-surface"
                    {...form.register("description")}
                  />
                </FormField>
              </div>
            </div>
          </aside>

          <div className="min-w-0">
            {sourceType === "cnpj-api" ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-5">
                <div>
                  <h3 className="text-2xl font-semibold text-slate-950">
                    Filtros da CNPJ API
                  </h3>

                  <p className="mt-2 text-sm leading-7 text-slate-500">
                    Escolha o modo de busca e informe os campos necessários para
                    resolver os leads a partir da CNPJ API.
                  </p>
                </div>

                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <FormField
                      label="Modo"
                      error={form.formState.errors.mode?.message}
                    >
                      <select
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                        {...form.register("mode")}
                      >
                        <option value="cnae">CNAE</option>
                        <option value="razao-social">Razão social</option>
                        <option value="socio">Sócio</option>
                      </select>
                    </FormField>

                    <FormField label="UF">
                      <SearchableSelect
                        value={form.watch("uf")}
                        options={[...brazilStates]}
                        placeholder="Selecione a UF"
                        searchPlaceholder="Pesquisar estado..."
                        emptyMessage="Nenhum estado encontrado."
                        onChange={(value) => {
                          form.setValue("uf", value, {
                            shouldDirty: true,
                            shouldValidate: true,
                          });

                          form.setValue("municipio", "", {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                        }}
                      />
                    </FormField>

                    <FormField label="Município">
                      <Input
                        className="app-input-surface"
                        placeholder="Londrina"
                        {...form.register("municipio")}
                      />
                    </FormField>

                    <FormField label="Página">
                      <Input
                        className="app-input-surface"
                        type="number"
                        min={1}
                        {...form.register("page")}
                      />
                    </FormField>

                    <FormField label="Limite">
                      <Input
                        className="app-input-surface"
                        type="number"
                        min={1}
                        max={500}
                        {...form.register("limit")}
                      />
                    </FormField>

                    {mode === "cnae" ? (
                      <FormField
                        label="CNAEs"
                        error={form.formState.errors.codigosCnae?.message}
                      >
                        <Input
                          className="app-input-surface"
                          placeholder="6201501, 6202300"
                          {...form.register("codigosCnae")}
                        />
                      </FormField>
                    ) : null}

                    {mode === "razao-social" ? (
                      <FormField
                        label="Razão social"
                        error={form.formState.errors.razaoSocial?.message}
                      >
                        <Input
                          className="app-input-surface"
                          placeholder="Ex: tecnologia"
                          {...form.register("razaoSocial")}
                        />
                      </FormField>
                    ) : null}

                    {mode === "socio" ? (
                      <FormField
                        label="Nome do sócio"
                        error={form.formState.errors.nomeSocio?.message}
                      >
                        <Input
                          className="app-input-surface"
                          placeholder="Ex: João Silva"
                          {...form.register("nomeSocio")}
                        />
                      </FormField>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}

            {sourceType === "csv-import" ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-2xl font-semibold text-slate-950">
                      Importação por CSV
                    </h3>

                    <p className="mt-2 text-sm leading-7 text-slate-500">
                      Configure a leitura do arquivo e confira o conteúdo em
                      código ou em tabela.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 rounded-2xl bg-slate-100 p-1">
                    <button
                      type="button"
                      onClick={() => setCsvView("code")}
                      className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-medium transition ${
                        csvView === "code"
                          ? "bg-neutral-800 text-white"
                          : "text-slate-600 hover:bg-white"
                      }`}
                    >
                      <Code2 className="h-4 w-4" />
                      Código
                    </button>

                    <button
                      type="button"
                      onClick={() => setCsvView("table")}
                      className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-medium transition ${
                        csvView === "table"
                          ? "bg-neutral-800 text-white"
                          : "text-slate-600 hover:bg-white"
                      }`}
                    >
                      <Table2 className="h-4 w-4" />
                      Tabela
                    </button>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl app-card-muted p-4">
                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(180px,1fr)_140px_120px]">
                    <FormField label="Arquivo CSV">
                      <Input
                        type="file"
                        accept=".csv,text/csv"
                        className="h-auto py-2 app-input-surface file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium"
                        onChange={handleCsvFileChange}
                      />
                    </FormField>

                    <FormField
                      label="Coluna de e-mail"
                      error={form.formState.errors.emailColumn?.message}
                    >
                      <Input
                        className="app-input-surface"
                        placeholder="email"
                        {...form.register("emailColumn")}
                      />
                    </FormField>

                    <FormField label="Delimitador">
                      <Input
                        className="app-input-surface"
                        placeholder=","
                        {...form.register("delimiter")}
                      />
                    </FormField>

                    <FormField label="Limite">
                      <Input
                        className="app-input-surface"
                        type="number"
                        min={1}
                        max={500}
                        {...form.register("limit")}
                      />
                    </FormField>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl app-card-muted p-4">
                  <div className="mb-4">
                    <h4 className="text-lg font-semibold text-slate-950">
                      Conteúdo do CSV
                    </h4>

                    <p className="mt-1 text-sm text-slate-500">
                      O conteúdo abaixo será enviado em{" "}
                      <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs">
                        filters.csvContent
                      </code>
                      .
                    </p>
                  </div>

                  {csvView === "code" ? (
                    <FormField
                      label="CSV"
                      error={form.formState.errors.csvContent?.message}
                    >
                      <Textarea
                        className="app-input-surface min-h-[260px] max-h-[520px] resize-none overflow-auto font-mono text-[14px] leading-7"
                        placeholder={`email,nome,empresa\ncontato@empresa.com,João,Empresa A`}
                        {...form.register("csvContent")}
                      />
                    </FormField>
                  ) : (
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                      {csvPreview.headers.length > 0 ? (
                        <div className="overflow-auto">
                          <table className="min-w-full text-sm">
                            <thead className="bg-slate-50">
                              <tr>
                                {csvPreview.headers.map((header, index) => (
                                  <th
                                    key={`${header}-${index}`}
                                    className="whitespace-nowrap border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-700"
                                  >
                                    {header || `Coluna ${index + 1}`}
                                  </th>
                                ))}
                              </tr>
                            </thead>

                            <tbody>
                              {csvPreview.rows.length > 0 ? (
                                csvPreview.rows.map((row, rowIndex) => (
                                  <tr
                                    key={rowIndex}
                                    className="border-b border-slate-100"
                                  >
                                    {csvPreview.headers.map((_, colIndex) => (
                                      <td
                                        key={`${rowIndex}-${colIndex}`}
                                        className="whitespace-nowrap px-4 py-3 text-slate-600"
                                      >
                                        {row[colIndex] ?? ""}
                                      </td>
                                    ))}
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td
                                    colSpan={Math.max(
                                      csvPreview.headers.length,
                                      1,
                                    )}
                                    className="px-4 py-8 text-center text-slate-500"
                                  >
                                    Cole ou selecione um CSV com pelo menos uma
                                    linha de dados.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="flex min-h-[260px] items-center justify-center px-6 py-10 text-center text-sm text-slate-500">
                          Cole ou selecione um CSV para visualizar a tabela.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {sourceType === "manual-list" ? (
              <div className="rounded-3xl app-card-muted p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-2xl font-semibold text-slate-950">
                      Lista manual
                    </h3>

                    <p className="mt-2 text-sm leading-7 text-slate-500">
                      Monte uma tabela de destinatários com uma coluna mínima
                      obrigatória: <strong>email</strong>. Você também pode
                      criar variáveis extras para uso futuro em campanhas.
                    </p>
                  </div>

                  <div className="w-full md:w-[140px]">
                    <FormField label="Limite">
                      <Input
                        type="number"
                        min={1}
                        max={500}
                        {...form.register("limit")}
                      />
                    </FormField>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl app-card-flat p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div className="w-full lg:max-w-md">
                      <FormField label="Nova variável / coluna">
                        <div className="flex gap-2">
                          <Input
                            className="app-input-muted"
                            value={newColumnName}
                            onChange={(event) =>
                              setNewColumnName(event.target.value)
                            }
                            placeholder="Ex: company, city, externalId"
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                                addManualColumn();
                              }
                            }}
                          />

                          <Button
                            type="button"
                            variant="secondary"
                            onClick={addManualColumn}
                          >
                            <Plus className="h-4 w-4" />
                            Coluna
                          </Button>
                        </div>
                      </FormField>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={addManualRow}
                      >
                        <Plus className="h-4 w-4" />
                        Adicionar linha
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <div className="overflow-auto">
                      <table className="w-full min-w-[760px] text-sm">
                        <thead className="bg-slate-50">
                          <tr>
                            {manualColumns.map((column) => (
                              <th
                                key={column}
                                className="border-b border-slate-200 px-3 py-3 text-left align-top"
                              >
                                {column.toLowerCase() === "email" ? (
                                  <div className="space-y-1">
                                    <p className="font-semibold text-slate-900">
                                      email
                                    </p>

                                    <p className="text-xs text-slate-500">
                                      obrigatório
                                    </p>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <Input
                                      value={column}
                                      onChange={(event) =>
                                        renameManualColumn(
                                          column,
                                          event.target.value,
                                        )
                                      }
                                      className="min-w-[150px] app-input-surface"
                                    />

                                    <button
                                      type="button"
                                      onClick={() => removeManualColumn(column)}
                                      className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                                      title="Remover coluna"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                )}
                              </th>
                            ))}

                            <th className="border-b border-slate-200 px-3 py-3 text-left font-semibold text-slate-700">
                              Ações
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {manualRows.map((row, rowIndex) => (
                            <tr
                              key={rowIndex}
                              className="border-b border-slate-100"
                            >
                              {manualColumns.map((column) => (
                                <td
                                  key={`${rowIndex}-${column}`}
                                  className="px-3 py-3"
                                >
                                  <Input
                                    value={row[column] ?? ""}
                                    onChange={(event) =>
                                      updateManualCell(
                                        rowIndex,
                                        column,
                                        event.target.value,
                                      )
                                    }
                                    placeholder={
                                      column.toLowerCase() === "email"
                                        ? "contato@empresa.com"
                                        : `Valor de ${column}`
                                    }
                                    className="min-w-[170px]"
                                  />
                                </td>
                              ))}

                              <td className="px-3 py-3">
                                <button
                                  type="button"
                                  onClick={() => removeManualRow(rowIndex)}
                                  className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                                  title="Remover linha"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {form.formState.errors.manualRecipients?.message ? (
                    <p className="mt-3 text-xs font-medium text-red-600">
                      {form.formState.errors.manualRecipients.message}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button type="submit" disabled={isPending}>
            <Save className="h-4 w-4" />
            {isPending ? "Salvando..." : "Salvar audience"}
          </Button>
        </div>
      </form>
    </section>
  );
}
