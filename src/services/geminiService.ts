/**
 * Gemini AI Service
 * Xử lý logic chatbot, route agent, gọi AI API
 * Theo coding standards - service pattern
 */

import type { ChatMessage, Product, AgentType } from "@/types";
import { MessageSender } from "@/types";
import { AgentType as AgentEnum } from "@/types";
import { AGENT_KEYWORDS } from "@/constants";

// Mock data - sẽ được thay thế bằng API call thật
const MOCK_PRODUCTS: Product[] = [];

/**
 * Route tin nhắn user tới agent phù hợp
 * @param message - Tin nhắn từ user
 * @returns AgentType phù hợp
 */
export const routeToAgent = (message: string): AgentType => {
  const lowerMessage = message.toLowerCase();

  // Check SEARCH agent keywords
  if (AGENT_KEYWORDS.SEARCH.some((kw) => lowerMessage.includes(kw))) {
    return AgentEnum.SEARCH;
  }

  // Check ADVISOR agent keywords
  if (AGENT_KEYWORDS.ADVISOR.some((kw) => lowerMessage.includes(kw))) {
    return AgentEnum.ADVISOR;
  }

  // Check ORDER agent keywords
  if (AGENT_KEYWORDS.ORDER.some((kw) => lowerMessage.includes(kw))) {
    return AgentEnum.ORDER;
  }

  // Default to SYSTEM
  return AgentEnum.SYSTEM;
};

/**
 * Lấy response từ Gemini AI chatbot
 * @param userMessage - Tin nhắn từ user
 * @returns ChatMessage response từ bot
 */
export const getChatbotResponse = async (
  userMessage: string,
): Promise<ChatMessage> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const agent = routeToAgent(userMessage);
  const lowerMessage = userMessage.toLowerCase();

  let content = "";
  let suggestedProducts: Product[] = [];

  // SEARCH Agent Logic
  if (agent === AgentEnum.SEARCH) {
    content = `Tôi đang tìm kiếm sản phẩm phù hợp với yêu cầu "${userMessage}" của bạn...`;
    // TODO: Call real API to search products
    // suggestedProducts = await searchProducts(userMessage);
  }
  // ADVISOR Agent Logic
  else if (agent === AgentEnum.ADVISOR) {
    content = `Dựa trên yêu cầu của bạn, tôi gợi ý một số combo outfit phù hợp...`;
    // TODO: Call real API to get recommendations
    // suggestedProducts = await getRecommendations(userMessage);
  }
  // ORDER Agent Logic
  else if (agent === AgentEnum.ORDER) {
    if (
      lowerMessage.includes("xác nhận") ||
      lowerMessage.includes("đặt hàng")
    ) {
      content = `Đơn hàng của bạn đã được xác nhận! Chúng tôi sẽ giao hàng trong 2-3 ngày.`;
    } else if (
      lowerMessage.includes("giỏ hàng") ||
      lowerMessage.includes("cart")
    ) {
      content = `Bạn muốn xem giỏ hàng? Hãy click vào biểu tượng giỏ hàng ở góc trên cùng nhé!`;
    } else {
      content = `Tôi có thể giúp bạn hoàn tất đơn hàng. Bạn đã sẵn sàng thanh toán chưa?`;
    }
  }
  // SYSTEM Agent Logic (fallback)
  else {
    content = `Tôi có thể giúp bạn tìm kiếm sản phẩm, tư vấn outfit, hoặc đặt hàng. Bạn cần gì nhỉ?`;
  }

  return {
    id: Date.now() + Math.random(),
    content,
    sender: MessageSender.BOT,
    agent,
    suggestedProducts:
      suggestedProducts.length > 0 ? suggestedProducts : undefined,
  };
};

/**
 * Stream response từ Gemini AI (cho future implementation)
 * @param userMessage - Tin nhắn từ user
 * @param onChunk - Callback khi nhận được chunk
 */
export const streamChatbotResponse = async (
  userMessage: string,
  onChunk: (chunk: string) => void,
): Promise<void> => {
  // TODO: Implement streaming with Gemini AI API
  const response = await getChatbotResponse(userMessage);
  onChunk(response.content);
};
