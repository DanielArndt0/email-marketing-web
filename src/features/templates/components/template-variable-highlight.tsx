"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const VARIABLE_REGEX = /{{\s*([a-zA-Z0-9_.-]+)\s*}}/g;

function normalizeVariableName(value: string) {
  return value.replace(/{{|}}/g, "").trim();
}

export function extractDeclaredVariables(value?: string): string[] {
  if (!value) return [];

  return value.split(/[,\n]/).map(normalizeVariableName).filter(Boolean);
}

export function isDeclaredVariable(
  variableName: string,
  declaredVariables: string[],
) {
  return declaredVariables.includes(variableName);
}

export function HighlightedVariable({
  variableName,
  declared,
}: {
  variableName: string;
  declared: boolean;
}) {
  return (
    <span
      title={
        declared
          ? `Variável declarada: ${variableName}`
          : `Variável não declarada: ${variableName}`
      }
      className={cn(
        "rounded-md px-1.5 py-0.5 font-medium transition-colors",
        declared
          ? "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200"
          : "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200 underline decoration-rose-400 decoration-1 underline-offset-2",
      )}
    >
      {"{{" + variableName + "}}"}
    </span>
  );
}

export function renderHighlightedVariables(
  content: string | undefined,
  declaredVariables: string[],
): ReactNode {
  if (!content) return null;

  const nodes: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of content.matchAll(VARIABLE_REGEX)) {
    const fullMatch = match[0];
    const variableName = match[1];
    const index = match.index ?? 0;

    if (index > lastIndex) {
      nodes.push(content.slice(lastIndex, index));
    }

    nodes.push(
      <HighlightedVariable
        key={`${variableName}-${index}`}
        variableName={variableName}
        declared={isDeclaredVariable(variableName, declaredVariables)}
      />,
    );

    lastIndex = index + fullMatch.length;
  }

  if (lastIndex < content.length) {
    nodes.push(content.slice(lastIndex));
  }

  return nodes;
}

export function buildHighlightedHtmlPreview(
  html: string | undefined,
  declaredVariables: string[],
) {
  if (!html?.trim()) return "";

  if (typeof window === "undefined") {
    return html;
  }

  const parser = new DOMParser();
  const previewDocument = parser.parseFromString(html, "text/html");

  const style = previewDocument.createElement("style");

  style.textContent = `
  .template-variable-token {
    display: inline-block;
    padding: 1px 4px;
    border-radius: 6px;
    font-weight: 500;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 0.95em;
    line-height: 1.35;
    white-space: nowrap;
    transition: all 0.15s ease;
  }

  .template-variable-token[data-declared="true"] {
    color: #0369a1;
    background: rgba(224, 242, 254, 0.7);
    box-shadow: inset 0 0 0 1px rgba(125, 211, 252, 0.7);
    text-decoration: none;
  }

  .template-variable-token[data-declared="false"] {
    color: #be123c;
    background: rgba(255, 241, 242, 0.7);
    box-shadow: inset 0 0 0 1px rgba(253, 164, 175, 0.75);
    text-decoration: underline;
    text-decoration-color: rgba(244, 63, 94, 0.75);
    text-decoration-thickness: 1px;
    text-underline-offset: 2px;
  }
`;

  previewDocument.head.appendChild(style);

  const walker = previewDocument.createTreeWalker(
    previewDocument.body,
    NodeFilter.SHOW_TEXT,
  );

  const textNodes: Text[] = [];

  while (walker.nextNode()) {
    textNodes.push(walker.currentNode as Text);
  }

  for (const textNode of textNodes) {
    const text = textNode.nodeValue ?? "";

    VARIABLE_REGEX.lastIndex = 0;

    if (!VARIABLE_REGEX.test(text)) {
      continue;
    }

    VARIABLE_REGEX.lastIndex = 0;

    const fragment = previewDocument.createDocumentFragment();
    let lastIndex = 0;

    for (const match of text.matchAll(VARIABLE_REGEX)) {
      const fullMatch = match[0];
      const variableName = match[1];
      const index = match.index ?? 0;

      if (index > lastIndex) {
        fragment.appendChild(
          previewDocument.createTextNode(text.slice(lastIndex, index)),
        );
      }

      const declared = isDeclaredVariable(variableName, declaredVariables);
      const span = previewDocument.createElement("span");

      span.className = "template-variable-token";
      span.dataset.declared = String(declared);
      span.title = declared
        ? `Variável declarada: ${variableName}`
        : `Variável não declarada: ${variableName}`;
      span.textContent = `{{${variableName}}}`;

      fragment.appendChild(span);

      lastIndex = index + fullMatch.length;
    }

    if (lastIndex < text.length) {
      fragment.appendChild(
        previewDocument.createTextNode(text.slice(lastIndex)),
      );
    }

    textNode.parentNode?.replaceChild(fragment, textNode);
  }

  return `<!doctype html>${previewDocument.documentElement.outerHTML}`;
}

export function extractUsedVariablesFromContent(content?: string): string[] {
  if (!content) return [];

  const variables = new Set<string>();

  for (const match of content.matchAll(VARIABLE_REGEX)) {
    const variableName = match[1]?.trim();

    if (variableName) {
      variables.add(variableName);
    }
  }

  return Array.from(variables);
}