import http2 from "@/lib/http2";

export interface Brand {
  id: string;
  brand_id?: string;
  name: string;
  description?: string;
  deleted?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateBrandRequest {
  name: string;
  description?: string;
}

export interface CreateBrandResponse {
  message: string;
  info: {
    message: string;
    brand_id: string;
    success: boolean;
  };
}

export interface BrandsListResponse {
  message: string;
  info: {
    brands: Brand[];
    total_count: number;
    current_page: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
    success: boolean;
    message: string;
  };
}

export interface DeleteBrandResponse {
  message: string;
  info: {
    success: boolean;
    message: string;
  };
}

export interface BrandsParams {
  page?: number;
  page_size?: number;
  name_search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export const brandApi = {
  // Get brands with pagination
  async getBrands(params?: BrandsParams): Promise<BrandsListResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.page_size)
        queryParams.append("page_size", params.page_size.toString());
      if (params?.name_search)
        queryParams.append("name_search", params.name_search);
      if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
      if (params?.sort_order)
        queryParams.append("sort_order", params.sort_order);

      const url = `/v1/brands${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const data = await http2.get<BrandsListResponse>(url);
      return data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.detail || "Failed to fetch brands"
      );
    }
  },

  // Create brand
  async createBrand(data: CreateBrandRequest): Promise<CreateBrandResponse> {
    try {
      const result = await http2.post<CreateBrandResponse>("/v1/brands", data);
      return result;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.detail || "Failed to create brand"
      );
    }
  },

  // Delete brand
  async deleteBrand(brandId: string): Promise<DeleteBrandResponse> {
    try {
      const result = await http2.delete<DeleteBrandResponse>(
        `/v1/brands/${brandId}`
      );
      return result;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.detail || "Failed to delete brand"
      );
    }
  },
};
