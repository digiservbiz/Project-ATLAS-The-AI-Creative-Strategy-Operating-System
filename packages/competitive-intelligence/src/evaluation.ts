import type { CreativeArtifact } from "@atlas/contracts";
import { validateCreativeArtifact, type CreativeValidationResult } from "./validation";

export interface CreativeEvaluation {
  artifactId: string;
  accepted: boolean;
  qualityScore: number;
  validation: CreativeValidationResult;
  signals: string[];
  caveats: string[];
}

export interface EvaluationPolicy {
  minimumQualityScore?: number;
  requireText?: boolean;
  requireEvidenceTimestamp?: boolean;
}

export function evaluateCreativeArtifact(
  artifact: CreativeArtifact,
  policy: EvaluationPolicy = {},
): CreativeEvaluation {
  const validation = validateCreativeArtifact(artifact);
  const signals: string[] = [];
  const caveats: string[] = [];
  let score = validation.valid ? 0.5 : 0;

  const textLength = [artifact.title, artifact.primaryText, artifact.headline, artifact.description]
    .filter(Boolean)
    .join(" ").trim().length;
  if (textLength > 20) {
    score += 0.15;
    signals.push("meaningful_text_content");
  } else if (policy.requireText) {
    caveats.push("Text content is below the configured requirement.");
  }
  if (artifact.mediaUrls?.length) {
    score += 0.15;
    signals.push("media_present");
  }
  if (artifact.callToAction) {
    score += 0.1;
    signals.push("cta_present");
  }
  if (artifact.landingPageUrl) {
    score += 0.1;
    signals.push("landing_page_present");
  }
  if (policy.requireEvidenceTimestamp && !artifact.source.capturedAt) {
    caveats.push("Evidence timestamp is missing.");
    score -= 0.2;
  }

  const qualityScore = Math.max(0, Math.min(1, score));
  const minimum = policy.minimumQualityScore ?? 0.6;
  return {
    artifactId: artifact.id,
    accepted: validation.valid && qualityScore >= minimum,
    qualityScore,
    validation,
    signals,
    caveats,
  };
}
