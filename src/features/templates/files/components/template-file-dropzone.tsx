"use client";

import { Upload } from "lucide-react";
import type { ChangeEvent } from "react";

import { cn } from "@/lib/utils";

type TemplateFileDropzoneProps = {
  title: string;
  description: string;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  onFilesSelected: (files: File[]) => void;
};

export function TemplateFileDropzone({
  title,
  description,
  accept,
  multiple = true,
  disabled = false,
  onFilesSelected,
}: TemplateFileDropzoneProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const fileList = event.target.files;
    const files: File[] = fileList ? Array.from(fileList) : [];

    if (files.length > 0) {
      onFilesSelected(files);
    }

    event.target.value = "";
  }

  return (
    <label
      className={cn(
        "app-card-flat flex cursor-pointer flex-col items-center justify-center rounded-2xl border-dashed p-5 text-center transition hover:bg-[var(--app-surface-hover)]",
        disabled && "pointer-events-none opacity-60",
      )}
    >
      <span className="app-icon-box mb-3 rounded-2xl p-3">
        <Upload className="h-5 w-5" />
      </span>

      <span className="app-heading text-sm font-semibold">{title}</span>
      <span className="app-muted mt-1 max-w-sm text-xs leading-5">
        {description}
      </span>

      <input
        type="file"
        className="sr-only"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={handleChange}
      />
    </label>
  );
}
