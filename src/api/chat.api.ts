import http1 from "@/lib/http1";
import { http2 } from "@/lib/http2";

export interface FileMetadata {
  file_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_url: string;
  provider_name: string;
  markdown_content: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant";
  created_at: string;
  attachments?: FileMetadata[];
}

// Admin Chat Logs Types
export interface AdminConversation {
  user_id: string;
  user_email: string;
  user_fullname: string;
  total_messages: number;
  last_message_content: string;
  last_message_sender: "user" | "bot";
  last_message_at: string;
  first_message_at: string;
  has_attachments: boolean;
}

export interface AdminChatMessage {
  message_id: string;
  sender_type: "user" | "bot";
  content: string;
  artifacts: any;
  attachments: any[];
  created_at: string;
  updated_at: string | null;
}

export interface AdminUserInfo {
  user_id: string;
  email: string;
  fullname: string;
  total_messages: number;
  first_message_at: string;
  last_message_at: string;
}

export interface AdminChatLogsParams {
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface AdminChatDetailParams {
  page?: number;
  page_size?: number;
  sender_type_filter?: "user" | "bot";
}

export interface AdminChatLogsResponse {
  conversations: AdminConversation[];
  total_count: number;
  current_page: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
  success: boolean;
  message: string;
}

export interface AdminChatDetailResponse {
  user_info: AdminUserInfo;
  messages: AdminChatMessage[];
  total_count: number;
  current_page: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
  success: boolean;
  message: string;
}

export interface MessagesResponse {
  message: string;
  info: {
    data: {
      messages: Array<{
        message_id: string;
        sender_type: "user" | "bot";
        content: string;
        created_at: string;
        updated_at: string | null;
        artifacts: any;
        attachments: Array<{
          file_name: string;
          file_type: string;
          file_size: number;
          storage_path: string;
        }>;
      }>;
      total: number;
      page: number;
      page_size: number;
      total_pages: number;
    };
    message: string;
  };
}

export interface UploadFileResponse {
  message: string;
  info: {
    file_id: string;
    markdown_content: string;
    file_name: string;
    file_type: string;
    file_size: number;
    storage_url: string;
    processed_at: string;
    user_id: string;
    query: string | null;
    provider_name: string;
  };
}

export interface ChatStreamRequest {
  message: string;
  provider_llm?: string;
  provider_storage?: string;
  provider_embedding?: string;
  collection_name?: string;
  file_metadata?: FileMetadata[];
}

export const chatApi = {
  /**
   * Upload file and extract content as markdown
   */
  uploadFile: async (
    file: File,
    query?: string,
    providerName: string = "gemini-vision"
  ): Promise<UploadFileResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    if (query) {
      formData.append("query", query);
    }
    formData.append("provider_name", providerName);

    const response = await http1.post<UploadFileResponse>(
      "/v1/agents/chat/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response;
  },

  /**
   * Stream chat with agent - returns abort function
   */
  streamChat: (
    request: ChatStreamRequest,
    onMessage: (data: string) => void,
    onArtifact: (artifacts: any) => void,
    onError: (error: any) => void,
    onComplete: () => void
  ): (() => void) => {
    const token = http1.getToken();
    const controller = new AbortController();

    fetch(`${http1.getBaseURL()}/v1/agents/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error("No reader available");
        }

        try {
          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              onComplete();
              break;
            }

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6).trim();

                if (data === "[DONE]") {
                  onComplete();
                  return;
                }

                try {
                  const parsed = JSON.parse(data);

                  // Handle message chunks
                  if (parsed.type === "message_chunk" && parsed.content) {
                    onMessage(parsed.content);
                  }

                  // Handle artifacts (product search results, etc.)
                  if (
                    parsed.type === "artifact" ||
                    parsed.name === "artifact"
                  ) {
                    console.log("🎯 Artifact event detected:", parsed);
                    if (parsed.artifacts) {
                      console.log(
                        "📦 Calling onArtifact with:",
                        parsed.artifacts
                      );
                      onArtifact(parsed.artifacts);
                    }
                  }

                  // Backward compatibility: if no type field, treat as message
                  if (!parsed.type && !parsed.name && parsed.content) {
                    onMessage(parsed.content);
                  }
                } catch (e) {
                  // If not JSON, treat as plain text
                  onMessage(data);
                }
              }
            }
          }
        } catch (error) {
          if (error instanceof Error && error.name !== "AbortError") {
            onError(error);
          }
        }
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          onError(error);
        }
      });

    // Return abort function
    return () => {
      controller.abort();
    };
  },

  /**
   * Get paginated message history
   */
  getMessages: async (
    page: number = 1,
    pageSize: number = 10
  ): Promise<MessagesResponse> => {
    const response = await http1.get<MessagesResponse>("/v1/messages", {
      params: {
        page,
        page_size: pageSize,
      },
    });
    return response;
  },

  /**
   * Delete all messages for current user
   */
  deleteAllMessages: async (): Promise<{
    success: boolean;
    message: string;
    deleted_count: number;
  }> => {
    const response = await http1.delete<any>("/v1/messages");
    return response.info;
  },

  /**
   * Get all chat logs for admin - conversation summaries
   */
  getAdminChatLogs: async (
    params?: AdminChatLogsParams
  ): Promise<AdminChatLogsResponse> => {
    const response = await http1.get<any>("/v1/admin/messages/chat-logs", {
      params: {
        page: params?.page || 1,
        page_size: params?.page_size || 20,
        sort_by: params?.sort_by || "last_message_at",
        sort_order: params?.sort_order || "desc",
      },
    });
    return response.info;
  },

  /**
   * Get detailed chat history for a specific user (Admin only)
   */
  getAdminChatDetail: async (
    userId: string,
    params?: AdminChatDetailParams
  ): Promise<AdminChatDetailResponse> => {
    const response = await http1.get<any>(
      `/v1/admin/messages/chat-logs/${userId}`,
      {
        params: {
          page: params?.page || 1,
          page_size: params?.page_size || 10,
          sender_type_filter: params?.sender_type_filter,
        },
      }
    );
    return response.info;
  },
};
