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

      sendStreamMessage: async (
        content: string,
        fileMetadata?: FileMetadata[]
      ) => {
        const { collectionName } = get();

        const userMessage: ChatMessage = {
          id: `user-${Date.now()}`,
          role: "user",
          content: content.trim(),
          timestamp: new Date().toISOString(),
          attachments: fileMetadata,
        };

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
            .map((msg) => ({
              id: msg.id,
              role: msg.sender_type === "user" ? "user" : "assistant",
              content: msg.content,
              timestamp: msg.created_at,
              attachments: undefined,
              artifacts: msg.artifacts,
            }));

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
