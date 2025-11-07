/**
 * HTTP Client 1 - Uses VITE_API_URL_1
 * Default API endpoint for most operations
 */

import ApiClient from "./api-client";

const API_URL_1 =
  (import.meta as any).env?.VITE_API_URL_1 || "http://localhost:8000/v1";

// Create and export instance with API_URL_1
export const http1 = new ApiClient(API_URL_1);
export default http1;
