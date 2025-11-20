/**
 * API barrel export
 * Re-export all API modules + helper functions
 */

export * from "./auth.api";
export * from "./product.api";
export * from "./cart.api";
export * from "./order.api";
export * from "./chat.api";
export * from "./address.api";
export * from "./resource.api";
export * from "./payment.api";
export * from "./admin.api";

// Re-export individual API services for convenience
import { productApi } from "./product.api";
import { authApi } from "./auth.api";
import { cartApi } from "./cart.api";
import { orderApi } from "./order.api";
import { chatApi } from "./chat.api";
import { resourceApi } from "./resource.api";
import { paymentApi } from "./payment.api";
import { adminApi } from "./admin.api";

export {
  productApi,
  authApi,
  cartApi,
  orderApi,
  chatApi,
  resourceApi,
  paymentApi,
  adminApi,
};

// Helper functions for backward compatibility
export const fetchProducts = productApi.getProducts;
export const fetchCategories = productApi.getCategories;
export const fetchBrands = productApi.getBrands;
