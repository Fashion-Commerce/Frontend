import http1 from "@/lib/http1";
import http2 from "@/lib/http2";

export interface Product {
  product_id: string;
  id?: string;
  name: string;
  description: string;
  base_price?: number;
  price?: number;
  sku?: string;
  is_active?: boolean;
  category_id: string;
  brand_id: string;
  category?: Category;
  brand?: Brand;
  category_name?: string;
  brand_name?: string;
  image_urls?: string[];
  images?: string[];
  variants?: ProductVariant[];
  average_rating?: number;
  review_count?: number;
  created_at: string;
  updated_at: string | null;
}

export interface Category {
  category_id: string;
  id?: string;
  name: string;
  description?: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Brand {
  brand_id: string;
  id?: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  product_variant_id: string;
  id?: string;
  product_id: string;
  sku: string;
  color?: string;
  size?: string;
  price: number;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface ProductsParams {
  page?: number;
  page_size?: number;
  name_search?: string;
  category_id_filter?: string;
  brand_id_filter?: string;
  price_min?: number;
  price_max?: number;
  is_active_filter?: boolean;
  sku_search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface ProductsResponse {
  message: string;
  info: {
    products: Product[];
    total_count: number;
    current_page: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
    success: boolean;
    message: string;
  };
}

export interface CreateProductRequest {
  name: string;
  base_price: number;
  category_id: string;
  brand_id: string;
  description?: string;
  images?: File[];
}

export interface CreateProductResponse {
  message: string;
  info: {
    message: string;
    product_id: string;
    success: boolean;
    image_urls: string[];
  };
}

export interface DeleteProductResponse {
  message: string;
  info: {
    success: boolean;
    message: string;
  };
}

export interface ProductDetailResponse {
  message: string;
  info: {
    product: Product;
    success: boolean;
    message: string;
  };
}

export interface CategoriesParams {
  page?: number;
  page_size?: number;
  name_search?: string;
  parent_id_filter?: string;
}

export interface BrandsParams {
  page?: number;
  page_size?: number;
  name_search?: string;
}

export const productApi = {
  async getProducts(params?: ProductsParams): Promise<ProductsResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.page_size)
        queryParams.append("page_size", params.page_size.toString());
      if (params?.name_search)
        queryParams.append("name_search", params.name_search);
      if (params?.category_id_filter)
        queryParams.append("category_id_filter", params.category_id_filter);
      if (params?.brand_id_filter)
        queryParams.append("brand_id_filter", params.brand_id_filter);
      if (params?.price_min !== undefined)
        queryParams.append("price_min", params.price_min.toString());
      if (params?.price_max !== undefined)
        queryParams.append("price_max", params.price_max.toString());
      if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
      if (params?.sort_order)
        queryParams.append("sort_order", params.sort_order);

      const url = `/v1/products${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const data = await http2.get<ProductsResponse>(url);
      return data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.detail || "Failed to fetch products"
      );
    }
  },

  async getProductById(id: string): Promise<ProductDetailResponse> {
    try {
      const data = await http2.get<ProductDetailResponse>(`/v1/products/${id}`);
      return data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.detail || "Failed to fetch product"
      );
    }
  },

  async createProduct(
    data: CreateProductRequest
  ): Promise<CreateProductResponse> {
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("base_price", data.base_price.toString());
      formData.append("category_id", data.category_id);
      formData.append("brand_id", data.brand_id);
      if (data.description) {
        formData.append("description", data.description);
      }
      if (data.images && data.images.length > 0) {
        data.images.forEach((image) => {
          formData.append("images", image);
        });
      }

      const result = await http2.post<CreateProductResponse>(
        "/v1/products",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return result;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.detail || "Failed to create product"
      );
    }
  },

  async deleteProduct(productId: string): Promise<DeleteProductResponse> {
    try {
      const result = await http2.delete<DeleteProductResponse>(
        `/v1/products/${productId}`
      );
      return result;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.detail || "Failed to delete product"
      );
    }
  },

  async getCategories(params?: CategoriesParams): Promise<Category[]> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.set(key, value.toString());
        }
      });
    }

    const url = `/categories${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return http1.get<Category[]>(url);
  },

  async getBrands(params?: BrandsParams): Promise<Brand[]> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.set(key, value.toString());
        }
      });
    }

    const url = `/brands${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return http1.get<Brand[]>(url);
  },

  async getProductVariants(productId: string): Promise<ProductVariant[]> {
    return http1.get<ProductVariant[]>(
      `/product-variants?product_id=${productId}`
    );
  },
};
