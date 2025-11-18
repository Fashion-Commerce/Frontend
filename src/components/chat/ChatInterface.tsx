import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Textarea,
  IconButton,
  Button,
  Card,
  Spinner,
  Image,
  Badge,
  Dialog,
  MenuRoot,
  MenuTrigger,
  MenuContent,
  MenuItem,
  Grid,
} from "@chakra-ui/react";
import {
  Send,
  X,
  FileText,
  Image as ImageIcon,
  Mic,
  MicOff,
  Star,
  ShoppingCart,
  Paperclip,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useChatStore, type ChatMessage } from "@/stores/chatStore";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";
import { chatApi, type FileMetadata } from "@/api/chat.api";
import ProductDetailModal from "@/components/ProductDetailModal";
import type { Product as ProductType } from "@/types";
import { marked } from "marked";
import katex from "katex";
import "katex/dist/katex.min.css";
import "./markdown.css";

// Configure marked
marked.setOptions({
  breaks: true,
  gfm: true,
});

interface UploadedFileDisplay {
  file: File;
  metadata?: FileMetadata;
  preview?: string;
  uploading?: boolean;
  error?: string;
}

// Use Product type from artifact data
interface ArtifactProduct {
  id: string;
  name: string;
  base_price: number;
  image_urls: string[];
  description: string;
  review_count: number;
  average_rating: number;
  brand_id?: string;
  category_id?: string;
}

const renderMarkdown = (content: string): string => {
  if (!content) return "";

  try {
    let processed = content;

    // Process math expressions
    processed = processed.replace(/\\\[(.*?)\\\]/gs, (match, math) => {
      try {
        return katex.renderToString(math, {
          displayMode: true,
          throwOnError: false,
        });
      } catch (e) {
        return match;
      }
    });

    processed = processed.replace(/\\\((.*?)\\\)/gs, (match, math) => {
      try {
        return katex.renderToString(math, {
          displayMode: false,
          throwOnError: false,
        });
      } catch (e) {
        return match;
      }
    });

    // Convert markdown
    const html = marked(processed) as string;
    return html;
  } catch (error) {
    console.error("Markdown rendering error:", error);
    return content;
  }
};

export const ChatInterface: React.FC = () => {
  const {
    messages,
    isStreaming,
    uploadedFiles,
    collectionName,
    isLoadingHistory,
    hasMoreHistory,
    sendStreamMessage,
    addUploadedFile,
    removeUploadedFile,
    updateUploadedFile,
    clearUploadedFiles,
    setError,
    loadMessageHistory,
  } = useChatStore();

  const { addToCart } = useCartStore();
  const { user } = useAuthStore();

  const [userQuestion, setUserQuestion] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [imagePreviewDialog, setImagePreviewDialog] = useState(false);
  const [previewImageData, setPreviewImageData] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(
    null
  );

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const abortControllerRef = useRef<(() => void) | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);
  const previousScrollHeight = useRef(0);

  // Animated placeholder
  const [animatedPlaceholder, setAnimatedPlaceholder] =
    useState("Nhập tin nhắn...");
  const placeholderTexts = [
    "Tìm sản phẩm theo yêu cầu của bạn",
    "Hỏi về thông tin sản phẩm",
    "Tìm kiếm và so sánh sản phẩm",
    "Hỗ trợ tư vấn mua sắm",
  ];
  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Scroll to bottom
  const scrollToBottom = useCallback((smooth = true) => {
    if (chatContainerRef.current) {
      const scrollOptions: ScrollIntoViewOptions = {
        behavior: smooth ? "smooth" : "auto",
        block: "end",
      };
      chatContainerRef.current.scrollIntoView(scrollOptions);
    }
  }, []);

  // Handle scroll
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      100;
    setShowScrollButton(!isNearBottom);

    // Load more when scrolling near top
    const isNearTop = container.scrollTop < 100;
    if (
      isNearTop &&
      !isLoadingHistory &&
      hasMoreHistory &&
      !isLoadingRef.current
    ) {
      isLoadingRef.current = true;
      previousScrollHeight.current = container.scrollHeight;
      loadMessageHistory().finally(() => {
        isLoadingRef.current = false;
        // Maintain scroll position after loading
        if (scrollContainerRef.current) {
          const newScrollHeight = scrollContainerRef.current.scrollHeight;
          const scrollDiff = newScrollHeight - previousScrollHeight.current;
          scrollContainerRef.current.scrollTop += scrollDiff;
        }
      });
    }
  }, [isLoadingHistory, hasMoreHistory, loadMessageHistory]);

  // Animated placeholder effect
  useEffect(() => {
    const currentText = placeholderTexts[currentPlaceholderIndex];
    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          const nextLength = animatedPlaceholder.length + 1;
          if (nextLength <= currentText.length) {
            setAnimatedPlaceholder(currentText.substring(0, nextLength));
          } else {
            setTimeout(() => setIsDeleting(true), 1500);
          }
        } else {
          const nextLength = animatedPlaceholder.length - 1;
          if (nextLength >= 0) {
            setAnimatedPlaceholder(currentText.substring(0, nextLength));
          } else {
            setIsDeleting(false);
            setCurrentPlaceholderIndex(
              (prev) => (prev + 1) % placeholderTexts.length
            );
          }
        }
      },
      isDeleting ? 30 : 50
    );

    return () => clearTimeout(timeout);
  }, [animatedPlaceholder, currentPlaceholderIndex, isDeleting]);

  // Scroll when messages change
  useEffect(() => {
    scrollToBottom(true);
  }, [messages, scrollToBottom]);

  // Load initial history on mount
  useEffect(() => {
    loadMessageHistory(1);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current();
      }
      if (recognitionRef.current && isRecording) {
        recognitionRef.current.stop();
      }
    };
  }, [isRecording]);

  // File upload handling
  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const maxFiles = 5;
    const maxTotalSize = 200 * 1024 * 1024; // 200MB

    if (uploadedFiles.length + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`, {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    const totalSize = Array.from(files).reduce((sum, f) => sum + f.size, 0);
    if (totalSize > maxTotalSize) {
      toast.error("Total file size must be less than 200MB", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    for (const file of Array.from(files)) {
      const isImage = file.type.startsWith("image/");
      const preview = isImage ? URL.createObjectURL(file) : undefined;

      addUploadedFile({
        file,
        preview,
        uploading: true,
      });

      try {
        const response = await chatApi.uploadFile(file);
        const fileIndex = uploadedFiles.length;

        updateUploadedFile(fileIndex, {
          uploading: false,
          metadata: {
            file_id: response.info.file_id,
            file_name: response.info.file_name,
            file_type: response.info.file_type,
            file_size: response.info.file_size,
            storage_url: response.info.storage_url,
            provider_name: response.info.provider_name,
            markdown_content: response.info.markdown_content,
          },
        });

        toast.success(`${file.name} uploaded successfully`, {
          position: "top-right",
          autoClose: 2000,
        });
      } catch (error: any) {
        const fileIndex = uploadedFiles.length;
        updateUploadedFile(fileIndex, {
          uploading: false,
          error: error.message || "Upload failed",
        });

        toast.error(error.message || "Failed to upload file", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    }
  };

  // Send message
  const handleSendMessage = async () => {
    const trimmedMessage = userQuestion.trim();
    if (!trimmedMessage || isStreaming) return;

    const fileMetadata = uploadedFiles
      .filter((f) => f.metadata)
      .map((f) => f.metadata!);

    try {
      const abortFn = await sendStreamMessage(trimmedMessage, fileMetadata);
      abortControllerRef.current = abortFn;

      setUserQuestion("");
      clearUploadedFiles();
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to send message", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // Textarea auto-resize
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserQuestion(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 240) + "px";
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Voice recording (Web Speech API)
  const initSpeechRecognition = () => {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      toast.error("Speech recognition is not supported in this browser", {
        position: "top-right",
        autoClose: 3000,
      });
      return null;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "vi-VN";

    recognition.onresult = (event: any) => {
      let interimText = "";
      let finalText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += transcript + " ";
        } else {
          interimText += transcript;
        }
      }

      if (finalText) {
        setUserQuestion((prev) => prev + finalText);
        setInterimTranscript("");
      } else {
        setInterimTranscript(interimText);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    return recognition;
  };

  const toggleVoiceRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      if (!recognitionRef.current) {
        recognitionRef.current = initSpeechRecognition();
      }
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsRecording(true);
      }
    }
  };

  // Drag and drop
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  return (
    <>
      <ToastContainer />
      <Box
        className="h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Container maxW="6xl" className="flex-1 flex flex-col py-4 px-4">
          {/* Messages Area - Takes remaining space */}
          <Box
            ref={scrollContainerRef}
            flex="1"
            className="overflow-y-auto px-2 mb-4"
            onScroll={handleScroll}
          >
            <VStack gap={4} className="pb-4" ref={chatContainerRef}>
              {isLoadingHistory && (
                <HStack justify="center" className="py-4">
                  <Spinner size="sm" className="text-blue-500" />
                  <Text className="text-sm text-gray-500 dark:text-gray-400">
                    Đang tải tin nhắn cũ...
                  </Text>
                </HStack>
              )}

              {messages.length === 0 && !isLoadingHistory ? (
                <Box className="text-center py-20">
                  <Text className="text-xl text-gray-400 dark:text-gray-500">
                    Bắt đầu cuộc trò chuyện
                  </Text>
                </Box>
              ) : (
                messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    onProductClick={(product) => {
                      // Convert ArtifactProduct to ProductType
                      const productType: ProductType = {
                        ...product,
                        id: product.id,
                        product_id: product.id,
                        name: product.name,
                        price: product.base_price,
                        base_price: product.base_price,
                        imageUrls: product.image_urls,
                        image_urls: product.image_urls,
                        description: product.description,
                        reviewCount: product.review_count,
                        review_count: product.review_count,
                        averageRating: product.average_rating,
                        average_rating: product.average_rating,
                      } as ProductType;
                      setSelectedProduct(productType);
                    }}
                  />
                ))
              )}

              {isStreaming && (
                <HStack className="gap-2 px-4">
                  <Spinner size="sm" className="text-blue-500" />
                  <Text className="text-sm text-gray-500 dark:text-gray-400">
                    Đang trả lời...
                  </Text>
                </HStack>
              )}
            </VStack>

            {/* Scroll to bottom button */}
            {showScrollButton && (
              <IconButton
                position="absolute"
                bottom={4}
                right={4}
                aria-label="Scroll to bottom"
                onClick={() => scrollToBottom(true)}
                className="shadow-lg bg-blue-500 hover:bg-blue-600 text-white rounded-full"
                size="sm"
              >
                ↓
              </IconButton>
            )}
          </Box>

          {/* Bottom Section - Fixed at bottom */}
          <VStack gap={2} className="w-full">
            {/* File Upload Preview */}
            {uploadedFiles.length > 0 && (
              <Card.Root className="w-full border border-gray-200 dark:border-gray-700">
                <Card.Body className="p-3">
                  <HStack gap={2} flexWrap="wrap">
                    {uploadedFiles.map((file, index) => (
                      <FilePreview
                        key={index}
                        file={file}
                        onRemove={() => removeUploadedFile(index)}
                        onPreview={() => {
                          if (file.preview) {
                            setPreviewImageData(file.preview);
                            setImagePreviewDialog(true);
                          }
                        }}
                      />
                    ))}
                  </HStack>
                </Card.Body>
              </Card.Root>
            )}

            {/* Input Area */}
            <Card.Root className="w-full shadow-lg border border-gray-200 dark:border-gray-700">
              <Card.Body className="p-3">
                <HStack gap={2}>
                  {/* Paperclip Upload Button */}
                  <IconButton
                    aria-label="Upload files"
                    onClick={() => fileInputRef.current?.click()}
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700"
                  >
                    <Paperclip size={20} />
                  </IconButton>

                  {/* Textarea */}
                  <Textarea
                    ref={textareaRef}
                    value={
                      isRecording && interimTranscript
                        ? interimTranscript
                        : userQuestion
                    }
                    onChange={handleTextareaChange}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      isRecording && interimTranscript
                        ? interimTranscript
                        : animatedPlaceholder
                    }
                    className="resize-none border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 rounded-lg"
                    rows={1}
                    maxH="240px"
                  />

                  {/* Voice Button */}
                  <IconButton
                    aria-label="Voice input"
                    onClick={toggleVoiceRecording}
                    className={
                      isRecording
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700"
                    }
                    size="sm"
                  >
                    {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                  </IconButton>

                  {/* Send Button */}
                  <IconButton
                    aria-label="Send message"
                    onClick={handleSendMessage}
                    disabled={!userQuestion.trim() || isStreaming}
                    className="bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg"
                    size="sm"
                  >
                    <Send size={20} />
                  </IconButton>
                </HStack>
              </Card.Body>
            </Card.Root>
          </VStack>
        </Container>

        {/* Drag Drop Overlay */}
        {isDragging && (
          <Box
            position="fixed"
            inset={0}
            className="bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm"
          >
            <Card.Root className="border-2 border-dashed border-blue-400 bg-white/95 dark:bg-gray-800/95 shadow-2xl">
              <Card.Body className="text-center p-10">
                <Paperclip
                  size={64}
                  className="mx-auto mb-4 text-blue-500 animate-bounce"
                />
                <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Thả tệp vào đây
                </Text>
                <Text className="text-sm text-gray-600 dark:text-gray-400">
                  Hỗ trợ PDF, DOCX, XLSX, và ảnh (tối đa 5 tệp, 200MB)
                </Text>
              </Card.Body>
            </Card.Root>
          </Box>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.xlsx,.jpg,.jpeg,.png,.gif,.bmp,.webp,.tiff"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          aria-label="File upload"
        />

        {/* Image Preview Dialog */}
        <Dialog.Root
          open={imagePreviewDialog}
          onOpenChange={(e) => setImagePreviewDialog(e.open)}
        >
          <Dialog.Backdrop className="bg-black/70 backdrop-blur-sm" />
          <Dialog.Positioner>
            <Dialog.Content className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl">
              <Dialog.Header className="border-b border-gray-200 dark:border-gray-700 p-4">
                <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
                  Xem trước ảnh
                </Dialog.Title>
              </Dialog.Header>
              <Dialog.Body className="p-6">
                {previewImageData && (
                  <Image
                    src={previewImageData}
                    alt="Preview"
                    maxH="500px"
                    objectFit="contain"
                    className="w-full rounded-lg"
                  />
                )}
              </Dialog.Body>
              <Dialog.CloseTrigger className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" />
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>

        {/* Product Detail Modal */}
        {selectedProduct && (
          <ProductDetailModal
            product={selectedProduct}
            relatedProducts={[]}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={async (product, variant, quantity) => {
              if (!user?.user_id) {
                toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng", {
                  position: "top-right",
                  autoClose: 2000,
                });
                return;
              }

              const success = await addToCart(
                user.user_id,
                variant.variant_id,
                quantity
              );
            }}
            onProductClick={(product) =>
              setSelectedProduct(product as ProductType)
            }
            onToggleWishlist={() => {}}
            isWishlisted={false}
            wishlist={[]}
          />
        )}
      </Box>
    </>
  );
};

// Message Bubble Component
const MessageBubble: React.FC<{
  message: ChatMessage;
  onProductClick?: (product: ArtifactProduct) => void;
}> = ({ message, onProductClick }) => {
  const isUser = message.role === "user";
  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 6;

  // Extract products from artifacts (handles both array and object formats)
  const products = React.useMemo(() => {
    if (!message.artifacts) {
      return undefined;
    }

    let rawProducts: ArtifactProduct[] | undefined;

    // Case 1: artifacts is an array (from streaming)
    if (Array.isArray(message.artifacts)) {
      const productArtifact = message.artifacts.find(
        (artifact: any) => artifact.type === "product_search_results"
      );
      rawProducts = productArtifact?.data as ArtifactProduct[] | undefined;
    }
    // Case 2: artifacts is an object (from history API)
    else if (
      message.artifacts.type === "product_search_results" &&
      message.artifacts.data
    ) {
      rawProducts = message.artifacts.data as ArtifactProduct[] | undefined;
    }

    // Remove duplicates based on product id
    if (rawProducts && Array.isArray(rawProducts)) {
      const uniqueProducts = rawProducts.filter(
        (product, index, self) =>
          index === self.findIndex((p) => p.id === product.id)
      );
      return uniqueProducts;
    }

    return rawProducts;
  }, [message.artifacts]);

  // Calculate pagination
  const totalPages = products
    ? Math.ceil(products.length / PRODUCTS_PER_PAGE)
    : 0;
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const currentProducts = products?.slice(startIndex, endIndex);

  // Reset to page 1 when products change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [products]);

  return (
    <HStack
      w="full"
      justify={isUser ? "flex-end" : "flex-start"}
      align="start"
      gap={3}
      className="group"
    >
      {/* Avatar - Show for AI */}
      {!isUser && (
        <Box className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
          <Text className="text-white text-sm font-bold">AI</Text>
        </Box>
      )}

      <VStack align={isUser ? "end" : "start"} gap={2} maxW="75%">
        {/* Message Card */}
        <Card.Root
          className={
            isUser
              ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg"
              : "bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700"
          }
        >
          <Card.Body className="p-4">
            {/* File Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <VStack align="start" gap={2} mb={3}>
                {message.attachments.map((att, idx) => (
                  <Badge
                    key={idx}
                    className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded-full text-xs font-medium"
                  >
                    <FileText size={12} className="inline mr-1" />
                    {att.file_name}
                  </Badge>
                ))}
              </VStack>
            )}

            {/* Message Content */}
            <Box
              className={`markdown-content ${isUser ? "text-white" : ""}`}
              dangerouslySetInnerHTML={{
                __html: renderMarkdown(message.content),
              }}
            />

            {/* Timestamp */}
            <Text
              className={`text-xs mt-2 ${
                isUser ? "opacity-80" : "text-gray-500"
              }`}
            >
              {new Date(message.timestamp).toLocaleTimeString()}
            </Text>
          </Card.Body>
        </Card.Root>

        {/* Product Artifacts Grid */}
        {products && products.length > 0 && (
          <Box className="w-full mt-2">
            <HStack justify="space-between" mb={3}>
              <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Sản phẩm tìm được ({products.length})
              </Text>
              {totalPages > 1 && (
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  Trang {currentPage}/{totalPages}
                </Text>
              )}
            </HStack>

            <Box className="relative">
              {/* Left Navigation Button */}
              {totalPages > 1 && (
                <IconButton
                  position="absolute"
                  left="-12"
                  top="50%"
                  transform="translateY(-50%)"
                  zIndex={10}
                  size="sm"
                  aria-label="Trang trước"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed disabled:text-gray-500 rounded-full shadow-lg"
                >
                  <ChevronLeft size={18} />
                </IconButton>
              )}

              <Grid
                templateColumns="repeat(auto-fill, minmax(200px, 1fr))"
                gap={3}
              >
                {currentProducts?.map((product) => (
                  <Card.Root
                    key={product.id}
                    className="overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-200 dark:border-gray-700 group/card cursor-pointer"
                    onClick={() => onProductClick?.(product)}
                  >
                    <Card.Body className="p-0">
                      {/* Product Image */}
                      <Box className="relative overflow-hidden bg-gray-100 dark:bg-gray-700 h-48">
                        {product.image_urls && product.image_urls[0] ? (
                          <Image
                            src={product.image_urls[0]}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <Box className="w-full h-full flex items-center justify-center">
                            <FileText size={48} className="text-gray-400" />
                          </Box>
                        )}
                        {/* Rating Badge */}
                        {product.average_rating > 0 && (
                          <Badge className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                            <Star size={12} className="fill-current" />
                            {product.average_rating.toFixed(1)}
                          </Badge>
                        )}
                      </Box>

                      {/* Product Info */}
                      <Box className="p-3">
                        <Text className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2 min-h-[2.5rem]">
                          {product.name}
                        </Text>

                        {/* Price & Reviews */}
                        <HStack justify="space-between" mb={3}>
                          <Text className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            {product.base_price?.toLocaleString("vi-VN") || "0"}
                            ₫
                          </Text>
                          {product.review_count > 0 && (
                            <Text className="text-xs text-gray-500">
                              ({product.review_count} đánh giá)
                            </Text>
                          )}
                        </HStack>
                      </Box>
                    </Card.Body>
                  </Card.Root>
                ))}
              </Grid>

              {/* Right Navigation Button */}
              {totalPages > 1 && (
                <IconButton
                  position="absolute"
                  right="-12"
                  top="50%"
                  transform="translateY(-50%)"
                  zIndex={10}
                  size="sm"
                  aria-label="Trang sau"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed disabled:text-gray-500 rounded-full shadow-lg"
                >
                  <ChevronRight size={18} />
                </IconButton>
              )}
            </Box>
          </Box>
        )}
      </VStack>

      {/* Avatar - Show for User */}
      {isUser && (
        <Box className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center flex-shrink-0 shadow-md">
          <Text className="text-white text-sm font-bold">U</Text>
        </Box>
      )}
    </HStack>
  );
};

// File Preview Component
const FilePreview: React.FC<{
  file: UploadedFileDisplay;
  onRemove: () => void;
  onPreview: () => void;
}> = ({ file, onRemove, onPreview }) => {
  const isImage = file.file.type.startsWith("image/");

  return (
    <Card.Root className="relative border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
      <Card.Body className="p-3">
        <HStack gap={3}>
          {isImage && file.preview ? (
            <Image
              src={file.preview}
              alt={file.file.name}
              boxSize="50px"
              objectFit="cover"
              className="rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
              onClick={onPreview}
            />
          ) : (
            <Box className="w-12 h-12 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
              <FileText
                size={24}
                className="text-gray-600 dark:text-gray-400"
              />
            </Box>
          )}
          <VStack align="start" gap={0} flex="1">
            <Text className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[150px]">
              {file.file.name}
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              {(file.file.size / 1024).toFixed(2)} KB
            </Text>
            {file.uploading && <Spinner size="xs" className="mt-1" />}
            {file.error && (
              <Text className="text-xs text-red-500 dark:text-red-400 mt-1">
                {file.error}
              </Text>
            )}
          </VStack>
          <IconButton
            aria-label="Remove file"
            size="xs"
            className="text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            onClick={onRemove}
          >
            <X size={16} />
          </IconButton>
        </HStack>
      </Card.Body>
    </Card.Root>
  );
};

export default ChatInterface;
