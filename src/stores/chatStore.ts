import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { chatApi, type Message, type StreamChunk } from "../api/chat.api";

export interface ChatMessage {
  id: number;
  sender: "user" | "bot";
  content: string;
  agent?: string;
  timestamp: string;
}

interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  activeAgent: string;
  sessionId: string;
  error: string | null;

  // Actions
  sendMessage: (content: string) => Promise<void>;
  sendStreamMessage: (content: string) => Promise<void>;
  loadMessages: (sessionId?: string) => Promise<void>;
  clearMessages: () => void;
  generateSessionId: () => string;
  setSessionId: (sessionId: string) => void;
  clearError: () => void;
}

export const useChatStore = create<ChatState>()(
  devtools(
    (set, get) => ({
      messages: [],
      isTyping: false,
      activeAgent: "system",
      sessionId: "",
      error: null,

      sendMessage: async (content: string) => {
        if (!content.trim()) return;

        const userMessage: ChatMessage = {
          id: Date.now(),
          sender: "user",
          content: content.trim(),
          timestamp: new Date().toISOString(),
        };

        set((state) => ({
          messages: [...state.messages, userMessage],
          isTyping: true,
          error: null,
        }));

        try {
          const { sessionId } = get();
          await chatApi.sendMessage({
            content: content.trim(),
            session_id: sessionId,
          });

          // Simulate bot response (in real app, this comes from API)
          setTimeout(() => {
            const botMessage: ChatMessage = {
              id: Date.now() + 1,
              sender: "bot",
              content: "Tôi đã nhận được tin nhắn của bạn.",
              timestamp: new Date().toISOString(),
            };

            set((state) => ({
              messages: [...state.messages, botMessage],
              isTyping: false,
            }));
          }, 1000);
        } catch (error: any) {
          set({
            error: error.message || "Failed to send message",
            isTyping: false,
          });
        }
      },

      sendStreamMessage: async (content: string) => {
        if (!content.trim()) return;

        const userMessage: ChatMessage = {
          id: Date.now(),
          sender: "user",
          content: content.trim(),
          timestamp: new Date().toISOString(),
        };

        set((state) => ({
          messages: [...state.messages, userMessage],
          isTyping: true,
          activeAgent: "search",
          error: null,
        }));

        let botMessageContent = "";
        let currentAgent = "system";

        try {
          await chatApi.streamChat(
            content,
            (chunk: StreamChunk) => {
              if (chunk.content) {
                botMessageContent += chunk.content;
              }

              if (chunk.name) {
                currentAgent = chunk.name;
                set({ activeAgent: currentAgent });
              }

              // Update or add bot message
              set((state) => {
                const messages = [...state.messages];
                const lastMessage = messages[messages.length - 1];

                if (lastMessage && lastMessage.sender === "bot") {
                  // Update existing bot message
                  lastMessage.content = botMessageContent;
                  lastMessage.agent = currentAgent;
                } else {
                  // Add new bot message
                  messages.push({
                    id: Date.now() + 1,
                    sender: "bot",
                    content: botMessageContent,
                    agent: currentAgent,
                    timestamp: new Date().toISOString(),
                  });
                }

                return { messages };
              });
            },
            (error) => {
              console.error("Stream error:", error);
              set({
                error: error.message || "Stream error",
                isTyping: false,
              });
            },
            () => {
              set({ isTyping: false });
            },
          );
        } catch (error: any) {
          set({
            error: error.message || "Failed to send message",
            isTyping: false,
          });
        }
      },

      loadMessages: async (sessionId) => {
        try {
          const messages = await chatApi.getMessages({
            session_id: sessionId,
            page_size: 100,
          });

          const chatMessages: ChatMessage[] = messages.map((msg, index) => ({
            id: index,
            sender: msg.sender,
            content: msg.content,
            agent: msg.agent_type,
            timestamp: msg.created_at,
          }));

          set({ messages: chatMessages });
        } catch (error: any) {
          set({ error: error.message || "Failed to load messages" });
        }
      },

      clearMessages: () => {
        set({ messages: [], error: null });
      },

      generateSessionId: () => {
        const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        set({ sessionId });
        return sessionId;
      },

      setSessionId: (sessionId: string) => {
        set({ sessionId });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    { name: "ChatStore" },
  ),
);
