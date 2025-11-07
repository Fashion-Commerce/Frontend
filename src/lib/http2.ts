/**
 * HTTP Client 2 - Uses VITE_API_URL_2
 * Used for specific operations like user registration
 */

import ApiClient from "./api-client";

const API_URL_2 =
  (import.meta as any).env?.VITE_API_URL_2 || "http://localhost:8000/v1";

// Create and export instance with API_URL_2
export const http2 = new ApiClient(API_URL_2);
export default http2;
