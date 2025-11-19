import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Flex,
  Text,
  VStack,
  HStack,
  Input,
  Spinner,
  Badge,
  Image,
  Grid,
  SimpleGrid,
} from "@chakra-ui/react";
import { Avatar } from "@/components/ui/avatar";
import { toast } from "react-toastify";
import {
  Search,
  MessageCircle,
  User,
  Bot,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  chatApi,
  AdminConversation,
  AdminChatDetailResponse,
  AdminChatMessage,
} from "@/api/chat.api";

const ChatLogs: React.FC = () => {
  const [conversations, setConversations] = useState<AdminConversation[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [chatDetail, setChatDetail] = useState<AdminChatDetailResponse | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);
  const [loadingMoreConversations, setLoadingMoreConversations] =
    useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [messagePage, setMessagePage] = useState(1);
  const [hasMoreConversations, setHasMoreConversations] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const conversationsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations(1);
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      fetchChatDetail(selectedUserId, messagePage);
    }
  }, [selectedUserId, messagePage]);

  const fetchConversations = async (page: number) => {
    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMoreConversations(true);
    }

    try {
      const response = await chatApi.getAdminChatLogs({
        page,
        page_size: 20,
        sort_by: "last_message_at",
        sort_order: "desc",
      });

      if (page === 1) {
        setConversations(response.conversations);
      } else {
        setConversations((prev) => [...prev, ...response.conversations]);
      }

      setHasMoreConversations(response.has_next);
      setCurrentPage(page);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error fetching chat logs");
    } finally {
      setLoading(false);
      setLoadingMoreConversations(false);
    }
  };

  const fetchChatDetail = async (userId: string, page: number) => {
    if (page === 1) {
      setLoadingDetail(true);
    } else {
      setLoadingMoreMessages(true);
    }

    try {
      const newDetail = await chatApi.getAdminChatDetail(userId, {
        page,
        page_size: 10,
      });

      if (page === 1) {
        setChatDetail(newDetail);
        setTimeout(() => scrollToBottom(), 100);
      } else {
        setChatDetail((prev) => {
          if (!prev) return newDetail;
          return {
            ...newDetail,
            messages: [...newDetail.messages, ...prev.messages],
          };
        });
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Error fetching chat detail"
      );
    } finally {
      setLoadingDetail(false);
      setLoadingMoreMessages(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleMessageScroll = () => {
    if (!messagesContainerRef.current || !chatDetail) return;

    const { scrollTop } = messagesContainerRef.current;

    if (scrollTop === 0 && chatDetail.has_next && !loadingMoreMessages) {
      setMessagePage((prev) => prev + 1);
    }
  };

  const handleConversationScroll = () => {
    if (!conversationsContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } =
      conversationsContainerRef.current;

    // Check if scrolled to bottom (with 10px threshold)
    if (
      scrollHeight - scrollTop - clientHeight < 10 &&
      hasMoreConversations &&
      !loadingMoreConversations
    ) {
      fetchConversations(currentPage + 1);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.user_fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.user_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Flex h="calc(100vh - 8rem)" gap={4}>
      {/* Left Panel - Conversation List */}
      <Box
        w="400px"
        bg="white"
        borderRadius="lg"
        boxShadow="sm"
        overflow="hidden"
      >
        <VStack gap={0} h="full">
          {/* Search Header */}
          <Box w="full" p={4} borderBottom="1px solid" borderColor="gray.200">
            <Box position="relative">
              <Box
                position="absolute"
                left={3}
                top="50%"
                transform="translateY(-50%)"
                pointerEvents="none"
              >
                <Search size={18} color="gray" />
              </Box>
              <Input
                pl={10}
                placeholder="Tìm kiếm theo tên hoặc email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Box>
          </Box>

          {/* Conversation List */}
          <VStack
            gap={0}
            w="full"
            flex={1}
            overflowY="auto"
            ref={conversationsContainerRef}
            onScroll={handleConversationScroll}
          >
            {loading ? (
              <Flex justify="center" align="center" h="full">
                <Spinner size="lg" color="blue.500" />
              </Flex>
            ) : filteredConversations.length === 0 ? (
              <Flex justify="center" align="center" h="full">
                <Text color="gray.500">Không có cuộc trò chuyện nào</Text>
              </Flex>
            ) : (
              <>
                {filteredConversations.map((conv) => (
                  <Box
                    key={conv.user_id}
                    w="full"
                    p={4}
                    cursor="pointer"
                    bg={
                      selectedUserId === conv.user_id
                        ? "blue.50"
                        : "transparent"
                    }
                    borderBottom="1px solid"
                    borderColor="gray.200"
                    _hover={{ bg: "gray.50" }}
                    onClick={() => {
                      setSelectedUserId(conv.user_id);
                      setMessagePage(1);
                    }}
                    transition="background 0.2s"
                  >
                    <HStack gap={3} alignItems="start">
                      <Box w="32px" h="32px" flexShrink={0}>
                        <Avatar
                          name={conv.user_fullname}
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.user_id}`}
                        />
                      </Box>
                      <VStack flex={1} alignItems="start" gap={1}>
                        <HStack justify="space-between" w="full">
                          <Text fontWeight="600" fontSize="sm">
                            {conv.user_fullname}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {formatTime(conv.last_message_at)}
                          </Text>
                        </HStack>
                        <Text fontSize="xs" color="gray.600">
                          {conv.user_email}
                        </Text>
                        <Text fontSize="xs" color="gray.500" lineClamp={2}>
                          {truncateText(conv.last_message_content, 60)}
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                ))}

                {loadingMoreConversations && (
                  <Flex justify="center" py={4}>
                    <Spinner size="sm" color="blue.500" />
                    <Text ml={2} fontSize="sm" color="gray.500">
                      Đang tải thêm...
                    </Text>
                  </Flex>
                )}
              </>
            )}
          </VStack>
        </VStack>
      </Box>

      {/* Right Panel - Chat Detail */}
      <Box
        flex={1}
        bg="white"
        borderRadius="lg"
        boxShadow="sm"
        overflow="hidden"
      >
        {!selectedUserId ? (
          <Flex
            h="full"
            direction="column"
            justify="center"
            align="center"
            color="gray.400"
          >
            <MessageCircle size={64} />
            <Text mt={4} fontSize="lg">
              Chọn một cuộc trò chuyện để xem chi tiết
            </Text>
          </Flex>
        ) : loadingDetail ? (
          <Flex h="full" justify="center" align="center">
            <Spinner size="xl" color="blue.500" />
          </Flex>
        ) : chatDetail ? (
          <VStack gap={0} h="full">
            {/* Chat Header */}
            <Box
              w="full"
              p={4}
              borderBottom="1px solid"
              borderColor="gray.200"
              bg="gray.50"
            >
              <HStack gap={3}>
                <Avatar name={chatDetail.user_info.fullname} size="md" />
                <VStack alignItems="start" gap={0}>
                  <Text fontWeight="600">{chatDetail.user_info.fullname}</Text>
                  <Text fontSize="sm" color="gray.600">
                    {chatDetail.user_info.email}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    Tổng {chatDetail.user_info.total_messages} tin nhắn
                  </Text>
                </VStack>
              </HStack>
            </Box>

            {/* Messages Container */}
            <Box
              flex={1}
              w="full"
              overflowY="auto"
              p={4}
              bg="gray.50"
              ref={messagesContainerRef}
              onScroll={handleMessageScroll}
            >
              {loadingMoreMessages && (
                <Flex justify="center" mb={4}>
                  <Spinner size="sm" color="blue.500" />
                  <Text ml={2} fontSize="sm" color="gray.500">
                    Đang tải tin nhắn cũ hơn...
                  </Text>
                </Flex>
              )}

              <VStack gap={4} alignItems="stretch">
                {chatDetail.messages.map((message) => (
                  <MessageBubble
                    key={message.message_id}
                    message={message}
                    formatTime={formatTime}
                  />
                ))}
                <div ref={messagesEndRef} />
              </VStack>
            </Box>
          </VStack>
        ) : null}
      </Box>
    </Flex>
  );
};

// Message Bubble Component
interface MessageBubbleProps {
  message: AdminChatMessage;
  formatTime: (timestamp: string) => string;
}

interface ArtifactProduct {
  id: string;
  name: string;
  base_price: number;
  image_urls: string[];
  description: string;
  review_count: number;
  average_rating: number;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  formatTime,
}) => {
  const isUser = message.sender_type === "user";
  const [currentPage, setCurrentPage] = useState(1);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const PRODUCTS_PER_PAGE = 4;

  // Extract products from artifacts
  const products = React.useMemo(() => {
    if (!message.artifacts) return undefined;

    let rawProducts: ArtifactProduct[] | undefined;

    if (Array.isArray(message.artifacts)) {
      const productArtifact = message.artifacts.find(
        (artifact: any) => artifact.type === "product_search_results"
      );
      rawProducts = productArtifact?.data as ArtifactProduct[] | undefined;
    } else if (
      message.artifacts.type === "product_search_results" &&
      message.artifacts.data
    ) {
      rawProducts = message.artifacts.data as ArtifactProduct[] | undefined;
    }

    if (rawProducts && Array.isArray(rawProducts)) {
      const uniqueProducts = rawProducts.filter(
        (product, index, self) =>
          index === self.findIndex((p) => p.id === product.id)
      );
      return uniqueProducts;
    }

    return rawProducts;
  }, [message.artifacts]);

  const totalPages = products
    ? Math.ceil(products.length / PRODUCTS_PER_PAGE)
    : 0;
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const currentProducts = products?.slice(startIndex, endIndex);

  // Filter image attachments
  const imageAttachments = React.useMemo(() => {
    if (!message.attachments || message.attachments.length === 0) return [];

    const images = message.attachments
      .filter((att: any) => {
        const ext = (att.file_type?.toLowerCase() || "").replace(/^\./, "");
        return ["jpg", "jpeg", "png", "gif", "webp", "bmp", "tiff"].includes(
          ext
        );
      })
      .map((att: any) => ({
        ...att,
        image_url: att.storage_url || att.storage_path, // Support both field names
      }))
      .slice(0, 5);

    return images;
  }, [message.attachments]);

  const nonImageAttachments = React.useMemo(() => {
    if (!message.attachments || message.attachments.length === 0) return [];
    return message.attachments.filter((att: any) => {
      const ext = (att.file_type?.toLowerCase() || "").replace(/^\./, "");
      return !["jpg", "jpeg", "png", "gif", "webp", "bmp", "tiff"].includes(
        ext
      );
    });
  }, [message.attachments]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  React.useEffect(() => {
    setCurrentPage(1);
  }, [products]);

  return (
    <Flex justify={isUser ? "flex-end" : "flex-start"} w="full">
      <VStack
        alignItems={isUser ? "flex-end" : "flex-start"}
        gap={2}
        maxW="75%"
      >
        {/* Image Attachments */}
        {imageAttachments.length > 0 && (
          <HStack gap={2} flexWrap="wrap">
            {imageAttachments.map((att: any, idx: number) => (
              <Box
                key={idx}
                w="100px"
                h="100px"
                borderRadius="md"
                overflow="hidden"
                cursor="pointer"
                boxShadow="sm"
                onClick={() => setImagePreview(att.image_url)}
              >
                <Image
                  src={att.image_url}
                  alt={att.file_name}
                  w="full"
                  h="full"
                  objectFit="cover"
                />
              </Box>
            ))}
          </HStack>
        )}

        {/* Message Bubble */}
        <HStack
          gap={2}
          flexDirection={isUser ? "row-reverse" : "row"}
          alignItems="start"
        >
          <Box
            p={2}
            bg={isUser ? "blue.500" : "white"}
            borderRadius="full"
            flexShrink={0}
          >
            {isUser ? (
              <User size={16} color="white" />
            ) : (
              <Bot size={16} color="#3182CE" />
            )}
          </Box>

          <VStack alignItems={isUser ? "flex-end" : "flex-start"} gap={1}>
            {/* Non-image attachments */}
            {nonImageAttachments.length > 0 && (
              <HStack gap={2} mb={1}>
                {nonImageAttachments.map((att: any, idx: number) => (
                  <HStack
                    key={idx}
                    px={2}
                    py={1}
                    bg="gray.100"
                    borderRadius="md"
                    fontSize="xs"
                  >
                    <FileText size={12} />
                    <Text>{att.file_name}</Text>
                  </HStack>
                ))}
              </HStack>
            )}

            <Box
              px={4}
              py={3}
              borderRadius="lg"
              bg={isUser ? "blue.500" : "white"}
              color={isUser ? "white" : "black"}
              boxShadow="sm"
            >
              <Text fontSize="sm" whiteSpace="pre-wrap">
                {message.content}
              </Text>
            </Box>
            <Text fontSize="xs" color="gray.500" px={2}>
              {formatTime(message.created_at)}
            </Text>
          </VStack>
        </HStack>

        {/* Product Artifacts Grid */}
        {products && products.length > 0 && (
          <Box w="full" mt={2}>
            <Text fontSize="xs" color="gray.600" mb={2}>
              Tìm thấy {products.length} sản phẩm
            </Text>

            <SimpleGrid columns={2} gap={3}>
              {currentProducts?.map((product) => (
                <Box
                  key={product.id}
                  bg="white"
                  borderRadius="lg"
                  overflow="hidden"
                  boxShadow="sm"
                  border="1px solid"
                  borderColor="gray.200"
                  _hover={{ boxShadow: "md" }}
                  transition="all 0.2s"
                >
                  <Image
                    src={product.image_urls[0]}
                    alt={product.name}
                    h="140px"
                    w="full"
                    objectFit="cover"
                  />
                  <Box p={3}>
                    <Text
                      fontSize="xs"
                      fontWeight="600"
                      lineClamp={2}
                      mb={1}
                      h="32px"
                    >
                      {product.name}
                    </Text>
                    <Text
                      fontSize="sm"
                      fontWeight="bold"
                      color="blue.600"
                      mb={1}
                    >
                      {formatPrice(product.base_price)}
                    </Text>
                    <HStack gap={2} fontSize="xs" color="gray.600">
                      <Text>⭐ {product.average_rating.toFixed(1)}</Text>
                      <Text>({product.review_count} đánh giá)</Text>
                    </HStack>
                  </Box>
                </Box>
              ))}
            </SimpleGrid>

            {/* Pagination */}
            {totalPages > 1 && (
              <HStack justify="center" mt={3} gap={2}>
                <Box
                  as="button"
                  p={1}
                  borderRadius="md"
                  bg="white"
                  border="1px solid"
                  borderColor="gray.300"
                  opacity={currentPage === 1 ? 0.5 : 1}
                  cursor={currentPage === 1 ? "not-allowed" : "pointer"}
                  onClick={() =>
                    currentPage > 1 && setCurrentPage((p) => Math.max(1, p - 1))
                  }
                  pointerEvents={currentPage === 1 ? "none" : "auto"}
                >
                  <ChevronLeft size={16} />
                </Box>
                <Text fontSize="xs" color="gray.600">
                  {currentPage} / {totalPages}
                </Text>
                <Box
                  as="button"
                  p={1}
                  borderRadius="md"
                  bg="white"
                  border="1px solid"
                  borderColor="gray.300"
                  opacity={currentPage === totalPages ? 0.5 : 1}
                  cursor={
                    currentPage === totalPages ? "not-allowed" : "pointer"
                  }
                  onClick={() =>
                    currentPage < totalPages &&
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  pointerEvents={currentPage === totalPages ? "none" : "auto"}
                >
                  <ChevronRight size={16} />
                </Box>
              </HStack>
            )}
          </Box>
        )}

        {/* Image Preview Modal */}
        {imagePreview && (
          <Box
            position="fixed"
            inset={0}
            bg="blackAlpha.700"
            zIndex={9999}
            display="flex"
            alignItems="center"
            justifyContent="center"
            onClick={() => setImagePreview(null)}
          >
            <Image
              src={imagePreview}
              alt="Preview"
              maxH="90vh"
              maxW="90vw"
              borderRadius="lg"
              boxShadow="2xl"
            />
          </Box>
        )}
      </VStack>
    </Flex>
  );
};

export default ChatLogs;
