import { apiClient } from '@/lib/api-client';

export interface Product {
  product_id: string;
  id?: string;
  name: string;
  description: string;
  price: number;
  sku: string;
  is_active: boolean;
  category_id: string;
  brand_id: string;
  category?: Category;
  brand?: Brand;
  image_urls?: string[];
  images?: string[];
  variants?: ProductVariant[];
  created_at: string;
  updated_at: string;
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
  sort_order?: 'asc' | 'desc';
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
  async getProducts(params?: ProductsParams): Promise<Product[]> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.set(key, value.toString());
        }
      });
    }
    
    const url = `/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<Product[]>(url);
  },

  async getProductById(id: string): Promise<Product> {
    return apiClient.get<Product>(`/products/${id}`);
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
    
    const url = `/categories${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<Category[]>(url);
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
    
    const url = `/brands${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<Brand[]>(url);
  },

  async getProductVariants(productId: string): Promise<ProductVariant[]> {
    return apiClient.get<ProductVariant[]>(`/product-variants?product_id=${productId}`);
  },
};
