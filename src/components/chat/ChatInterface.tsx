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
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  Mic,
  MicOff,
  Lightbulb,
  Globe,
  FileUp,
  Star,
  ShoppingCart,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useChatStore, type ChatMessage } from "@/stores/chatStore";
import { chatApi, type FileMetadata } from "@/api/chat.api";
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

interface Product {
  id: string;
  name: string;
  base_price: number;
  image_urls: string[];
  description: string;
  review_count: number;
  average_rating: number;
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

  const [userQuestion, setUserQuestion] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [selectedMenuOption, setSelectedMenuOption] = useState<string | null>(
    null
  );
  const [imagePreviewDialog, setImagePreviewDialog] = useState(false);
  const [previewImageData, setPreviewImageData] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");

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
    useState("Hãy giúp tôi ");
  const placeholderTexts = [
    "tìm hướng dẫn sử dụng chức năng báo cáo trên hệ thống.",
    "tìm cách khắc phục lỗi 'Access Denied' khi đăng nhập.",
    "tóm tắt những điểm chính trong tài liệu vừa tải lên.",
    "soạn thảo một công văn gửi đối tác theo mẫu có sẵn.",
  ];
  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Greeting message
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Chào buổi sáng!";
    if (hour >= 12 && hour < 18) return "Chào buổi chiều!";
    return "Chào buổi tối!";
  };

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
    const prefix = "Hãy giúp tôi ";
    const currentText = placeholderTexts[currentPlaceholderIndex];
    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          const nextLength = animatedPlaceholder.length - prefix.length + 1;
          if (nextLength <= currentText.length) {
            setAnimatedPlaceholder(
              prefix + currentText.substring(0, nextLength)
            );
          } else {
            setTimeout(() => setIsDeleting(true), 1500);
          }
        } else {
          const nextLength = animatedPlaceholder.length - prefix.length - 1;
          if (nextLength >= 0) {
            setAnimatedPlaceholder(
              prefix + currentText.substring(0, nextLength)
            );
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
        className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Container maxW="6xl" className="py-4 px-4">
          <VStack gap={4} h="calc(100vh - 2rem)">
            {/* Header */}
            <Card.Root className="w-full shadow-md border border-gray-200 dark:border-gray-700">
              <Card.Body className="p-4">
                <HStack justify="space-between">
                  <VStack align="start" gap={1}>
                    <Text className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {getGreeting()}
                    </Text>
                    <HStack gap={2}>
                      <Badge
                        colorScheme="blue"
                        className="px-2 py-1 rounded-full text-xs"
                      >
                        {collectionName}
                      </Badge>
                      <Text className="text-xs text-gray-500 dark:text-gray-400">
                        {messages.length} messages
                      </Text>
                    </HStack>
                  </VStack>
                </HStack>
              </Card.Body>
            </Card.Root>

            {/* Messages Area */}
            <Box
              ref={scrollContainerRef}
              flex="1"
              className="w-full overflow-y-auto px-2"
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
                    <MessageBubble key={msg.id} message={msg} />
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
                  {/* Menu Button */}
                  <MenuRoot>
                    <MenuTrigger asChild>
                      <IconButton
                        aria-label="Menu"
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700"
                      >
                        <FileUp size={20} />
                      </IconButton>
                    </MenuTrigger>
                    <MenuContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                      <MenuItem
                        value="upload"
                        onClick={() => fileInputRef.current?.click()}
                        className="hover:bg-blue-50 dark:hover:bg-gray-700"
                      >
                        <Upload size={16} className="mr-2" />
                        Thêm ảnh và tệp
                      </MenuItem>
                      <MenuItem
                        value="thinking"
                        className="hover:bg-blue-50 dark:hover:bg-gray-700"
                      >
                        <Lightbulb size={16} className="mr-2" />
                        Thinking...
                      </MenuItem>
                      <MenuItem
                        value="websearch"
                        className="hover:bg-blue-50 dark:hover:bg-gray-700"
                      >
                        <Globe size={16} className="mr-2" />
                        Web-search
                      </MenuItem>
                    </MenuContent>
                  </MenuRoot>

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
                <Upload
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
      </Box>
    </>
  );
};

// Message Bubble Component
const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isUser = message.role === "user";
  const products = message.artifacts?.data as Product[] | undefined;

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
            <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              🛍️ Sản phẩm tìm được ({Math.min(products.length, 6)})
            </Text>
            <Grid
              templateColumns="repeat(auto-fill, minmax(200px, 1fr))"
              gap={3}
            >
              {products.slice(0, 6).map((product) => (
                <Card.Root
                  key={product.id}
                  className="overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-200 dark:border-gray-700 group/card"
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
                          {product.base_price.toLocaleString("vi-VN")}₫
                        </Text>
                        {product.review_count > 0 && (
                          <Text className="text-xs text-gray-500">
                            ({product.review_count} đánh giá)
                          </Text>
                        )}
                      </HStack>

                      {/* Add to Cart Button */}
                      <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-sm font-medium py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg">
                        <ShoppingCart size={16} />
                        Thêm vào giỏ
                      </button>
                    </Box>
                  </Card.Body>
                </Card.Root>
              ))}
            </Grid>
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
