import type { CreativeArtifact } from "@atlas/contracts";

export interface ValidationIssue {
  field: string;
  message: string;
}

export interface CreativeValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

export function validateCreativeArtifact(artifact: CreativeArtifact): CreativeValidationResult {
  const issues: ValidationIssue[] = [];
  if (!artifact.id.trim()) issues.push({ field: "id", message: "Creative id is required" });
  if (!artifact.organizationId.trim()) issues.push({ field: "organizationId", message: "Organization id is required" });
  if (!artifact.source.sourceId.trim()) issues.push({ field: "source.sourceId", message: "Source id is required" });
  if (!artifact.source.capturedAt || Number.isNaN(Date.parse(artifact.source.capturedAt))) {
    issues.push({ field: "source.capturedAt", message: "Captured timestamp must be a valid ISO date" });
  }
  if (!artifact.primaryText && !artifact.headline && !artifact.title && !artifact.description) {
    issues.push({ field: "content", message: "At least one creative text field is required" });
  }
  if (artifact.mediaUrls?.some((url) => !isHttpUrl(url))) {
    issues.push({ field: "mediaUrls", message: "Media URLs must use http or https" });
  }
  if (artifact.landingPageUrl && !isHttpUrl(artifact.landingPageUrl)) {
    issues.push({ field: "landingPageUrl", message: "Landing page URL must use http or https" });
  }
  return { valid: issues.length === 0, issues };
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
