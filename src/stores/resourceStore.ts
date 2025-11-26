/**
 * Resource Store - Zustand store for Resources Management
 * Pattern: centralized state management với Zustand
 */

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  resourceApi,
  type Resource,
  type ResourcesParams,
  type BatchProcessRequest,
} from "@/api/resource.api";

// Upload file state interface (tương tự Vue component)
export interface UploadFileState {
  file: File;
  resource_id: string | null;
  resource_name: string | null;
  resource_path: string | null;
  progress: number;
  status:
    | "pending"
    | "uploading"
    | "uploaded"
    | "processing"
    | "processed"
    | "error";
  error: string | null;
}

interface ResourceState {
  // Data
  resources: Resource[];
  selectedResource: Resource | null;
  isLoading: boolean;
  error: string | null;

  // Pagination
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;

  // Filters
  resourceType: "document" | "link" | null;
  resourceNameSearch: string;
  userId: string | null;
  processingStatus:
    | "draft"
    | "pending"
    | "processing"
    | "completed"
    | "failed"
    | null;
  processingType: "document_structured_llm" | "sentence_based" | "excel" | null;
  sortBy: "created_at" | "updated_at" | "resource_name";
  sortOrder: "asc" | "desc";

  // Upload Dialog State
  isUploadDialogOpen: boolean;
  uploadFiles: UploadFileState[];
  isUploading: boolean;
  isProcessing: boolean;
  selectedProcessingType:
    | "document_structured_llm"
    | "sentence_based"
    | "excel";
  effectiveFrom: Date | null;
  effectiveTo: Date | null;

  // Actions - Data Fetching
  fetchResources: (params?: ResourcesParams) => Promise<void>;
  fetchResourceById: (id: string) => Promise<void>;
  deleteResource: (id: string) => Promise<void>;
  refreshResources: () => Promise<void>;

  // Actions - Filters
  setResourceType: (type: "document" | "link" | null) => void;
  setResourceNameSearch: (search: string) => void;
  setProcessingStatus: (
    status: "draft" | "pending" | "processing" | "completed" | "failed" | null
  ) => void;
  setProcessingType: (
    type: "document_structured_llm" | "sentence_based" | "excel" | null
  ) => void;
  setSortBy: (sortBy: "created_at" | "updated_at" | "resource_name") => void;
  setSortOrder: (order: "asc" | "desc") => void;
  setCurrentPage: (page: number) => void;
  clearFilters: () => void;

  // Actions - Upload Dialog
  openUploadDialog: () => void;
  closeUploadDialog: () => void;
  addFiles: (files: File[]) => void;
  removeFile: (index: number) => void;
  uploadFilesAction: () => Promise<void>;
  processFiles: (metadata: Partial<BatchProcessRequest>) => Promise<void>;
  setSelectedProcessingType: (
    type: "document_structured_llm" | "sentence_based" | "excel"
  ) => void;
  setEffectiveFrom: (date: Date | null) => void;
  setEffectiveTo: (date: Date | null) => void;
  resetUploadState: () => void;

  // Actions - Misc
  setSelectedResource: (resource: Resource | null) => void;
  clearError: () => void;
}

export const useResourceStore = create<ResourceState>()(
  devtools(
    (set, get) => ({
      // Initial state
      resources: [],
      selectedResource: null,
      isLoading: false,
      error: null,

      currentPage: 1,
      pageSize: 10,
      totalPages: 1,
      totalCount: 0,

      resourceType: null,
      resourceNameSearch: "",
      userId: null,
      processingStatus: null,
      processingType: null,
      sortBy: "created_at",
      sortOrder: "desc",

      // Upload Dialog State
      isUploadDialogOpen: false,
      uploadFiles: [],
      isUploading: false,
      isProcessing: false,
      selectedProcessingType: "document_structured_llm",
      effectiveFrom: null,
      effectiveTo: null,

      // Fetch resources with current filters
      fetchResources: async (params) => {
        set({ isLoading: true, error: null });
        try {
          const state = get();
          const queryParams: ResourcesParams = {
            page: params?.page || state.currentPage,
            page_size: params?.page_size || state.pageSize,
            resource_type:
              params?.resource_type !== undefined
                ? params.resource_type
                : state.resourceType,
            resource_name_search:
              params?.resource_name_search !== undefined
                ? params.resource_name_search
                : state.resourceNameSearch || undefined,
            processing_status:
              params?.processing_status !== undefined
                ? params.processing_status
                : state.processingStatus,
            processing_type:
              params?.processing_type !== undefined
                ? params.processing_type
                : state.processingType,
            sort_by: params?.sort_by || state.sortBy,
            sort_order: params?.sort_order || state.sortOrder,
          };

          const response = await resourceApi.getResources(queryParams);

          set({
            resources: response.info.resources,
            totalCount: response.info.total,
            currentPage: response.info.page,
            pageSize: response.info.page_size,
            totalPages: response.info.total_pages,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error:
              error.response?.data?.detail ||
              "Không thể tải danh sách tài liệu",
            isLoading: false,
          });
        }
      },

      // Fetch single resource by ID
      fetchResourceById: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const response = await resourceApi.getResourceById(id);
          set({
            selectedResource: response.info.resource,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.detail || "Failed to fetch resource",
            isLoading: false,
          });
        }
      },

      // Delete resource
      deleteResource: async (id) => {
        set({ error: null });
        try {
          await resourceApi.deleteResource(id);
          // Refresh list after delete
          await get().refreshResources();
        } catch (error: any) {
          set({
            error: error.response?.data?.detail || "Failed to delete resource",
          });
          throw error;
        }
      },

      // Refresh resources (re-fetch with current state)
      refreshResources: async () => {
        await get().fetchResources();
      },

      // Filter setters
      setResourceType: (type) => {
        set({ resourceType: type, currentPage: 1 });
        get().fetchResources();
      },

      setResourceNameSearch: (search) => {
        set({ resourceNameSearch: search, currentPage: 1 });
      },

      setProcessingStatus: (status) => {
        set({ processingStatus: status, currentPage: 1 });
        get().fetchResources();
      },

      setProcessingType: (type) => {
        set({ processingType: type, currentPage: 1 });
        get().fetchResources();
      },

      setSortBy: (sortBy) => {
        set({ sortBy, currentPage: 1 });
        get().fetchResources();
      },

      setSortOrder: (order) => {
        set({ sortOrder: order, currentPage: 1 });
        get().fetchResources();
      },

      setCurrentPage: (page) => {
        set({ currentPage: page });
        get().fetchResources();
      },

      clearFilters: () => {
        set({
          resourceType: null,
          resourceNameSearch: "",
          processingStatus: null,
          processingType: null,
          sortBy: "created_at",
          sortOrder: "desc",
          currentPage: 1,
        });
        get().fetchResources();
      },

      // Upload Dialog Actions
      openUploadDialog: () => {
        set({ isUploadDialogOpen: true });
      },

      closeUploadDialog: () => {
        set({ isUploadDialogOpen: false });
        get().resetUploadState();
      },

      addFiles: (files) => {
        const newFiles: UploadFileState[] = files.map((file) => ({
          file,
          resource_id: null,
          resource_name: null,
          resource_path: null,
          progress: 0,
          status: "pending" as const,
          error: null,
        }));

        set((state) => ({
          uploadFiles: [...state.uploadFiles, ...newFiles],
        }));
      },

      removeFile: (index) => {
        set((state) => {
          const fileToRemove = state.uploadFiles[index];

          // Don't allow removal if uploading/processing
          if (
            fileToRemove.status === "uploading" ||
            fileToRemove.status === "processing"
          ) {
            return state;
          }

          const newFiles = [...state.uploadFiles];
          newFiles.splice(index, 1);
          return { uploadFiles: newFiles };
        });
      },

      // Step 1: Upload files to server individually (batch-upload per file)
      uploadFilesAction: async () => {
        const state = get();
        const pendingFiles = state.uploadFiles.filter(
          (f) => f.status === "pending"
        );

        if (pendingFiles.length === 0) return;

        set({ isUploading: true });

        try {
          // Upload each file individually
          for (const pendingFile of pendingFiles) {
            const fileIndex = state.uploadFiles.findIndex(
              (f) => f.file === pendingFile.file
            );

            // Mark as uploading
            set((state) => ({
              uploadFiles: state.uploadFiles.map((f, idx) =>
                idx === fileIndex
                  ? { ...f, status: "uploading" as const, progress: 0 }
                  : f
              ),
            }));

            try {
              // Upload single file
              const response = await resourceApi.batchUpload(
                [pendingFile.file],
                (progressEvent) => {
                  const progress = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total
                  );

                  // Update progress for this specific file
                  set((state) => ({
                    uploadFiles: state.uploadFiles.map((f, idx) =>
                      idx === fileIndex ? { ...f, progress } : f
                    ),
                  }));
                }
              );

              // Update file with uploaded data
              const uploadedResource = response.info.resources[0];
              if (uploadedResource && uploadedResource.success) {
                set((state) => ({
                  uploadFiles: state.uploadFiles.map((f, idx) =>
                    idx === fileIndex
                      ? {
                          ...f,
                          resource_id: uploadedResource.resource_id,
                          resource_name: uploadedResource.resource_name,
                          resource_path: uploadedResource.resource_path,
                          status: "uploaded" as const,
                          progress: 100,
                        }
                      : f
                  ),
                }));
              } else {
                throw new Error("Upload failed");
              }
            } catch (error: any) {
              // Mark this file as error
              set((state) => ({
                uploadFiles: state.uploadFiles.map((f, idx) =>
                  idx === fileIndex
                    ? {
                        ...f,
                        status: "error" as const,
                        error: error.response?.data?.detail || "Upload failed",
                      }
                    : f
                ),
              }));
            }
          }
        } finally {
          set({ isUploading: false });
        }
      },

      // Step 2: Process uploaded files (batch-process)
      processFiles: async (metadata) => {
        const state = get();
        const uploadedFiles = state.uploadFiles.filter(
          (f) => f.status === "uploaded" && f.resource_id
        );

        if (uploadedFiles.length === 0) {
          throw new Error("No uploaded files to process");
        }

        set({ isProcessing: true });

        try {
          const resourceIds = uploadedFiles
            .map((f) => f.resource_id)
            .filter((id): id is string => id !== null);

          const formatDateToISO = (date: Date | null) => {
            if (!date) return undefined;
            return date.toISOString();
          };

          const request: BatchProcessRequest = {
            resource_ids: resourceIds,
            processing_type: state.selectedProcessingType,
            effective_from: formatDateToISO(state.effectiveFrom),
            effective_to: formatDateToISO(state.effectiveTo),
            ...metadata,
          };

          await resourceApi.batchProcess(request);

          // Mark files as processing
          set((state) => ({
            uploadFiles: state.uploadFiles.map((f) =>
              resourceIds.includes(f.resource_id || "")
                ? { ...f, status: "processing" as const }
                : f
            ),
          }));

          // Close dialog and refresh list
          get().closeUploadDialog();
          await get().refreshResources();
        } catch (error: any) {
          set({
            error: error.response?.data?.detail || "Failed to process files",
          });
          throw error;
        } finally {
          set({ isProcessing: false });
        }
      },

      // Metadata setters
      setSelectedProcessingType: (type) => {
        set({ selectedProcessingType: type });
      },

      setEffectiveFrom: (date) => {
        set({ effectiveFrom: date });
      },

      setEffectiveTo: (date) => {
        set({ effectiveTo: date });
      },

      resetUploadState: () => {
        set({
          uploadFiles: [],
          isUploading: false,
          isProcessing: false,
          selectedProcessingType: "document_structured_llm",
          effectiveFrom: null,
          effectiveTo: null,
        });
      },

      // Misc
      setSelectedResource: (resource) => {
        set({ selectedResource: resource });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    { name: "ResourceStore" }
  )
);
