import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  X,
  FileText,
  Mic,
  MicOff,
  Paperclip,
  ChevronLeft,
  ChevronRight,
  Trash2,
  ArrowDown,
  Sparkles,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useChatStore } from "@/stores/chatStore";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";
import { chatApi, type FileMetadata } from "@/api/chat.api";
import ProductDetailModal from "@/components/ProductDetailModal";
import type { Product as ProductType } from "@/types";
import { marked } from "marked";
import katex from "katex";
import "katex/dist/katex.min.css";
import "./chat/markdown.css";
import { Dialog, Button, Portal, Text, Flex } from "@chakra-ui/react";

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
  uploadProgress?: number;
  error?: string;
}

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

    const html = marked(processed) as string;
    return html;
  } catch (error) {
    console.error("Markdown rendering error:", error);
    return content;
  }
};

const Chatbot: React.FC = () => {
  const {
    messages,
    isStreaming,
    uploadedFiles,
    isLoadingHistory,
    hasMoreHistory,
    sendStreamMessage,
    addUploadedFile,
    removeUploadedFile,
    updateUploadedFile,
    clearUploadedFiles,
    loadMessageHistory,
    clearMessages,
  } = useChatStore();

  const { addToCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();

  const [inputValue, setInputValue] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [imagePreviewDialog, setImagePreviewDialog] = useState(false);
  const [previewImageData, setPreviewImageData] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeletingMessages, setIsDeletingMessages] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
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
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "end",
      });
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
  }, [
    animatedPlaceholder,
    currentPlaceholderIndex,
    isDeleting,
    placeholderTexts,
  ]);

  // Scroll when messages change
  useEffect(() => {
    scrollToBottom(true);
  }, [messages, scrollToBottom]);

  // Load initial history when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadMessageHistory(1);
    }
  }, [isAuthenticated, loadMessageHistory]);

  // Clear messages when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      clearMessages();
      clearUploadedFiles();
    }
  }, [isAuthenticated, clearMessages, clearUploadedFiles]);

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

  // Handle paste event for images
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      if (!isAuthenticated) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            const fileList = new DataTransfer();
            fileList.items.add(file);
            await handleFileSelect(fileList.files);
          }
        }
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [isAuthenticated, uploadedFiles]);

  // File upload handling
  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const maxFiles = 5;
    const maxTotalSize = 200 * 1024 * 1024;

    if (uploadedFiles.length + files.length > maxFiles) {
      toast.error(`Tối đa ${maxFiles} tệp`, {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    const totalSize = Array.from(files).reduce((sum, f) => sum + f.size, 0);
    if (totalSize > maxTotalSize) {
      toast.error("Tổng kích thước tệp phải nhỏ hơn 200MB", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    // Upload all files in parallel
    const uploadPromises = Array.from(files).map(async (file, i) => {
      const isImage = file.type.startsWith("image/");
      const preview = isImage ? URL.createObjectURL(file) : undefined;

      addUploadedFile({ file, preview, uploading: true, uploadProgress: 0 });
      const currentIndex = uploadedFiles.length + i;

      // Simulate upload progress gradually to 99%
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress = Math.min(progress + Math.random() * 10 + 5, 99);
        updateUploadedFile(currentIndex, { uploadProgress: progress });
      }, 200);

      try {
        const response = await chatApi.uploadFile(file);
        clearInterval(progressInterval);

        // Complete progress to 100%
        updateUploadedFile(currentIndex, {
          uploading: false,
          uploadProgress: 100,
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

        // Remove progress indicator after 500ms
        setTimeout(() => {
          updateUploadedFile(currentIndex, { uploadProgress: undefined });
        }, 500);

        toast.success(`${file.name} đã tải lên`, {
          position: "top-right",
          autoClose: 2000,
        });
      } catch (error: any) {
        clearInterval(progressInterval);
        updateUploadedFile(currentIndex, {
          uploading: false,
          uploadProgress: undefined,
          error: error.message || "Tải lên thất bại",
        });

        toast.error(error.message || "Tải lên thất bại", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    });

    // Wait for all uploads to complete
    await Promise.all(uploadPromises);
  };

  // Send message
  const handleSendMessage = async () => {
    const trimmedMessage = inputValue.trim();
    if (!trimmedMessage || isStreaming) return;

    // Check if any file is still uploading
    const hasUploadingFiles = uploadedFiles.some(
      (f) =>
        f.uploading ||
        (f.uploadProgress !== undefined && f.uploadProgress < 100)
    );

    if (hasUploadingFiles) {
      toast.warning("Vui lòng đợi file tải lên hoàn tất", {
        position: "top-right",
        autoClose: 2000,
      });
      return;
    }

    const fileMetadata = uploadedFiles
      .filter((f) => f.metadata)
      .map((f) => f.metadata!);

    console.log("Sending message with fileMetadata:", fileMetadata);

    try {
      const abortFn = await sendStreamMessage(trimmedMessage, fileMetadata);
      abortControllerRef.current = abortFn;

      setInputValue("");
      clearUploadedFiles();
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (error: any) {
      toast.error(error.message || "Gửi tin nhắn thất bại", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // Textarea auto-resize
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Voice recording
  const initSpeechRecognition = () => {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      toast.error("Trình duyệt không hỗ trợ nhận dạng giọng nói", {
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
        setInputValue((prev) => prev + finalText);
        setInterimTranscript("");
      } else {
        setInterimTranscript(interimText);
      }
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    return recognition;
  };

  // Delete all messages handler
  const handleDeleteAllMessages = async () => {
    setIsDeletingMessages(true);
    try {
      const result = await chatApi.deleteAllMessages();
      if (result.success) {
        clearMessages();
        toast.success(`Đã xóa ${result.deleted_count} tin nhắn`, {
          position: "top-right",
          autoClose: 2000,
        });
      }
    } catch (error: any) {
      toast.error(error.message || "Không thể xóa tin nhắn", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsDeletingMessages(false);
      setDeleteDialogOpen(false);
    }
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <>
      <ToastContainer />
      <div
        id="chatbot-panel"
        className={`${
          isExpanded
            ? "fixed inset-0 z-50 w-full h-full"
            : "w-[30%] h-full flex-shrink-0"
        } flex flex-col shadow-2xl transition-all duration-300`}
        style={{
          backgroundColor: "#1A2A4E",
          borderRight: "1px solid rgba(200, 155, 109, 0.2)",
        }}
      >
        {/* Header */}
        <div
          className="p-4 flex items-center justify-between text-white shadow-md"
          style={{ borderBottom: "1px solid rgba(200, 155, 109, 0.3)" }}
        >
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                style={{
                  backgroundColor: "#0F1A2E",
                  border: "3px solid #C89B6D",
                }}
              >
                <img
                  src="/img/logobg.png"
                  alt="AgentFashion"
                  className="h-6 w-auto"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
              <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-lime-400 ring-2 ring-white"></span>
            </div>
            <div>
              <h2
                className="text-lg font-bold flex items-center gap-2"
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  color: "#C89B6D",
                }}
              >
                AgentFashion AI
                <Sparkles className="h-4 w-4" />
              </h2>
              <p
                className="text-xs"
                style={{ color: "rgba(255, 255, 255, 0.7)" }}
              >
                Smart Fashion Assistant
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDeleteDialogOpen(true)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Xóa tất cả tin nhắn"
            >
              <Trash2 className="h-5 w-5" />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title={isExpanded ? "Thu nhỏ" : "Mở rộng"}
            >
              {isExpanded ? (
                <X className="h-6 w-6" />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
          onScroll={handleScroll}
        >
          {isLoadingHistory && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
            </div>
          )}

          {!isAuthenticated ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔒</div>
              <h3
                className="text-xl font-bold mb-2"
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  color: "#C89B6D",
                }}
              >
                Vui lòng đăng nhập
              </h3>
              <p className="text-sm" style={{ color: "#FFFFFF" }}>
                Bạn cần đăng nhập để trò chuyện với Agent
              </p>
            </div>
          ) : messages.length === 0 && !isLoadingHistory ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">👋</div>
              <h3
                className="text-xl font-bold mb-2"
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  color: "#C89B6D",
                }}
              >
                Chào mừng bạn!
              </h3>
              <p className="text-sm" style={{ color: "#FFFFFF" }}>
                Tôi có thể giúp bạn tìm kiếm và tư vấn sản phẩm
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                onProductClick={(product) => {
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
                formatPrice={formatPrice}
              />
            ))
          )}

          {isStreaming && (
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shadow-md"
                style={{ backgroundColor: "#C89B6D" }}
              >
                <span className="text-white text-sm font-bold">AI</span>
              </div>
              <div
                className="rounded-2xl px-4 py-3 shadow-md"
                style={{ backgroundColor: "rgba(200, 155, 109, 0.15)" }}
              >
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-orange-600 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-orange-600 rounded-full animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Scroll to bottom button */}
        {showScrollButton && (
          <button
            onClick={() => scrollToBottom(true)}
            className={`absolute ${
              isExpanded ? "bottom-32 right-8" : "bottom-32 right-6"
            } bg-orange-600 hover:bg-orange-700 text-white rounded-full p-3 shadow-lg transition-all duration-300`}
            title="Cuộn xuống cuối"
          >
            <ArrowDown className="h-5 w-5" />
          </button>
        )}

        {/* File Upload Preview */}
        {uploadedFiles.length > 0 && (
          <div className="px-4 pb-2">
            <div
              className="rounded-lg p-3"
              style={{ backgroundColor: "rgba(200, 155, 109, 0.1)" }}
            >
              <div className="flex gap-3 overflow-x-auto">
                {uploadedFiles.map((f, idx) => (
                  <FilePreview
                    key={idx}
                    file={f}
                    onRemove={() => removeUploadedFile(idx)}
                    onPreview={() => {
                      if (f.preview) {
                        setPreviewImageData(f.preview);
                        setImagePreviewDialog(true);
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div
          className="p-3 shadow-lg rounded-2xl m-2"
          style={{ backgroundColor: "#FFFFFF" }}
        >
          <div className="flex items-end gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={!isAuthenticated}
              className="p-2 rounded-lg transition-colors hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ color: "#C89B6D" }}
              title={isAuthenticated ? "Đính kèm tệp" : "Vui lòng đăng nhập"}
            >
              <Paperclip className="h-5 w-5" />
            </button>

            <textarea
              ref={textareaRef}
              value={
                isRecording && interimTranscript
                  ? interimTranscript
                  : inputValue
              }
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              disabled={!isAuthenticated}
              placeholder={
                !isAuthenticated
                  ? "Vui lòng đăng nhập để trò chuyện..."
                  : isRecording && interimTranscript
                  ? interimTranscript
                  : animatedPlaceholder
              }
              className="flex-1 resize-none rounded-lg px-4 py-2 focus:outline-none focus:ring-2 max-h-32 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                backgroundColor: "#F4F6F8",
                color: "#333333",
                borderColor: "#E9ECEF",
                border: "1px solid #E9ECEF",
              }}
              rows={1}
            />

            <button
              onClick={toggleVoiceRecording}
              disabled={!isAuthenticated}
              className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isRecording
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "hover:opacity-80"
              }`}
              style={!isRecording ? { color: "#C89B6D" } : {}}
              title={
                !isAuthenticated
                  ? "Vui lòng đăng nhập"
                  : isRecording
                  ? "Dừng ghi âm"
                  : "Ghi âm"
              }
            >
              {isRecording ? (
                <MicOff className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </button>

            <button
              onClick={handleSendMessage}
              disabled={
                !isAuthenticated ||
                !inputValue.trim() ||
                isStreaming ||
                uploadedFiles.some(
                  (f) =>
                    f.uploading ||
                    (f.uploadProgress !== undefined && f.uploadProgress < 100)
                )
              }
              className="text-white p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:opacity-90"
              style={{ backgroundColor: "#C89B6D" }}
              title={
                !isAuthenticated
                  ? "Vui lòng đăng nhập"
                  : uploadedFiles.some(
                      (f) =>
                        f.uploading ||
                        (f.uploadProgress !== undefined &&
                          f.uploadProgress < 100)
                    )
                  ? "Đang tải file lên..."
                  : "Gửi tin nhắn"
              }
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.docx,.xlsx,.jpg,.jpeg,.png,.gif,.bmp,.webp,.tiff"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Image Preview Dialog */}
      {imagePreviewDialog && previewImageData && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setImagePreviewDialog(false)}
        >
          <div className="max-w-4xl max-h-[90vh] p-4">
            <img
              src={previewImageData}
              alt="Preview"
              className="rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}

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

            await addToCart(user.user_id, variant.variant_id, quantity);
          }}
          onProductClick={(product) =>
            setSelectedProduct(product as ProductType)
          }
          onToggleWishlist={() => {}}
          isWishlisted={false}
          wishlist={[]}
        />
      )}

      {/* Delete Messages Confirmation Dialog */}
      <Dialog.Root
        open={deleteDialogOpen}
        onOpenChange={(e) => {
          setDeleteDialogOpen(e.open);
        }}
      >
        <Portal>
          <Dialog.Backdrop className="!bg-black/50" />
          <Dialog.Positioner className="flex items-center justify-center">
            <Dialog.Content className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4">
              <Dialog.Header className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <Dialog.Title className="text-2xl font-bold text-red-600">
                  Xác nhận xóa tin nhắn
                </Dialog.Title>
              </Dialog.Header>

              <Dialog.Body className="px-6 py-6">
                <Text>
                  Bạn có chắc chắn muốn xóa{" "}
                  <span className="font-bold">tất cả tin nhắn</span> không?
                </Text>
                <Text color="red.500" fontSize="sm" mt={2}>
                  Hành động này không thể hoàn tác!
                </Text>
              </Dialog.Body>

              <Dialog.Footer className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <Flex justify="flex-end" gap={3}>
                  <Dialog.CloseTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={() => setDeleteDialogOpen(false)}
                      className="border-2 border-gray-200 hover:border-gray-300 rounded-lg px-4 py-2"
                    >
                      Hủy
                    </Button>
                  </Dialog.CloseTrigger>
                  <Button
                    className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-2"
                    onClick={handleDeleteAllMessages}
                    loading={isDeletingMessages}
                    disabled={isDeletingMessages}
                  >
                    Xóa tất cả
                  </Button>
                </Flex>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
};

// Message Bubble Component
const MessageBubble: React.FC<{
  message: any;
  onProductClick?: (product: ArtifactProduct) => void;
  formatPrice: (price: number) => string;
}> = ({ message, onProductClick, formatPrice }) => {
  const isUser = message.role === "user";
  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 6;

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

  React.useEffect(() => {
    setCurrentPage(1);
  }, [products]);

  // Filter image attachments
  const imageAttachments = React.useMemo(() => {
    if (!message.attachments || message.attachments.length === 0) return [];

    console.log(
      "Processing attachments for message:",
      message.id,
      message.attachments
    );

    const images = message.attachments
      .filter((att: any) => {
        const ext = (att.file_type?.toLowerCase() || "").replace(/^\./, "");
        const isImage = [
          "jpg",
          "jpeg",
          "png",
          "gif",
          "webp",
          "bmp",
          "tiff",
        ].includes(ext);
        console.log(
          "Attachment:",
          att.file_name,
          "ext:",
          ext,
          "isImage:",
          isImage
        );
        return isImage;
      })
      .slice(0, 5);

    console.log("Filtered image attachments:", images);
    return images;
  }, [message.attachments, message.id]);

  const nonImageAttachments = React.useMemo(() => {
    if (!message.attachments || message.attachments.length === 0) return [];
    return message.attachments.filter((att: any) => {
      const ext = (att.file_type?.toLowerCase() || "").replace(/^\./, "");
      return !["jpg", "jpeg", "png", "gif", "webp", "bmp", "tiff"].includes(
        ext
      );
    });
  }, [message.attachments]);

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} group`}>
      <div
        className={`flex flex-col ${
          isUser ? "items-end" : "items-start"
        } max-w-[80%]`}
      >
        {!isUser && (
          <div
            className="w-8 h-8 ml-3 rounded-full flex items-center justify-center flex-shrink-0 shadow-md"
            style={{
              backgroundColor: "#0F1A2E",
              border: "2px solid #C89B6D",
            }}
          >
            <img
              src="/img/logobg.png"
              alt="AgentFashion"
              className="h-4 w-auto"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        )}

        {/* Image Attachments - Outside bubble */}
        {imageAttachments.length > 0 && (
          <div className="w-full mb-2 overflow-x-auto">
            <div className="flex gap-2 pb-1">
              {imageAttachments.map((att: any, idx: number) => {
                const imageUrl = att.storage_url || att.storage_path;
                return (
                  <img
                    key={idx}
                    src={imageUrl}
                    alt={att.file_name}
                    className="h-32 w-auto object-cover rounded-lg shadow-md cursor-pointer hover:opacity-90 transition-opacity flex-shrink-0"
                    onClick={() => window.open(imageUrl, "_blank")}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Message Card */}
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser ? "text-white rounded-br-none shadow-md" : "rounded-bl-none"
          }`}
          style={isUser ? { backgroundColor: "#C89B6D" } : {}}
        >
          {/* Non-Image File Attachments */}
          {nonImageAttachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {nonImageAttachments.map((att: any, idx: number) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded-full text-xs font-medium"
                >
                  <FileText size={12} />
                  {att.file_name}
                </span>
              ))}
            </div>
          )}

          {/* Message Content */}
          <div
            className="markdown-content text-sm"
            style={{ color: isUser ? "#FFFFFF" : "#FFFFFF" }}
            dangerouslySetInnerHTML={{
              __html: renderMarkdown(message.content),
            }}
          />

          {/* Timestamp */}
          <p
            className={`text-xs mt-2`}
            style={{ color: isUser ? "rgba(255, 255, 255, 0.8)" : "#C89B6D" }}
          >
            {new Date(message.timestamp).toLocaleTimeString("vi-VN")}
          </p>
        </div>

        {/* Product Artifacts Grid */}
        {products && products.length > 0 && (
          <div className="w-full mt-2">
            <div className="flex justify-between items-center mb-2">
              <span
                className="text-xs font-semibold"
                style={{ color: "#C89B6D" }}
              >
                Sản phẩm tìm được ({products.length})
              </span>
              {totalPages > 1 && (
                <span className="text-xs" style={{ color: "#FFFFFF" }}>
                  Trang {currentPage}/{totalPages}
                </span>
              )}
            </div>

            <div className="relative">
              {totalPages > 1 && currentPage > 1 && (
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 bg-orange-600 text-white rounded-full p-1 shadow-lg hover:bg-orange-700"
                >
                  <ChevronLeft size={16} />
                </button>
              )}

              <div className="grid grid-cols-3 md:grid-cols-2 gap-3 md:gap-4">
                {currentProducts?.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => onProductClick?.(product)}
                    className="bg-white dark:bg-orange-950 rounded-lg p-3 cursor-pointer hover:shadow-lg transition-all border border-orange-300 dark:border-orange-700 group w-full"
                  >
                    <img
                      src={product.image_urls[0]}
                      alt={product.name}
                      className="w-full aspect-square object-cover rounded-md mb-2"
                    />
                    <h4 className="text-sm font-semibold text-orange-900 dark:text-amber-100 line-clamp-2 mb-2 min-h-[2.5rem]">
                      {product.name}
                    </h4>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-orange-700 dark:text-orange-400">
                        {formatPrice(product.base_price)}
                      </p>
                      <span className="text-xs text-orange-600 dark:text-orange-400">
                        ⭐ {product.average_rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && currentPage < totalPages && (
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 bg-orange-600 text-white rounded-full p-1 shadow-lg hover:bg-orange-700"
                >
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// File Preview Component with Circular Progress
const FilePreview: React.FC<{
  file: UploadedFileDisplay;
  onRemove: () => void;
  onPreview: () => void;
}> = ({ file, onRemove, onPreview }) => {
  const isImage = file.file.type.startsWith("image/");
  const progress = file.uploadProgress || 0;
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div
      className="relative inline-block rounded-lg p-2"
      style={{
        backgroundColor: "rgba(200, 155, 109, 0.15)",
        border: "1px solid rgba(200, 155, 109, 0.3)",
      }}
    >
      <div className="flex items-center gap-2">
        <div className="relative w-12 h-12">
          {isImage && file.preview ? (
            <img
              src={file.preview}
              alt={file.file.name}
              className="w-12 h-12 object-cover rounded cursor-pointer hover:opacity-80"
              onClick={onPreview}
            />
          ) : (
            <div
              className="w-12 h-12 flex items-center justify-center rounded"
              style={{ backgroundColor: "rgba(200, 155, 109, 0.2)" }}
            >
              <FileText size={24} style={{ color: "#C89B6D" }} />
            </div>
          )}

          {/* Circular Progress Overlay */}
          {file.uploadProgress !== undefined && file.uploadProgress < 100 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded">
              <svg className="w-12 h-12 transform -rotate-90">
                <circle
                  cx="24"
                  cy="24"
                  r={radius}
                  stroke="rgba(255, 255, 255, 0.3)"
                  strokeWidth="3"
                  fill="none"
                />
                <circle
                  cx="24"
                  cy="24"
                  r={radius}
                  stroke="#C89B6D"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 0.3s ease" }}
                />
              </svg>
              <span className="absolute text-white text-xs font-bold">
                {Math.round(progress)}%
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p
            className="text-xs font-medium truncate max-w-[100px]"
            style={{ color: "#C89B6D" }}
          >
            {file.file.name}
          </p>
          <p className="text-xs" style={{ color: "rgba(200, 155, 109, 0.7)" }}>
            {(file.file.size / 1024).toFixed(2)} KB
          </p>
          {file.error && (
            <p className="text-xs text-red-500 mt-1">{file.error}</p>
          )}
        </div>

        <button
          onClick={onRemove}
          className="transition-colors hover:opacity-80"
          style={{ color: "#C89B6D" }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
