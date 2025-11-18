import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Input,
  Spinner,
  Stack,
  Table,
  Text,
  VStack,
  HStack,
  Badge,
  Dialog,
  Portal,
  IconButton,
  NativeSelectRoot,
  NativeSelectField,
  Progress,
  For,
  SimpleGrid,
  Menu,
} from "@chakra-ui/react";
import {
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  FileText,
  Link as LinkIcon,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ArrowUpDown,
  Check,
} from "lucide-react";
import { toast } from "react-toastify";
import { useResourceStore } from "@/stores/resourceStore";
import type { Resource } from "@/types";

// Import Upload Dialog component (sẽ tạo sau)
import ResourceUploadDialog from "./ResourceUploadDialog";

const ResourceManagement: React.FC = () => {
  const {
    // Data
    resources,
    isLoading,
    error,
    totalCount,
    currentPage,
    pageSize,
    totalPages,

    // Filters
    resourceType,
    resourceNameSearch,
    processingStatus,
    processingType,
    sortBy,
    sortOrder,

    // Actions
    fetchResources,
    deleteResource,
    refreshResources,
    setResourceType,
    setResourceNameSearch,
    setProcessingStatus,
    setProcessingType,
    setSortBy,
    setSortOrder,
    setCurrentPage,
    clearFilters,
    openUploadDialog,
    clearError,
  } = useResourceStore();

  // Local search input state (debounced)
  const [searchInput, setSearchInput] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Load resources on mount
  useEffect(() => {
    fetchResources();
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== resourceNameSearch) {
        setResourceNameSearch(searchInput);
        fetchResources();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Handle delete
  const handleDeleteClick = (resource: Resource) => {
    setResourceToDelete({
      id: resource.id,
      name: resource.resource_name,
    });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!resourceToDelete) return;

    try {
      setDeletingId(resourceToDelete.id);
      await deleteResource(resourceToDelete.id);
      toast.success("Xóa tài liệu thành công!");
      setDeleteDialogOpen(false);
      setResourceToDelete(null);
    } catch (error: any) {
      toast.error(error.message || "Xóa tài liệu thất bại");
    } finally {
      setDeletingId(null);
    }
  };

  // Status badge helper
  const getStatusBadge = (status: Resource["processing_status"]) => {
    const statusConfig = {
      draft: { color: "gray", label: "Nháp", icon: FileText },
      pending: { color: "yellow", label: "Chờ xử lý", icon: Clock },
      processing: { color: "blue", label: "Đang xử lý", icon: RefreshCw },
      completed: { color: "green", label: "Hoàn thành", icon: CheckCircle },
      failed: { color: "red", label: "Thất bại", icon: XCircle },
    };

    const config = statusConfig[status] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <Badge colorPalette={config.color} variant="subtle">
        <HStack gap={1}>
          <Icon size={12} />
          <Text>{config.label}</Text>
        </HStack>
      </Badge>
    );
  };

  // Resource type badge
  const getResourceTypeBadge = (type: "document" | "link") => {
    const Icon = type === "document" ? FileText : LinkIcon;
    const label = type === "document" ? "Tài liệu" : "Liên kết";
    const color = type === "document" ? "blue" : "purple";

    return (
      <Badge colorPalette={color} variant="outline">
        <HStack gap={1}>
          <Icon size={12} />
          <Text>{label}</Text>
        </HStack>
      </Badge>
    );
  };

  // Format file size
  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return "-";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  // Format date
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Sort label mapping
  const getSortLabel = () => {
    const key = `${sortBy}-${sortOrder}`;
    const labels: Record<string, string> = {
      "created_at-desc": "Mới nhất",
      "created_at-asc": "Cũ nhất",
      "resource_name-asc": "Tên A-Z",
      "resource_name-desc": "Tên Z-A",
    };
    return labels[key] || "Sắp xếp";
  };

  return (
    <Box p={6}>
      {/* Header */}
      <VStack align="stretch" gap={6} mb={6}>
        <Box>
          <Heading className="text-4xl font-bold" mb={2}>
            Kho tri thức
          </Heading>
          <Text color="gray.600">
            Quản lý tài liệu và tài nguyên trong hệ thống
          </Text>
        </Box>

        {/* Stats Cards */}
        <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
          <Card.Root>
            <Card.Body className="px-6 py-4">
              <Stack gap={1}>
                <Text fontSize="sm" color="gray.600">
                  Tổng tài liệu
                </Text>
                <Heading size="2xl">{totalCount}</Heading>
              </Stack>
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Body className="px-6 py-4">
              <Stack gap={1}>
                <Text fontSize="sm" color="gray.600">
                  Trang hiện tại
                </Text>
                <Heading size="2xl">
                  {currentPage}/{totalPages}
                </Heading>
              </Stack>
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Body className="px-6 py-4">
              <Stack gap={1}>
                <Text fontSize="sm" color="gray.600">
                  Đang hiển thị
                </Text>
                <Heading size="2xl">{resources.length}</Heading>
              </Stack>
            </Card.Body>
          </Card.Root>
        </SimpleGrid>
      </VStack>

      {/* Toolbar & Filters */}
      <Card.Root mb={6}>
        <Card.Body className="px-6 py-4">
          <VStack gap={4} align="stretch">
            {/* Top Row: Search + Actions */}
            <Flex
              direction={{ base: "column", md: "row" }}
              gap={4}
              align={{ base: "stretch", md: "center" }}
              justify="space-between"
            >
              {/* Search */}
              <Input
                placeholder="Tìm kiếm theo tên tài liệu..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                maxW={{ md: "400px" }}
                className="border-2 border-gray-200 focus:border-blue-500 rounded-lg px-4 py-2"
              />

              {/* Actions */}
              <HStack gap={3}>
                <Menu.Root>
                  <Menu.Trigger asChild>
                    <Button
                      variant="outline"
                      className="rounded-lg px-4 py-2 border-2 border-gray-200 hover:border-gray-300"
                    >
                      <HStack gap={2}>
                        <ArrowUpDown size={16} />
                        <Text>{getSortLabel()}</Text>
                      </HStack>
                    </Button>
                  </Menu.Trigger>
                  <Menu.Positioner>
                    <Menu.Content className="z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 min-w-[180px]">
                      <Menu.Item
                        value="created_at-desc"
                        onClick={() => {
                          setSortBy("created_at");
                          setSortOrder("desc");
                        }}
                        className="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <HStack justify="space-between" flex={1}>
                          <Text>Mới nhất</Text>
                          {sortBy === "created_at" && sortOrder === "desc" && (
                            <Check size={16} className="text-green-500" />
                          )}
                        </HStack>
                      </Menu.Item>
                      <Menu.Item
                        value="created_at-asc"
                        onClick={() => {
                          setSortBy("created_at");
                          setSortOrder("asc");
                        }}
                        className="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <HStack justify="space-between" flex={1}>
                          <Text>Cũ nhất</Text>
                          {sortBy === "created_at" && sortOrder === "asc" && (
                            <Check size={16} className="text-green-500" />
                          )}
                        </HStack>
                      </Menu.Item>
                      <Menu.Item
                        value="resource_name-asc"
                        onClick={() => {
                          setSortBy("resource_name");
                          setSortOrder("asc");
                        }}
                        className="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <HStack justify="space-between" flex={1}>
                          <Text>Tên A-Z</Text>
                          {sortBy === "resource_name" &&
                            sortOrder === "asc" && (
                              <Check size={16} className="text-green-500" />
                            )}
                        </HStack>
                      </Menu.Item>
                      <Menu.Item
                        value="resource_name-desc"
                        onClick={() => {
                          setSortBy("resource_name");
                          setSortOrder("desc");
                        }}
                        className="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <HStack justify="space-between" flex={1}>
                          <Text>Tên Z-A</Text>
                          {sortBy === "resource_name" &&
                            sortOrder === "desc" && (
                              <Check size={16} className="text-green-500" />
                            )}
                        </HStack>
                      </Menu.Item>
                    </Menu.Content>
                  </Menu.Positioner>
                </Menu.Root>

                <Button
                  className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-4 py-2"
                  onClick={openUploadDialog}
                >
                  <Plus size={20} />
                  Thêm tài liệu
                </Button>

                <IconButton
                  aria-label="Refresh"
                  onClick={refreshResources}
                  variant="outline"
                  disabled={isLoading}
                  className="rounded-lg border-2 border-gray-200 hover:border-gray-300"
                >
                  <RefreshCw
                    size={20}
                    className={isLoading ? "animate-spin" : ""}
                  />
                </IconButton>
              </HStack>
            </Flex>

            {/* Bottom Row: Filters */}
            <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} gap={3}>
              {/* Resource Type Filter */}
              <NativeSelectRoot size="sm">
                <NativeSelectField
                  value={resourceType || ""}
                  onChange={(e) =>
                    setResourceType(
                      e.target.value
                        ? (e.target.value as "document" | "link")
                        : null
                    )
                  }
                  className="border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                >
                  <option value="">Tất cả loại tài liệu</option>
                  <option value="document">Tài liệu</option>
                  <option value="link">Liên kết</option>
                </NativeSelectField>
              </NativeSelectRoot>

              {/* Processing Status Filter */}
              <NativeSelectRoot size="sm">
                <NativeSelectField
                  value={processingStatus || ""}
                  onChange={(e) =>
                    setProcessingStatus(
                      e.target.value
                        ? (e.target.value as Resource["processing_status"])
                        : null
                    )
                  }
                  className="border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="draft">Nháp</option>
                  <option value="pending">Chờ xử lý</option>
                  <option value="processing">Đang xử lý</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="failed">Thất bại</option>
                </NativeSelectField>
              </NativeSelectRoot>

              {/* Processing Type Filter */}
              <NativeSelectRoot size="sm">
                <NativeSelectField
                  value={processingType || ""}
                  onChange={(e) =>
                    setProcessingType(
                      e.target.value
                        ? (e.target.value as Resource["processing_type"])
                        : null
                    )
                  }
                  className="border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                >
                  <option value="">Tất cả loại xử lý</option>
                  <option value="document_structured_llm">
                    Tài liệu có cấu trúc
                  </option>
                  <option value="sentence_based">Phân đoạn theo câu</option>
                  <option value="excel">Excel/CSV</option>
                </NativeSelectField>
              </NativeSelectRoot>

              {/* Clear Filters */}
              <Button
                onClick={clearFilters}
                size="sm"
                className="text-red-600 border-2 border-red-500 bg-red-50 hover:bg-red-100 rounded-lg px-4 py-2"
              >
                Xóa bộ lọc
              </Button>
            </SimpleGrid>
          </VStack>
        </Card.Body>
      </Card.Root>

      {/* Error Display */}
      {error && (
        <Card.Root mb={4} colorPalette="red">
          <Card.Body>
            <HStack>
              <AlertCircle size={20} />
              <Text>{error}</Text>
              <Button size="sm" ml="auto" onClick={clearError}>
                Đóng
              </Button>
            </HStack>
          </Card.Body>
        </Card.Root>
      )}

      {/* Loading State */}
      {isLoading && (
        <Flex justify="center" align="center" minH="400px">
          <VStack>
            <Spinner size="xl" colorPalette="blue" />
            <Text color="gray.500">Đang tải dữ liệu...</Text>
          </VStack>
        </Flex>
      )}

      {/* Table */}
      {!isLoading && (
        <Card.Root>
          <Card.Body p={0}>
            <Box overflowX="auto">
              <Table.Root variant="outline">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader className="px-6 py-4">
                      Tên tài liệu
                    </Table.ColumnHeader>
                    <Table.ColumnHeader className="px-6 py-4">
                      Loại
                    </Table.ColumnHeader>
                    <Table.ColumnHeader className="px-6 py-4">
                      Định dạng
                    </Table.ColumnHeader>
                    <Table.ColumnHeader className="px-6 py-4">
                      Kích thước
                    </Table.ColumnHeader>
                    <Table.ColumnHeader className="px-6 py-4">
                      Trạng thái
                    </Table.ColumnHeader>
                    <Table.ColumnHeader className="px-6 py-4">
                      Tiến độ
                    </Table.ColumnHeader>
                    <Table.ColumnHeader className="px-6 py-4">
                      Ngày tạo
                    </Table.ColumnHeader>
                    <Table.ColumnHeader className="px-6 py-4 text-center">
                      Hành động
                    </Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {resources.length === 0 ? (
                    <Table.Row>
                      <Table.Cell
                        colSpan={8}
                        className="px-6 py-12 text-center"
                      >
                        <VStack>
                          <FileText size={48} color="gray" opacity={0.3} />
                          <Text color="gray.500">Chưa có tài liệu nào</Text>
                        </VStack>
                      </Table.Cell>
                    </Table.Row>
                  ) : (
                    resources.map((resource) => (
                      <Table.Row key={resource.id}>
                        {/* Name */}
                        <Table.Cell className="px-6 py-4" maxW="300px">
                          <VStack align="start" gap={1}>
                            <Text
                              fontWeight="medium"
                              className="overflow-hidden text-ellipsis whitespace-nowrap max-w-[280px]"
                              title={resource.resource_name}
                            >
                              {resource.resource_name}
                            </Text>
                            {resource.description && (
                              <Text
                                fontSize="xs"
                                color="gray.500"
                                className="overflow-hidden text-ellipsis whitespace-nowrap max-w-[280px]"
                                title={resource.description}
                              >
                                {resource.description}
                              </Text>
                            )}
                          </VStack>
                        </Table.Cell>

                        {/* Type */}
                        <Table.Cell className="px-6 py-4">
                          {getResourceTypeBadge(resource.resource_type)}
                        </Table.Cell>

                        {/* File Type */}
                        <Table.Cell className="px-6 py-4">
                          <Badge variant="subtle">
                            {resource.file_type?.toUpperCase() || "-"}
                          </Badge>
                        </Table.Cell>

                        {/* File Size */}
                        <Table.Cell className="px-6 py-4">
                          <Text fontSize="sm" color="gray.600">
                            {formatFileSize(resource.file_size)}
                          </Text>
                        </Table.Cell>

                        {/* Status */}
                        <Table.Cell className="px-6 py-4">
                          {getStatusBadge(resource.processing_status)}
                        </Table.Cell>

                        {/* Progress */}
                        <Table.Cell className="px-6 py-4" minW="150px">
                          <HStack gap={2}>
                            <Progress.Root
                              value={resource.progress}
                              size="sm"
                              flex={1}
                              colorPalette={
                                resource.processing_status === "completed"
                                  ? "green"
                                  : resource.processing_status === "failed"
                                  ? "red"
                                  : "blue"
                              }
                            >
                              <Progress.Track>
                                <Progress.Range />
                              </Progress.Track>
                            </Progress.Root>
                            <Text fontSize="xs" color="gray.600" minW="35px">
                              {resource.progress}%
                            </Text>
                          </HStack>
                        </Table.Cell>

                        {/* Created At */}
                        <Table.Cell className="px-6 py-4">
                          <Text fontSize="sm" color="gray.600">
                            {formatDate(resource.created_at)}
                          </Text>
                        </Table.Cell>

                        {/* Actions */}
                        <Table.Cell className="px-6 py-4" textAlign="center">
                          <IconButton
                            aria-label="Delete"
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:bg-red-50"
                            onClick={() => handleDeleteClick(resource)}
                            loading={deletingId === resource.id}
                            disabled={deletingId === resource.id}
                          >
                            <Trash2 size={18} />
                          </IconButton>
                        </Table.Cell>
                      </Table.Row>
                    ))
                  )}
                </Table.Body>
              </Table.Root>
            </Box>
          </Card.Body>

          {/* Pagination */}
          {totalPages > 1 && (
            <Card.Footer className="px-6 py-4">
              <Flex
                justify="space-between"
                align="center"
                w="full"
                direction={{ base: "column", md: "row" }}
                gap={4}
              >
                <Text fontSize="sm" color="gray.600">
                  Hiển thị {(currentPage - 1) * pageSize + 1} -{" "}
                  {Math.min(currentPage * pageSize, totalCount)} trong tổng số{" "}
                  {totalCount} tài liệu
                </Text>
                <HStack gap={2}>
                  <IconButton
                    variant="outline"
                    size="sm"
                    className="rounded-lg border-2 border-gray-200 hover:border-gray-300"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1 || isLoading}
                  >
                    <ChevronLeft size={18} />
                  </IconButton>
                  <Text className="px-4 font-medium">
                    {currentPage} / {totalPages}
                  </Text>
                  <IconButton
                    variant="outline"
                    size="sm"
                    className="rounded-lg border-2 border-gray-200 hover:border-gray-300"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages || isLoading}
                  >
                    <ChevronRight size={18} />
                  </IconButton>
                </HStack>
              </Flex>
            </Card.Footer>
          )}
        </Card.Root>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog.Root
        open={deleteDialogOpen}
        onOpenChange={(e) => {
          setDeleteDialogOpen(e.open);
          if (!e.open) {
            setResourceToDelete(null);
          }
        }}
      >
        <Portal>
          <Dialog.Backdrop className="fixed inset-0 bg-black/50 z-[1000]" />
          <Dialog.Positioner className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
            <Dialog.Content className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-[450px] w-full">
              <Dialog.Header className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <Dialog.Title className="text-xl font-semibold text-red-600">
                  Xác nhận xóa
                </Dialog.Title>
                <Dialog.CloseTrigger />
              </Dialog.Header>

              <Dialog.Body className="px-6 py-4">
                <VStack gap={3} align="stretch">
                  <Text>
                    Bạn có chắc chắn muốn xóa tài liệu{" "}
                    <Text as="span" fontWeight="bold">
                      "{resourceToDelete?.name}"
                    </Text>{" "}
                    không?
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Hành động này không thể hoàn tác. Dữ liệu sẽ bị xóa vĩnh
                    viễn.
                  </Text>
                </VStack>
              </Dialog.Body>

              <Dialog.Footer className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
                <Dialog.ActionTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={deletingId !== null}
                    className="rounded-lg px-4 py-2 border-2 border-gray-200 hover:border-gray-300"
                  >
                    Hủy
                  </Button>
                </Dialog.ActionTrigger>
                <Button
                  className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-2"
                  onClick={handleDeleteConfirm}
                  disabled={deletingId !== null}
                  loading={deletingId !== null}
                >
                  Xóa tài liệu
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* Upload Dialog */}
      <ResourceUploadDialog />
    </Box>
  );
};

export default ResourceManagement;
