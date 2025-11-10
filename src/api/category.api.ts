import http2 from "@/lib/http2";

// Types
export interface Category {
  category_id?: string;
  name: string;
  description?: string | null;
  parent_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CategoriesParams {
  page?: number;
  page_size?: number;
  name_search?: string;
  parent_id_filter?: string | null;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  parent_id?: string | null;
}

export interface CategoriesResponse {
  message: string;
  info: {
    categories: Category[];
    total_count: number;
    current_page: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
    success: boolean;
    message: string;
  };
}

export interface CreateCategoryResponse {
  message: string;
  info: {
    message: string;
    category_id: string;
    success: boolean;
  };
}

export interface DeleteCategoryResponse {
  message: string;
  info: {
    message: string;
    category_id: string;
    success: boolean;
  };
}

// API Methods
export const categoryApi = {
  getCategories: (params?: CategoriesParams) =>
    http2.get<CategoriesResponse>("/v1/categories", { params }),

  createCategory: (data: CreateCategoryRequest) =>
    http2.post<CreateCategoryResponse>("/v1/categories", data),

  deleteCategory: (categoryId: string) =>
    http2.delete<DeleteCategoryResponse>(`/v1/categories/${categoryId}`),
};
