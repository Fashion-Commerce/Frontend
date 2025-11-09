import http1 from "@/lib/http1";

export interface Message {
  message_id: string;
  id?: string;
  user_id: string;
  session_id?: string;
  content: string;
  sender: "user" | "bot";
  agent_type?: string;
  created_at: string;
  updated_at: string;
}

export interface SendMessageRequest {
  content: string;
  session_id?: string;
}

export interface MessagesParams {
  page?: number;
  page_size?: number;
  session_id?: string;
}

export interface StreamChunk {
  content?: string;
  args?: any;
  name?: string;
  id?: string;
  finishReason?: string;
}

export const chatApi = {
  async sendMessage(data: SendMessageRequest): Promise<Message> {
    return apiClient.post<Message>("/messages", data);
  },

  async getMessages(params?: MessagesParams): Promise<Message[]> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.set(key, value.toString());
        }
      });
    }

    const url = `/messages${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return apiClient.get<Message[]>(url);
  },

  async streamChat(
    message: string,
    onChunk: (chunk: StreamChunk) => void,
    onError?: (error: Error) => void,
    onComplete?: () => void,
  ): Promise<void> {
    try {
      await apiClient.stream("/chat/stream", { message }, (chunk) => {
        onChunk(chunk);
      });
      onComplete?.();
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error(String(error)));
    }
  },
};
