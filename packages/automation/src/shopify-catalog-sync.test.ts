import { describe, expect, it, vi } from "vitest";
import { ShopifyAdminClient, ShopifyCatalogSync, type ShopifyHttpClient } from "./index";

describe("ShopifyAdminClient", () => {
  it("builds a tenant-safe Admin GraphQL request without exposing the token", async () => {
    const post = vi.fn().mockResolvedValue({ data: { shop: { name: "Demo" } } });
    const client = new ShopifyAdminClient({ http: { post } as ShopifyHttpClient });

    const result = await client.query({
      shopDomain: "https://demo.myshopify.com/",
      accessToken: "secret-token",
      query: "query { shop { name } }",
    });

    expect(result).toEqual({ shop: { name: "Demo" } });
    expect(post).toHaveBeenCalledWith(
      "https://demo.myshopify.com/admin/api/2026-07/graphql.json",
      expect.objectContaining({ "X-Shopify-Access-Token": "secret-token" }),
      expect.objectContaining({ query: "query { shop { name } }" }),
    );
  });

  it("fails closed on GraphQL errors", async () => {
    const client = new ShopifyAdminClient({
      http: { post: vi.fn().mockResolvedValue({ errors: [{ message: "Access denied" }] }) },
    });

    await expect(client.query({
      shopDomain: "demo.myshopify.com",
      accessToken: "secret",
      query: "query { shop { name } }",
    })).rejects.toThrow("Shopify GraphQL error: Access denied");
  });
});

describe("ShopifyCatalogSync", () => {
  it("maps Shopify products into ATLAS product intelligence inputs and preserves pagination", async () => {
    const client = new ShopifyAdminClient({
      http: {
        post: vi.fn().mockResolvedValue({
          data: {
            products: {
              nodes: [{
                id: "gid://shopify/Product/1",
                handle: "atlas-shirt",
                title: "ATLAS Shirt",
                descriptionHtml: "<p>Premium shirt for creators.</p>",
                onlineStoreUrl: "https://demo.myshopify.com/products/atlas-shirt",
                variants: { nodes: [{ price: "39.00", compareAtPrice: "49.00" }] },
                images: { nodes: [{ url: "https://cdn.example/image.jpg", altText: "ATLAS Shirt" }] },
              }],
              pageInfo: { hasNextPage: true, endCursor: "cursor-1" },
            },
          },
        }),
      },
    });

    const result = await new ShopifyCatalogSync(client).collect({
      shopDomain: "demo.myshopify.com",
      accessToken: "secret",
      first: 25,
    });

    expect(result.hasNextPage).toBe(true);
    expect(result.endCursor).toBe("cursor-1");
    expect(result.products[0]).toMatchObject({
      title: "ATLAS Shirt",
      description: "Premium shirt for creators.",
      price: "39.00",
      images: ["https://cdn.example/image.jpg"],
      canonicalUrl: "https://demo.myshopify.com/products/atlas-shirt",
    });
  });
});
