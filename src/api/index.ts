/**
 * API barrel export
 * Re-export all API modules + helper functions
 */

export * from "./auth.api";
export * from "./product.api";
export * from "./cart.api";
export * from "./order.api";
export * from "./chat.api";

// Re-export API client
export { apiClient } from "@/lib/api-client";

// Re-export individual API services for convenience
import { productApi } from "./product.api";
import { authApi } from "./auth.api";
import { cartApi } from "./cart.api";
import { orderApi } from "./order.api";
import { chatApi } from "./chat.api";

export { productApi, authApi, cartApi, orderApi, chatApi };

// Helper functions for backward compatibility
export const fetchProducts = productApi.getProducts;
export const fetchCategories = productApi.getCategories;
export const fetchBrands = productApi.getBrands;
