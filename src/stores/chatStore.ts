import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  chatApi,
  type FileMetadata,
  type ChatStreamRequest,
} from "../api/chat.api";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  attachments?: FileMetadata[];
  artifacts?: {
    data?: any[];
    tool?: string;
    type?: string;
    metadata?: any;
  };
}

export interface UploadedFile {
  file: File;
  metadata?: FileMetadata;
  preview?: string;
  uploading?: boolean;
  error?: string;
}

interface ChatState {
  messages: ChatMessage[];
  isStreaming: boolean;
  uploadedFiles: UploadedFile[];
  error: string | null;
  collectionName: string;
  currentPage: number;
  totalPages: number;
  isLoadingHistory: boolean;
  hasMoreHistory: boolean;

  addMessage: (message: ChatMessage) => void;
  updateLastMessage: (content: string) => void;
  updateLastMessageArtifacts: (artifacts: any) => void;
  sendStreamMessage: (
    content: string,
    fileMetadata?: FileMetadata[]
  ) => Promise<() => void>;
  setIsStreaming: (isStreaming: boolean) => void;
  clearMessages: () => void;
  setError: (error: string | null) => void;
  addUploadedFile: (file: UploadedFile) => void;
  removeUploadedFile: (index: number) => void;
  updateUploadedFile: (index: number, updates: Partial<UploadedFile>) => void;
  clearUploadedFiles: () => void;
  setCollectionName: (name: string) => void;
  loadMessageHistory: (page?: number) => Promise<void>;
  prependMessages: (messages: ChatMessage[]) => void;
}

export const useChatStore = create<ChatState>()(
  devtools(
    (set, get) => ({
      messages: [],
      isStreaming: false,
      uploadedFiles: [],
      error: null,
      collectionName: "chatbot-foxai",
      currentPage: 0,
      totalPages: 0,
      isLoadingHistory: false,
      hasMoreHistory: true,

      addMessage: (message: ChatMessage) => {
        set((state) => ({
          messages: [...state.messages, message],
        }));
      },

      updateLastMessage: (content: string) => {
        set((state) => {
          const messages = [...state.messages];
          if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.role === "assistant") {
              lastMessage.content += content;
            }
          }
          return { messages };
        });
      },

      updateLastMessageArtifacts: (artifacts: any) => {
        console.log("📦 Received artifacts:", artifacts);
        set((state) => {
          const messages = [...state.messages];
          if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.role === "assistant") {
              lastMessage.artifacts = artifacts;
              console.log("✅ Updated message with artifacts:", lastMessage);
            }
          }
          return { messages };
        });
      },

      sendStreamMessage: async (
        content: string,
        fileMetadata?: FileMetadata[]
      ) => {
        const { collectionName } = get();

        // Transform fileMetadata to match API format for preview display
        const transformedAttachments = fileMetadata?.map((meta) => ({
          file_id: meta.file_id,
          file_name: meta.file_name,
          file_type: meta.file_type,
          file_size: meta.file_size,
          storage_url: meta.storage_url,
          storage_path: meta.storage_url, // Use storage_url as preview
          provider_name: meta.provider_name,
          markdown_content: meta.markdown_content,
        }));

        const userMessage: ChatMessage = {
          id: `user-${Date.now()}`,
          role: "user",
          content: content.trim(),
          timestamp: new Date().toISOString(),
          attachments: transformedAttachments as any,
        };

        console.log("📨 Created userMessage with attachments:", userMessage);

        set((state) => ({
          messages: [...state.messages, userMessage],
        }));

        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: "",
          timestamp: new Date().toISOString(),
        };

        set((state) => ({
          messages: [...state.messages, assistantMessage],
          isStreaming: true,
          error: null,
        }));

        const request: ChatStreamRequest = {
          message: content.trim(),
          collection_name: collectionName,
          file_metadata: fileMetadata,
        };

        const abortFn = chatApi.streamChat(
          request,
          (data: string) => {
            get().updateLastMessage(data);
          },
          (artifacts: any) => {
            get().updateLastMessageArtifacts(artifacts);
          },
          (error: any) => {
            set({
              error: error.message || "Failed to stream chat",
              isStreaming: false,
            });
          },
          () => {
            set({ isStreaming: false });
          }
        );

        return abortFn;
      },

      setIsStreaming: (isStreaming: boolean) => {
        set({ isStreaming });
      },

      clearMessages: () => {
        set({ messages: [] });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      addUploadedFile: (file: UploadedFile) => {
        set((state) => ({
          uploadedFiles: [...state.uploadedFiles, file],
        }));
      },

      removeUploadedFile: (index: number) => {
        set((state) => ({
          uploadedFiles: state.uploadedFiles.filter((_, i) => i !== index),
        }));
      },

      updateUploadedFile: (index: number, updates: Partial<UploadedFile>) => {
        set((state) => {
          const files = [...state.uploadedFiles];
          files[index] = { ...files[index], ...updates };
          return { uploadedFiles: files };
        });
      },

      clearUploadedFiles: () => {
        set({ uploadedFiles: [] });
      },

      setCollectionName: (name: string) => {
        set({ collectionName: name });
      },

      loadMessageHistory: async (page?: number) => {
        const { currentPage, isLoadingHistory, hasMoreHistory } = get();

        if (isLoadingHistory || !hasMoreHistory) return;

        const nextPage = page || currentPage + 1;

        set({ isLoadingHistory: true, error: null });

        try {
          const response = await chatApi.getMessages(nextPage, 10);
          const { messages: apiMessages, total_pages } = response.info.data;

          console.log("API Messages:", apiMessages);

          // Transform API messages to ChatMessage format
          // Note: API returns newest first, we need to reverse for prepending
          const transformedMessages: ChatMessage[] = apiMessages
            .reverse()
            .map((msg: any) => {
              const transformed: ChatMessage = {
                id: msg.message_id,
                role: (msg.sender_type === "user" ? "user" : "assistant") as
                  | "user"
                  | "assistant",
                content: msg.content,
                timestamp: msg.created_at,
                attachments:
                  msg.attachments && msg.attachments.length > 0
                    ? msg.attachments.map((att: any) => ({
                        file_id: att.file_id || "",
                        file_name: att.file_name,
                        file_type: att.file_type,
                        file_size: att.file_size,
                        storage_url: att.storage_path,
                        storage_path: att.storage_path, // Keep original for compatibility
                        provider_name: att.provider_name || "",
                        markdown_content: att.markdown_content || "",
                      }))
                    : undefined,
                artifacts: msg.artifacts,
              };

              if (
                transformed.attachments &&
                transformed.attachments.length > 0
              ) {
                console.log("Message with attachments:", transformed);
              }

              return transformed;
            });

          set((state) => ({
            messages: [...transformedMessages, ...state.messages],
            currentPage: nextPage,
            totalPages: total_pages,
            hasMoreHistory: nextPage < total_pages,
            isLoadingHistory: false,
          }));
        } catch (error: any) {
          set({
            error: error.message || "Failed to load message history",
            isLoadingHistory: false,
          });
        }
      },

      prependMessages: (newMessages: ChatMessage[]) => {
        set((state) => ({
          messages: [...newMessages, ...state.messages],
        }));
      },
    }),
    { name: "ChatStore" }
  )
);
