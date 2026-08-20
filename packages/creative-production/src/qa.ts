import type { CreativeAsset } from "./contracts";

export interface CreativeQaResult {
  passed: boolean;
  score: number;
  issues: string[];
  checks: string[];
}

export function evaluateCreativeAsset(asset: CreativeAsset): CreativeQaResult {
  const issues: string[] = [];
  const checks: string[] = [];
  let score = 0;

  if (asset.status === "completed") {
    score += 0.4;
    checks.push("generation_completed");
  } else {
    issues.push("Asset generation is not completed.");
  }

  if (asset.url) {
    score += 0.3;
    checks.push("asset_url_present");
  } else {
    issues.push("Generated asset has no URL.");
  }

  if (asset.mimeType) {
    score += 0.15;
    checks.push("mime_type_present");
  }

  if (asset.organizationId) {
    score += 0.15;
    checks.push("organization_scope_present");
  } else {
    issues.push("Organization scope is missing.");
  }

  return {
    passed: issues.length === 0 && score >= 0.85,
    score,
    issues,
    checks,
  };
}
