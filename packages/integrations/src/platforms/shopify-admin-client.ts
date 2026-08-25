import { AuthenticatedPlatformClient, type PlatformTransport } from "./platform-client";

export interface ShopifyProduct { id: string; title?: string; status?: string; }
export interface ShopifyOrder { id: string; created_at?: string; total_price?: string; currency?: string; }

export class ShopifyAdminClient extends AuthenticatedPlatformClient {
  constructor(transport: PlatformTransport, accessToken: string, private readonly apiVersion = "2026-01") { super(transport, accessToken); }
  listProducts() { return this.get<{ products: ShopifyProduct[] }>(`/admin/api/${this.apiVersion}/products.json`, { limit: 250 }); }
  listOrders(params: Record<string, string | number | boolean> = {}) { return this.get<{ orders: ShopifyOrder[] }>(`/admin/api/${this.apiVersion}/orders.json`, { status: "any", limit: 250, ...params }); }
  getShop() { return this.get<unknown>(`/admin/api/${this.apiVersion}/shop.json`); }
}
