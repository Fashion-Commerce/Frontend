import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
      timeout: 30000, // 30 seconds
      withCredentials: false, // Disable credentials for CORS
    });

    // Load token from localStorage on initialization
    this.loadToken();

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Unauthorized - clear token
          this.clearToken();
          // Let the application handle redirect, don't force reload
          // Dispatch a custom event for logout
          window.dispatchEvent(new CustomEvent("auth:unauthorized"));
        }
        return Promise.reject(error);
      }
    );
  }

  public getBaseURL(): string {
    return this.baseURL;
  }

  private loadToken(): void {
    const token = localStorage.getItem("auth_token");
    if (token) {
      this.token = token;
    }
  }

  public setToken(token: string): void {
    this.token = token;
    localStorage.setItem("auth_token", token);
  }

  public clearToken(): void {
    this.token = null;
    localStorage.removeItem("auth_token");
  }

  public getToken(): string | null {
    return this.token;
  }

  public isAuthenticated(): boolean {
    return !!this.token;
  }

  // Generic request methods
  public async get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config);
    return this.extractData(response.data);
  }

  public async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(
      url,
      data,
      config
    );
    return this.extractData(response.data);
  }

  public async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config);
    return this.extractData(response.data);
  }

  public async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config);
    return this.extractData(response.data);
  }

  public async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.patch(
      url,
      data,
      config
    );
    return this.extractData(response.data);
  }

  // Handle backend response structure: { message, info: { data, ... } }
  private extractData<T>(response: any): T {
    if (response?.info) {
      // For auth responses (signin, signup), return the full response
      if (response.info.access_token || response.info.user_id) {
        return response as T;
      }

      // For update operations that return success messages
      if (response.info.success !== undefined && response.info.message) {
        return response as T;
      }

      // Handle paginated responses
      if (response.info.products) return response.info.products;
      if (response.info.categories) return response.info.categories;
      if (response.info.brands) return response.info.brands;
      if (response.info.product) return response.info.product;
      if (response.info.cart_items) return response.info.cart_items;
      if (response.info.orders) return response.info.orders;
      if (response.info.resources) return response as T; // Return full response for resources with pagination

      // Handle chat messages response (nested under data)
      if (response.info.data?.messages) return response as T; // Return full response for pagination data

      if (response.info.user) return response as T; // Return full response for user details
      return response.info;
    }
    return response;
  }

  // Stream API for chat
  public async stream(
    url: string,
    data: any,
    onChunk: (chunk: any) => void
  ): Promise<void> {
    const response = await fetch(`${this.baseURL}${url}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) throw new Error("No response body");

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6));
            onChunk(data);
          } catch (e) {
            console.warn("Failed to parse SSE data:", line);
          }
        }
      }
    }
  }

  // Get raw axios instance for special cases
  public getAxiosInstance(): AxiosInstance {
    return this.client;
  }
}

// Export ApiClient class only
export default ApiClient;
