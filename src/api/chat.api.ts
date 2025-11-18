import http1 from "@/lib/http1";

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

export interface MessagesResponse {
  message: string;
  info: {
    data: {
      messages: Array<{
        id: string;
        user_id: string;
        sender_type: "user" | "bot";
        content: string;
        created_at: string;
        updated_at: string | null;
        artifacts: any;
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
};
