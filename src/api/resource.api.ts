/**
 * Resource API - Quản lý tài liệu/tài nguyên
 * Sử dụng http2 theo yêu cầu pattern
 */

import http2 from "@/lib/http2";
import type {
  Resource,
  ResourcesParams,
  ResourcesResponse,
  ResourceDetailResponse,
  BatchUploadResponse,
  BatchProcessRequest,
  BatchProcessResponse,
} from "@/types";

export const resourceApi = {
  /**
   * GET /v1/resources - Lấy danh sách resources với pagination và filters
   */
  async getResources(params?: ResourcesParams): Promise<ResourcesResponse> {
    // Build params object, only include non-null values
    const queryParams: any = {
      page: params?.page || 1,
      page_size: params?.page_size || 10,
      sort_by: params?.sort_by || "created_at",
      sort_order: params?.sort_order || "desc",
    };

    // Only add optional filters if they have values
    if (params?.resource_type) {
      queryParams.resource_type = params.resource_type;
    }
    if (params?.resource_name_search) {
      queryParams.resource_name_search = params.resource_name_search;
    }
    if (params?.processing_status) {
      queryParams.processing_status = params.processing_status;
    }
    if (params?.processing_type) {
      queryParams.processing_type = params.processing_type;
    }
    // Don't send user_id - let backend handle it based on auth

    return await http2.get<ResourcesResponse>("/v1/resources", {
      params: queryParams,
    });
  },

  /**
   * GET /v1/resources/{resource_id} - Lấy chi tiết resource theo ID
   */
  async getResourceById(resourceId: string): Promise<ResourceDetailResponse> {
    return await http2.get<ResourceDetailResponse>(
      `/v1/resources/${resourceId}`
    );
  },

  /**
   * DELETE /v1/resources/{resource_id} - Xóa resource theo ID
   */
  async deleteResource(
    resourceId: string
  ): Promise<{ message: string; info: { success: boolean; message: string } }> {
    return await http2.delete<{
      message: string;
      info: { success: boolean; message: string };
    }>(`/v1/resources/${resourceId}`);
  },

  /**
   * POST /v1/resources/batch-upload - Batch upload nhiều files (Step 1 of 2)
   * Upload files lên MinIO và tạo resource records với status 'draft'
   */
  async batchUpload(
    files: File[],
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<BatchUploadResponse> {
    const formData = new FormData();

    // Thêm tất cả files vào FormData với key 'files'
    files.forEach((file) => {
      formData.append("files", file);
    });

    return await http2.post<BatchUploadResponse>(
      "/v1/resources/batch-upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress,
      }
    );
  },

  /**
   * POST /v1/resources/batch-process - Kích hoạt batch processing (Step 2 of 2)
   * Bắt đầu xử lý background cho các resources đã upload
   */
  async batchProcess(
    request: BatchProcessRequest
  ): Promise<BatchProcessResponse> {
    return await http2.post<BatchProcessResponse>(
      "/v1/resources/batch-process",
      request
    );
  },
};

// Export types for convenience
export type {
  Resource,
  ResourcesParams,
  ResourcesResponse,
  ResourceDetailResponse,
  BatchUploadResponse,
  BatchProcessRequest,
  BatchProcessResponse,
};
