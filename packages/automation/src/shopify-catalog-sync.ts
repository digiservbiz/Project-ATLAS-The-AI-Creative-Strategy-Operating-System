import type { ProductPage } from "@atlas/creative-intelligence";
import type { ShopifyAdminClient } from "./shopify-admin-client";

export interface ShopifyProductNode {
  id: string;
  handle: string;
  title: string;
  descriptionHtml?: string | null;
  onlineStoreUrl?: string | null;
  variants?: { nodes: Array<{ price: string; compareAtPrice?: string | null }> };
  images?: { nodes: Array<{ url: string; altText?: string | null }> };
}

export interface ShopifyCatalogPage {
  products: {
    nodes: ShopifyProductNode[];
    pageInfo: { hasNextPage: boolean; endCursor?: string | null };
  };
}

export interface ShopifyCatalogSyncRequest {
  shopDomain: string;
  accessToken: string;
  first?: number;
  after?: string | null;
}

export interface ShopifyCatalogSyncResult {
  products: ProductPage[];
  hasNextPage: boolean;
  endCursor?: string | null;
}

const PRODUCTS_QUERY = `
query AtlasProducts($first: Int!, $after: String) {
  products(first: $first, after: $after) {
    nodes {
      id
      handle
      title
      descriptionHtml
      onlineStoreUrl
      variants(first: 1) { nodes { price compareAtPrice } }
      images(first: 20) { nodes { url altText } }
    }
    pageInfo { hasNextPage endCursor }
  }
}`;

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function toProductPage(product: ShopifyProductNode, shopDomain: string): ProductPage {
  const variant = product.variants?.nodes[0];
  const images = product.images?.nodes.map((image) => image.url).filter(Boolean) ?? [];
  const url = product.onlineStoreUrl ?? `https://${shopDomain}/products/${product.handle}`;
  const description = product.descriptionHtml ? stripHtml(product.descriptionHtml) : undefined;

  return {
    url,
    canonicalUrl: url,
    title: product.title,
    description,
    price: variant?.price,
    currency: undefined,
    images,
    text: [product.title, description].filter(Boolean).join("\n"),
  };
}

export class ShopifyCatalogSync {
  constructor(private readonly client: ShopifyAdminClient) {}

  async collect(request: ShopifyCatalogSyncRequest): Promise<ShopifyCatalogSyncResult> {
    const first = Math.min(Math.max(request.first ?? 50, 1), 250);
    const page = await this.client.query<ShopifyCatalogPage>({
      shopDomain: request.shopDomain,
      accessToken: request.accessToken,
      query: PRODUCTS_QUERY,
      variables: { first, after: request.after ?? null },
    });

    return {
      products: page.products.nodes.map((product) => toProductPage(product, request.shopDomain.replace(/^https?:\/\//i, "").replace(/\/$/, ""))),
      hasNextPage: page.products.pageInfo.hasNextPage,
      endCursor: page.products.pageInfo.endCursor,
    };
  }
}
