import type { Platform } from "./platform-gateway";

export interface PlatformEndpointConfig { platform: Platform; baseUrl: string; apiVersion?: string; }

export const PLATFORM_DEFAULTS: Record<Platform, PlatformEndpointConfig> = {
  meta: { platform: "meta", baseUrl: "https://graph.facebook.com" },
  tiktok: { platform: "tiktok", baseUrl: "https://business-api.tiktok.com" },
  shopify: { platform: "shopify", baseUrl: "https://{shop}.myshopify.com" },
};

export function buildPlatformUrl(config: PlatformEndpointConfig, path: string) {
  if (!path.startsWith("/")) throw new Error("Platform API path must start with /");
  return `${config.baseUrl.replace(/\/$/, "")}${path}`;
}
