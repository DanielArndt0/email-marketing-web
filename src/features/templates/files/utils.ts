import type {
  CreateTemplateAttachmentInput,
  CreateTemplateInlineAssetInput,
  TemplateEmailAttachment,
  TemplateEmbeddedAsset,
} from "./types";

function createLocalId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeFileBaseName(fileName: string) {
  const baseName = fileName.replace(/\.[^/.]+$/, "");

  return baseName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function normalizeStoredName(fileName: string) {
  return fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function createUniqueCid(fileName: string, existingCids: string[]) {
  const baseCid = normalizeFileBaseName(fileName) || "asset";
  let cid = baseCid;
  let counter = 2;

  while (existingCids.includes(cid)) {
    cid = `${baseCid}-${counter}`;
    counter += 1;
  }

  return cid;
}

export function buildTemplateStorageKey(templateId: string, fileName: string) {
  const storedName = normalizeStoredName(fileName);

  return `storage/templates/${templateId}/${storedName}`;
}

export function createEmbeddedAssetFromFile(
  file: File,
  existingCids: string[],
): TemplateEmbeddedAsset {
  const cid = createUniqueCid(file.name, existingCids);
  const previewUrl = URL.createObjectURL(file);

  return {
    id: createLocalId(),
    originalName: file.name,
    storedName: normalizeStoredName(file.name),
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    sizeBytes: file.size,
    cid,
    previewUrl,
    file,
    isLocal: true,
  };
}

export function createEmailAttachmentFromFile(
  file: File,
): TemplateEmailAttachment {
  return {
    id: createLocalId(),
    originalName: file.name,
    storedName: normalizeStoredName(file.name),
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    sizeBytes: file.size,
    file,
    isLocal: true,
  };
}

export function buildInlineAssetInput(
  templateId: string,
  asset: TemplateEmbeddedAsset,
): CreateTemplateInlineAssetInput {
  return {
    originalName: asset.originalName || asset.fileName,
    storedName: asset.storedName || normalizeStoredName(asset.fileName),
    mimeType: asset.mimeType,
    sizeBytes: asset.sizeBytes,
    storageKey:
      asset.storageKey ?? buildTemplateStorageKey(templateId, asset.fileName),
    cid: asset.cid,
  };
}

export function buildAttachmentInput(
  templateId: string,
  attachment: TemplateEmailAttachment,
): CreateTemplateAttachmentInput {
  return {
    originalName: attachment.originalName || attachment.fileName,
    storedName:
      attachment.storedName || normalizeStoredName(attachment.fileName),
    mimeType: attachment.mimeType,
    sizeBytes: attachment.sizeBytes,
    storageKey:
      attachment.storageKey ??
      buildTemplateStorageKey(templateId, attachment.fileName),
  };
}

export function buildEmbeddedImageSnippet(asset: TemplateEmbeddedAsset) {
  return `<img src="cid:${asset.cid}" alt="${asset.fileName}" />`;
}

export function buildPreviewHtmlWithEmbeddedAssets(
  html: string | undefined,
  assets: TemplateEmbeddedAsset[],
) {
  if (!html) {
    return "";
  }

  return assets.reduce((previewHtml, asset) => {
    if (!asset.previewUrl) {
      return previewHtml;
    }

    return previewHtml.replaceAll(`cid:${asset.cid}`, asset.previewUrl);
  }, html);
}

export function revokeTemplateFileUrl(
  file: TemplateEmbeddedAsset | TemplateEmailAttachment,
) {
  if ("previewUrl" in file && file.previewUrl && file.isLocal) {
    URL.revokeObjectURL(file.previewUrl);
  }

  if ("downloadUrl" in file && file.downloadUrl && file.isLocal) {
    URL.revokeObjectURL(file.downloadUrl);
  }
}

export function formatTemplateFileSize(sizeBytes: number) {
  if (sizeBytes < 1024) {
    return `${sizeBytes} B`;
  }

  if (sizeBytes < 1024 * 1024) {
    return `${(sizeBytes / 1024).toFixed(1)} KB`;
  }

  return `${(sizeBytes / 1024 / 1024).toFixed(1)} MB`;
}
