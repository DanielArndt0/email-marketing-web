import type {
  TemplateEmailAttachment,
  TemplateEmbeddedAsset,
} from "./types";

function createClientId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function removeFileExtension(fileName: string) {
  return fileName.replace(/\.[^.]+$/, "");
}

export function createCidFromFileName(fileName: string, existingCids: string[]) {
  const base = removeFileExtension(fileName)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  const fallbackBase = base || "asset";
  let cid = fallbackBase;
  let index = 2;

  while (existingCids.includes(cid)) {
    cid = `${fallbackBase}-${index}`;
    index += 1;
  }

  return cid;
}

export function formatFileSize(sizeBytes: number) {
  if (!Number.isFinite(sizeBytes) || sizeBytes <= 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(
    Math.floor(Math.log(sizeBytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = sizeBytes / 1024 ** exponent;

  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

export function createEmbeddedAssetFromFile(
  file: File,
  existingCids: string[],
): TemplateEmbeddedAsset {
  const cid = createCidFromFileName(file.name, existingCids);

  return {
    id: createClientId("embedded-asset"),
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    sizeBytes: file.size,
    cid,
    previewUrl: URL.createObjectURL(file),
    file,
  };
}

export function createEmailAttachmentFromFile(
  file: File,
): TemplateEmailAttachment {
  return {
    id: createClientId("email-attachment"),
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    sizeBytes: file.size,
    downloadUrl: URL.createObjectURL(file),
    file,
  };
}

export function revokeTemplateFileUrl(
  file: TemplateEmbeddedAsset | TemplateEmailAttachment,
) {
  const embeddedAsset = file as TemplateEmbeddedAsset;
  const emailAttachment = file as TemplateEmailAttachment;
  const url = embeddedAsset.previewUrl ?? emailAttachment.downloadUrl;

  if (file.file && url?.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

export function buildPreviewHtmlWithEmbeddedAssets(
  html: string | undefined,
  assets: TemplateEmbeddedAsset[],
) {
  if (!html?.trim()) {
    return "";
  }

  return assets.reduce((previewHtml, asset) => {
    if (!asset.cid || !asset.previewUrl) {
      return previewHtml;
    }

    return previewHtml.replaceAll(`cid:${asset.cid}`, asset.previewUrl);
  }, html);
}

export function buildEmbeddedImageSnippet(asset: TemplateEmbeddedAsset) {
  return `<img src="cid:${asset.cid}" alt="${asset.fileName}" />`;
}
