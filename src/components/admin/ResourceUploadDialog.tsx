/**
 * ResourceUploadDialog Component
 * Upload batch files dialog với 2 bước: upload files -> process batch
 * Pattern: Modern CMS-style with example images based on processing type
 */

import React, { useRef, useState } from "react";
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Input,
  Stack,
  Text,
  VStack,
  HStack,
  Badge,
  Dialog,
  Portal,
  NativeSelectRoot,
  NativeSelectField,
  Progress,
  IconButton,
  SimpleGrid,
  Image,
} from "@chakra-ui/react";
import {
  Upload,
  X,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "react-toastify";
import { useResourceStore } from "@/stores/resourceStore";
import type { UploadFileState } from "@/stores/resourceStore";

// File type mapping (tương tự Vue component)
const fileTypeMap = {
  document_structured_llm: {
    accept:
      ".pdf,.docx,.pptx,.html,.htm,.txt,.png,.jpg,.jpeg,.gif,.bmp,.webp,.tiff,.tif",
    description:
      "PDF, DOCX, PPTX, HTML, TXT, PNG, JPG, GIF, BMP, WEBP, TIFF",
    extensions: [
      ".pdf",
      ".docx",
      ".pptx",
      ".html",  
      ".htm",
      ".txt",
      ".png",
      ".jpg",
      ".jpeg",
      ".gif",
      ".bmp",
      ".webp",
      ".tiff",
      ".tif",
    ],
    mimeTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/html",
      "text/plain",
      "image/png",
      "image/jpeg",
      "image/gif",
      "image/bmp",
      "image/webp",
      "image/tiff",
    ],
  },
  excel: {
    accept: ".csv,.xlsx",
    description: "CSV, XLSX",
    extensions: [".csv", ".xlsx"],
    mimeTypes: [
      "text/csv",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ],
  },
  sentence_based: {
    accept: ".pdf,.docx,.txt",
    description: "PDF, DOCX, TXT",
    extensions: [".pdf", ".docx", ".txt"],
    mimeTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ],
  },
};

const ResourceUploadDialog: React.FC = () => {
  const {
    // Dialog state
    isUploadDialogOpen,
    uploadFiles,
    isUploading,
    isProcessing,
    selectedProcessingType,
    effectiveFrom,
    effectiveTo,

    // Actions
    closeUploadDialog,
    addFiles,
    removeFile,
    uploadFilesAction,
    processFiles,
    setSelectedProcessingType,
    setEffectiveFrom,
    setEffectiveTo,
  } = useResourceStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Processing type options
  const processingTypeOptions = [
    {
      value: "document_structured_llm" as const,
      label: "Tài liệu chung",
      description: "(File scan & Images)",
    },
    {
      value: "excel" as const,
      label: "Bảng Excel/CSV",
      description: "",
    },
    {
      value: "sentence_based" as const,
      label: "Tài liệu không mục lục",
      description: "",
    },
  ];

  // Get accepted file types based on processing type
  const acceptedFileTypes = fileTypeMap[selectedProcessingType]?.accept || "";

  const allowedFileTypesDescription =
    fileTypeMap[selectedProcessingType]?.description + " (tối đa 50MB)" ||
    "Vui lòng chọn loại xử lý";

  // Get file extensions for display
  const getFileExtensionsByType = () => {
    const config = fileTypeMap[selectedProcessingType];
    if (!config) return [];
    return config.extensions.map((ext) => ext.replace(".", "").toUpperCase());
  };

  // Validate file type
  const isValidFileType = (file: File): boolean => {
    const config = fileTypeMap[selectedProcessingType];
    if (!config) return false;

    const { mimeTypes, extensions } = config;
    const filename = file.name.toLowerCase();

    return (
      mimeTypes.includes(file.type) ||
      extensions.some((ext) => filename.endsWith(ext))
    );
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processSelectedFiles(files);
  };

  // Handle drag & drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    processSelectedFiles(files);
  };

  // Process selected files and auto-upload
  const processSelectedFiles = async (files: File[]) => {
    const validFiles: File[] = [];
    let hasInvalidFile = false;

    for (const file of files) {
      if (!isValidFileType(file)) {
        hasInvalidFile = true;
        continue;
      }

      if (file.size > 50 * 1024 * 1024) {
        toast.error(`File ${file.name} vượt quá kích thước cho phép (50MB)`);
        return;
      }

      validFiles.push(file);
    }

    if (hasInvalidFile) {
      const desc = fileTypeMap[selectedProcessingType]?.description || "hợp lệ";
      toast.warn(`Một số file không được hỗ trợ. Chỉ chấp nhận ${desc}`);
    }

    if (validFiles.length > 0) {
      addFiles(validFiles);
      // Auto-upload files immediately
      try {
        await uploadFilesAction();
      } catch (error: any) {
        toast.error(error.message || "Upload thất bại");
      }
    }
  };

  // Open file dialog
  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  // Get file icon
  const getFileIcon = (file: File) => {
    const filename = file.name.toLowerCase();
    const type = file.type;

    if (type.includes("pdf") || filename.endsWith(".pdf"))
      return { icon: FileText, color: "red.500" };
    if (
      type.includes("word") ||
      filename.endsWith(".docx")
    )
      return { icon: FileText, color: "blue.600" };
    if (type.includes("csv") || filename.endsWith(".csv"))
      return { icon: FileText, color: "green.600" };
    if (
      type.includes("excel") ||
      type.includes("spreadsheetml") ||
      filename.endsWith(".xlsx")
    )
      return { icon: FileText, color: "emerald.700" };

    return { icon: FileText, color: "gray.500" };
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  // Get status badge for uploaded files
  const getStatusBadge = (status: UploadFileState["status"]) => {
    const statusConfig = {
      pending: { color: "gray", label: "Chờ upload", icon: Clock },
      uploading: { color: "blue", label: "Đang upload", icon: Upload },
      uploaded: { color: "green", label: "Đã upload", icon: CheckCircle },
      processing: { color: "blue", label: "Đang xử lý", icon: Clock },
      processed: { color: "green", label: "Hoàn thành", icon: CheckCircle },
      error: { color: "red", label: "Lỗi", icon: XCircle },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge colorPalette={config.color} variant="subtle" size="sm">
        <HStack gap={1}>
          <Icon size={12} />
          <Text>{config.label}</Text>
        </HStack>
      </Badge>
    );
  };

  // Handle process files - confirm and send all uploaded resource_ids
  const handleProcessFiles = async () => {
    // Validate dates
    if (effectiveFrom && effectiveTo && effectiveTo < effectiveFrom) {
      toast.error("Ngày kết thúc không được nhỏ hơn ngày bắt đầu");
      return;
    }

    try {
      await processFiles({});
      toast.success("Bắt đầu xử lý tài nguyên!");
    } catch (error: any) {
      toast.error(error.message || "Xử lý thất bại");
    }
  };

  // Can confirm process - has uploaded files (not deleted)
  const canConfirmProcess =
    uploadFiles.some((f) => f.status === "uploaded") &&
    !isProcessing &&
    !isUploading;

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedFileTypes}
        onChange={handleFileSelect}
        hidden
        aria-label="Upload files"
      />

      {/* Dialog */}
      <Dialog.Root
        open={isUploadDialogOpen}
        onOpenChange={(e) =>
          !isUploading && !isProcessing && !e.open && closeUploadDialog()
        }
        size="xl"
      >
        <Portal>
          <Dialog.Backdrop className="fixed inset-0 bg-black/50 z-[1000]" />
          <Dialog.Positioner className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
            <Dialog.Content className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-[900px] w-full max-h-[90vh] overflow-hidden">
              <Dialog.Header className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
                <Dialog.Title className="text-2xl font-bold text-gray-800 dark:text-white">
                  Thêm tài liệu vào kho tri thức
                </Dialog.Title>
                <Dialog.CloseTrigger disabled={isUploading || isProcessing} />
              </Dialog.Header>

              <Dialog.Body
                className="px-6 py-6 overflow-y-auto"
                style={{ maxHeight: "calc(90vh - 180px)" }}
              >
                <Stack gap={6}>
                  {/* Step 1: Nhập tài liệu */}
                  <Box>
                    <Heading
                      size="lg"
                      mb={4}
                      className="text-gray-800 dark:text-white font-bold"
                    >
                      Nhập tài liệu
                    </Heading>

                    {/* Processing Type Selection */}
                    <Box mb={6}>
                      <Text
                        fontSize="sm"
                        fontWeight="semibold"
                        mb={3}
                        className="text-gray-700 dark:text-gray-300"
                      >
                        Mô tả phương thức phân đoạn
                      </Text>
                      <SimpleGrid columns={3} gap={3}>
                        {processingTypeOptions.map((option) => {
                          const isSelected =
                            selectedProcessingType === option.value;
                          const Icon =
                            option.value === "excel"
                              ? FileSpreadsheet
                              : FileText;

                          // Color mapping based on type
                          const colorConfig = {
                            document_structured_llm: {
                              selected: {
                                bg: "bg-blue-50 dark:bg-blue-900/30",
                                border: "border-blue-500",
                                icon: "bg-blue-500",
                                text: "text-blue-600",
                              },
                              unselected: {
                                bg: "bg-gray-50 dark:bg-gray-800",
                                border: "border-gray-200",
                                icon: "bg-blue-200",
                                text: "text-gray-700",
                              },
                            },
                            excel: {
                              selected: {
                                bg: "bg-green-50 dark:bg-green-900/30",
                                border: "border-green-500",
                                icon: "bg-green-500",
                                text: "text-green-600",
                              },
                              unselected: {
                                bg: "bg-gray-50 dark:bg-gray-800",
                                border: "border-gray-200",
                                icon: "bg-green-200",
                                text: "text-gray-700",
                              },
                            },
                            sentence_based: {
                              selected: {
                                bg: "bg-orange-50 dark:bg-orange-900/30",
                                border: "border-orange-500",
                                icon: "bg-orange-500",
                                text: "text-orange-600",
                              },
                              unselected: {
                                bg: "bg-gray-50 dark:bg-gray-800",
                                border: "border-gray-200",
                                icon: "bg-orange-200",
                                text: "text-gray-700",
                              },
                            },
                          };

                          const colors =
                            colorConfig[option.value][
                              isSelected ? "selected" : "unselected"
                            ];

                          return (
                            <Card.Root
                              key={option.value}
                              className={`cursor-pointer transition-colors duration-200 border-2 ${colors.border} ${colors.bg} rounded-lg`}
                              onClick={() =>
                                setSelectedProcessingType(option.value)
                              }
                            >
                              <Card.Body className="px-4 py-4">
                                <VStack gap={2}>
                                  <Box
                                    className={`rounded-lg p-3 ${colors.icon}`}
                                  >
                                    <Icon size={24} className="text-white" />
                                  </Box>
                                  <Text
                                    fontWeight="semibold"
                                    fontSize="sm"
                                    textAlign="center"
                                    className={colors.text}
                                  >
                                    {option.label}
                                  </Text>
                                  {option.description && (
                                    <Text
                                      fontSize="xs"
                                      color="gray.500"
                                      textAlign="center"
                                    >
                                      {option.description}
                                    </Text>
                                  )}
                                </VStack>
                              </Card.Body>
                            </Card.Root>
                          );
                        })}
                      </SimpleGrid>
                    </Box>

                    {/* File Format Description with Example Image */}
                    <Box className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                      <VStack align="stretch" gap={4}>
                        {/* Header */}
                        <HStack justify="space-between">
                          <Box>
                            <Text
                              fontSize="sm"
                              fontWeight="bold"
                              mb={2}
                              className="text-gray-800 dark:text-white"
                            >
                              Định dạng hỗ trợ
                            </Text>
                            <Flex flexWrap="wrap" gap={2}>
                              {getFileExtensionsByType().map((ext) => (
                                <Badge
                                  key={ext}
                                  variant="solid"
                                  colorPalette="blue"
                                  className="px-2 py-1 text-xs font-mono"
                                >
                                  {ext}
                                </Badge>
                              ))}
                            </Flex>
                          </Box>
                        </HStack>

                        {/* Description */}
                        <Box className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                          <Text
                            fontSize="sm"
                            className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3"
                          >
                            Phương thức này sẽ phân đoạn tài liệu dựa trên dấu
                            phân cách và gộp thành các đoạn với số ký tự phù
                            hợp. Để nhận dạng vỉ hình hình ảnh trong nội dung
                            cũng sẽ được tách dữa trên đầu phân cách và sau đó
                            gộp thành các đoạn không vượt quá giới hạn, với số
                            ký tự trong mỗi đoạn không vượt quá giới hạn
                          </Text>
                          <Text
                            fontSize="xs"
                            color="gray.500"
                            fontWeight="semibold"
                          >
                            Truyền thống, việc giảm sát giảo thông chủ yếu dựa
                            vào quan sát trực tiếp hoặc phản hồi báo cáo thủ
                            công. Tận bao này có nhiệm vụ công tự sức mẫy, ồ tồ,
                            xe mẫy và ồ nhiều mới trường, truyện thống việc giảo
                            sát giảo thông đưu gốp vào quản sát trực tiếp hoặc
                            phản hồi hoặc cảm hứng như nương vệc tiếp tục tiếp
                            thống tiết cho các quyết tính của người đệ phát hiện
                            hay được đều mà ấn tượng cho và dây hoặc câu tiệnh
                            thành tách huy
                          </Text>
                        </Box>

                        {/* Example Images */}
                        <Box>
                          <Text
                            fontSize="sm"
                            fontWeight="semibold"
                            mb={3}
                            className="text-gray-700 dark:text-gray-300"
                          >
                            Ví dụ
                          </Text>
                          <Box className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-gray-300 dark:border-gray-600 shadow-md">
                            {(selectedProcessingType ===
                              "document_structured_llm" ||
                              selectedProcessingType === "sentence_based") && (
                              <Image
                                src="/img/example2.png"
                                alt="Example"
                                className="w-full h-auto rounded-lg"
                              />
                            )}

                            {selectedProcessingType === "excel" && (
                              <Image
                                src="/img/example.jpg"
                                alt="Example"
                                className="w-full h-auto rounded-lg"
                              />
                            )}
                          </Box>
                        </Box>
                      </VStack>
                    </Box>
                  </Box>

                  {/* Dates */}
                  <Box>
                    <Heading size="sm" mb={3} className="font-semibold">
                      Thời gian hiệu lực (Tùy chọn)
                    </Heading>
                    <SimpleGrid columns={2} gap={4}>
                      <Box>
                        <Text fontSize="sm" fontWeight="medium" mb={2}>
                          Ngày hiệu lực
                        </Text>
                        <Input
                          type="date"
                          className="border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                          value={
                            effectiveFrom
                              ? effectiveFrom.toISOString().split("T")[0]
                              : ""
                          }
                          onChange={(e) =>
                            setEffectiveFrom(
                              e.target.value ? new Date(e.target.value) : null
                            )
                          }
                        />
                      </Box>

                      <Box>
                        <Text fontSize="sm" fontWeight="medium" mb={2}>
                          Ngày hết hạn
                        </Text>
                        <Input
                          type="date"
                          className="border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                          value={
                            effectiveTo
                              ? effectiveTo.toISOString().split("T")[0]
                              : ""
                          }
                          onChange={(e) =>
                            setEffectiveTo(
                              e.target.value ? new Date(e.target.value) : null
                            )
                          }
                        />
                      </Box>
                    </SimpleGrid>
                  </Box>

                  {/* File Upload Area or File List */}
                  <Box>
                    {uploadFiles.length === 0 ? (
                      /* Upload Area */
                      <Box
                        border="2px dashed"
                        borderColor={isDragging ? "blue.500" : "gray.300"}
                        borderRadius="md"
                        p={8}
                        textAlign="center"
                        cursor="pointer"
                        bg={isDragging ? "blue.50" : "gray.50"}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={openFileDialog}
                      >
                        <VStack gap={3}>
                          <Upload size={48} color="gray" opacity={0.5} />
                          <Text fontWeight="medium">
                            Kéo thả file vào đây hoặc click để chọn
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            {allowedFileTypesDescription}
                          </Text>
                        </VStack>
                      </Box>
                    ) : (
                      /* File List */
                      <Stack gap={3}>
                        {uploadFiles.map((fileState, index) => {
                          const { icon: Icon, color } = getFileIcon(
                            fileState.file
                          );

                          return (
                            <Card.Root key={index} variant="outline">
                              <Card.Body>
                                <Flex align="center" gap={3}>
                                  {/* File Icon */}
                                  <Box color={color}>
                                    <Icon size={24} />
                                  </Box>

                                  {/* File Info */}
                                  <VStack align="start" flex={1} gap={1}>
                                    <Text fontWeight="medium" fontSize="sm">
                                      {fileState.file.name}
                                    </Text>
                                    <HStack gap={2}>
                                      <Text fontSize="xs" color="gray.600">
                                        {formatFileSize(fileState.file.size)}
                                      </Text>
                                      {getStatusBadge(fileState.status)}
                                    </HStack>
                                    {fileState.error && (
                                      <Text fontSize="xs" color="red.500">
                                        {fileState.error}
                                      </Text>
                                    )}
                                    {(fileState.status === "uploading" ||
                                      fileState.status === "processing") && (
                                      <Box w="full">
                                        <Progress.Root
                                          value={fileState.progress}
                                          size="sm"
                                        >
                                          <Progress.Track>
                                            <Progress.Range />
                                          </Progress.Track>
                                        </Progress.Root>
                                      </Box>
                                    )}
                                  </VStack>

                                  {/* Remove Button */}
                                  {fileState.status !== "uploading" &&
                                    fileState.status !== "processing" && (
                                      <IconButton
                                        aria-label="Remove"
                                        size="sm"
                                        variant="ghost"
                                        colorPalette="red"
                                        onClick={() => removeFile(index)}
                                      >
                                        <X size={16} />
                                      </IconButton>
                                    )}
                                </Flex>
                              </Card.Body>
                            </Card.Root>
                          );
                        })}

                        {/* Add More Files Button */}
                        {!isUploading && !isProcessing && (
                          <Button
                            variant="outline"
                            onClick={openFileDialog}
                            size="sm"
                          >
                            <Plus size={16} />
                            Thêm file
                          </Button>
                        )}
                      </Stack>
                    )}
                  </Box>
                </Stack>
              </Dialog.Body>

              <Dialog.Footer className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <HStack justify="flex-end" gap={3}>
                  <Button
                    variant="outline"
                    onClick={closeUploadDialog}
                    disabled={isUploading || isProcessing}
                    className="rounded-lg px-6 py-2 border-2 border-gray-200 hover:border-gray-300"
                  >
                    Hủy
                  </Button>

                  {/* Only show Confirm button when files are uploaded */}
                  {canConfirmProcess && (
                    <Button
                      className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-6 py-2"
                      onClick={handleProcessFiles}
                      loading={isProcessing}
                      disabled={isUploading}
                    >
                      Xác nhận và xử lý
                    </Button>
                  )}
                </HStack>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
};

export default ResourceUploadDialog;
