import React, { useState, useEffect, useRef } from "react";
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
  SimpleGrid,
  Dialog,
  Portal,
  Field,
  Menu,
  IconButton,
  NativeSelectRoot,
  NativeSelectField,
} from "@chakra-ui/react";
import {
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Check,
} from "lucide-react";
import { toast } from "react-toastify";
import { categoryApi, Category, CategoriesParams } from "@/api/category.api";

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Search & Sort
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Create modal
  const [isOpen, setIsOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryParentId, setNewCategoryParentId] = useState<string>("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Delete confirmation modal
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Sort label mapping
  const getSortLabel = () => {
    const key = `${sortBy}-${sortOrder}`;
    const labels: Record<string, string> = {
      "created_at-desc": "Mới nhất",
      "created_at-asc": "Cũ nhất",
      "name-asc": "Tên A-Z",
      "name-desc": "Tên Z-A",
    };
    return labels[key] || "Sắp xếp";
  };

  // Get parent category name
  const getParentName = (parentId?: string | null) => {
    if (!parentId) return "Danh mục gốc";
    const parent = allCategories.find((cat) => cat.category_id === parentId);
    return parent?.name || "Không xác định";
  };

  useEffect(() => {
    loadCategories();
    loadAllCategories();
  }, [currentPage, searchTerm, sortBy, sortOrder]);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const params: CategoriesParams = {
        page: currentPage,
        page_size: pageSize,
        sort_by: sortBy,
        sort_order: sortOrder,
      };

      if (searchTerm) {
        params.name_search = searchTerm;
      }

      const response = await categoryApi.getCategories(params);
      setCategories(response.info.categories);
      setTotal(response.info.total_count);
      setTotalPages(response.info.total_pages);
    } catch (error: any) {
      toast.error(error.message || "Không thể tải danh sách danh mục");
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllCategories = async () => {
    try {
      const response = await categoryApi.getCategories({
        page: 1,
        page_size: 100,
      });
      setAllCategories(response.info.categories);
    } catch (error: any) {
      console.error("Failed to load all categories:", error);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("Vui lòng nhập tên danh mục");
      return;
    }

    try {
      setIsCreating(true);
      await categoryApi.createCategory({
        name: newCategoryName.trim(),
        parent_id: newCategoryParentId || null,
      });
      toast.success("Tạo danh mục thành công!");
      setIsOpen(false);
      setNewCategoryName("");
      setNewCategoryParentId("");
      setCurrentPage(1);
      await loadCategories();
      await loadAllCategories();
    } catch (error: any) {
      toast.error(error.message || "Tạo danh mục thất bại");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteCategory = async (
    categoryId: string,
    categoryName: string
  ) => {
    setCategoryToDelete({ id: categoryId, name: categoryName });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      setDeletingId(categoryToDelete.id);
      await categoryApi.deleteCategory(categoryToDelete.id);
      toast.success("Xóa danh mục thành công!");
      await loadCategories();
      await loadAllCategories();
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    } catch (error: any) {
      toast.error(error.message || "Xóa danh mục thất bại");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Box p={{ base: 4, sm: 6 }}>
      {/* Header */}
      <VStack align="stretch" gap={{ base: 4, sm: 6 }} mb={{ base: 4, sm: 6 }}>
        <Box>
          <Heading
            className="text-2xl sm:text-3xl md:text-4xl font-bold"
            mb={2}
          >
            Quản lý danh mục
          </Heading>
          <Text color="gray.600" fontSize={{ base: "sm", sm: "md" }}>
            Quản lý các danh mục sản phẩm trong hệ thống
          </Text>
        </Box>

        {/* Stats Cards */}
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap={4}>
          <Card.Root>
            <Card.Body className="px-6 py-4">
              <Stack gap={1}>
                <Text fontSize="sm" color="gray.600">
                  Tổng danh mục
                </Text>
                <Heading size="2xl">{total}</Heading>
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
                  Hiển thị
                </Text>
                <Heading size="2xl">{categories.length}</Heading>
              </Stack>
            </Card.Body>
          </Card.Root>
        </SimpleGrid>

        {/* Toolbar */}
        <Card.Root>
          <Card.Body className="px-6 py-4">
            <Flex
              direction={{ base: "column", md: "row" }}
              gap={4}
              align={{ base: "stretch", md: "center" }}
              justify="space-between"
            >
              {/* Search */}
              <Input
                placeholder="Tìm kiếm theo tên danh mục..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
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
                        value="name-asc"
                        onClick={() => {
                          setSortBy("name");
                          setSortOrder("asc");
                        }}
                        className="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <HStack justify="space-between" flex={1}>
                          <Text>Tên A-Z</Text>
                          {sortBy === "name" && sortOrder === "asc" && (
                            <Check size={16} className="text-green-500" />
                          )}
                        </HStack>
                      </Menu.Item>
                      <Menu.Item
                        value="name-desc"
                        onClick={() => {
                          setSortBy("name");
                          setSortOrder("desc");
                        }}
                        className="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <HStack justify="space-between" flex={1}>
                          <Text>Tên Z-A</Text>
                          {sortBy === "name" && sortOrder === "desc" && (
                            <Check size={16} className="text-green-500" />
                          )}
                        </HStack>
                      </Menu.Item>
                    </Menu.Content>
                  </Menu.Positioner>
                </Menu.Root>

                <Button
                  className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-4 py-2"
                  onClick={() => setIsOpen(true)}
                >
                  <HStack gap={2}>
                    <Plus size={18} />
                    <Text>Tạo mới</Text>
                  </HStack>
                </Button>
              </HStack>
            </Flex>
          </Card.Body>
        </Card.Root>
      </VStack>

      {/* Table */}
      <Card.Root>
        {isLoading ? (
          <Card.Body>
            <Flex justify="center" align="center" py={12}>
              <VStack gap={4}>
                <Spinner size="xl" />
                <Text color="gray.500">Đang tải...</Text>
              </VStack>
            </Flex>
          </Card.Body>
        ) : categories.length === 0 ? (
          <Card.Body>
            <Flex justify="center" align="center" py={12}>
              <VStack gap={4}>
                <Heading size="lg">Chưa có danh mục</Heading>
                <Text color="gray.500">
                  Bắt đầu bằng cách tạo danh mục đầu tiên
                </Text>
                <Button
                  className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-4 py-2"
                  onClick={() => setIsOpen(true)}
                >
                  <HStack gap={2}>
                    <Plus size={18} />
                    <Text>Tạo danh mục mới</Text>
                  </HStack>
                </Button>
              </VStack>
            </Flex>
          </Card.Body>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table.Root variant="outline">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader className="px-6 py-4">
                      STT
                    </Table.ColumnHeader>
                    <Table.ColumnHeader className="px-6 py-4">
                      Tên danh mục
                    </Table.ColumnHeader>
                    <Table.ColumnHeader className="px-6 py-4">
                      Danh mục cha
                    </Table.ColumnHeader>
                    <Table.ColumnHeader className="px-6 py-4">
                      Ngày tạo
                    </Table.ColumnHeader>
                    <Table.ColumnHeader className="px-6 py-4 text-center">
                      Thao tác
                    </Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {categories.map((category, index) => (
                    <Table.Row key={category.category_id}>
                      <Table.Cell className="px-6 py-4">
                        {(currentPage - 1) * pageSize + index + 1}
                      </Table.Cell>
                      <Table.Cell className="px-6 py-4 font-semibold">
                        {category.name}
                      </Table.Cell>
                      <Table.Cell className="px-6 py-4 text-gray-600">
                        {getParentName(category.parent_id)}
                      </Table.Cell>
                      <Table.Cell className="px-6 py-4 text-gray-600">
                        {formatDate(category.created_at)}
                      </Table.Cell>
                      <Table.Cell className="px-6 py-4" textAlign="center">
                        <IconButton
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:bg-red-50"
                          onClick={() =>
                            handleDeleteCategory(
                              category.category_id || "",
                              category.name
                            )
                          }
                          loading={deletingId === category.category_id}
                          disabled={deletingId === category.category_id}
                        >
                          <Trash2 size={18} />
                        </IconButton>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </div>

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
                    {Math.min(currentPage * pageSize, total)} trong tổng số{" "}
                    {total} danh mục
                  </Text>
                  <HStack gap={2}>
                    <IconButton
                      variant="outline"
                      size="sm"
                      className="rounded-lg border-2 border-gray-200 hover:border-gray-300"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
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
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight size={18} />
                    </IconButton>
                  </HStack>
                </Flex>
              </Card.Footer>
            )}
          </>
        )}
      </Card.Root>

      {/* Create Modal */}
      <Dialog.Root
        open={isOpen}
        onOpenChange={(e) => {
          setIsOpen(e.open);
          if (!e.open) {
            setNewCategoryName("");
            setNewCategoryParentId("");
          }
        }}
        initialFocusEl={() => inputRef.current}
      >
        <Portal>
          <Dialog.Backdrop className="fixed inset-0 bg-black/50 z-[1000]" />
          <Dialog.Positioner className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
            <Dialog.Content className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-[500px] w-full">
              <Dialog.Header className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <Dialog.Title className="text-xl font-semibold">
                  Tạo danh mục mới
                </Dialog.Title>
                <Dialog.CloseTrigger />
              </Dialog.Header>

              <Dialog.Body className="px-6 py-4">
                <Stack gap="4">
                  <Field.Root required>
                    <Field.Label className="font-medium mb-2">
                      Tên danh mục
                    </Field.Label>
                    <Input
                      ref={inputRef}
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Nhập tên danh mục..."
                      className="border-2 border-gray-200 focus:border-blue-500 rounded-lg px-4 py-2.5"
                    />
                  </Field.Root>

                  <Field.Root>
                    <Field.Label className="font-medium mb-2">
                      Danh mục cha (tùy chọn)
                    </Field.Label>
                    <NativeSelectRoot>
                      <NativeSelectField
                        value={newCategoryParentId}
                        onChange={(e) => setNewCategoryParentId(e.target.value)}
                        className="border-2 border-gray-200 focus:border-blue-500 rounded-lg px-4 py-2.5"
                      >
                        <option value="">-- Danh mục gốc --</option>
                        {allCategories.map((cat) => (
                          <option key={cat.category_id} value={cat.category_id}>
                            {cat.name}
                          </option>
                        ))}
                      </NativeSelectField>
                    </NativeSelectRoot>
                  </Field.Root>
                </Stack>
              </Dialog.Body>

              <Dialog.Footer className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
                <Dialog.ActionTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={isCreating}
                    className="rounded-lg px-4 py-2 border-2 border-gray-200 hover:border-gray-300"
                  >
                    Hủy
                  </Button>
                </Dialog.ActionTrigger>
                <Button
                  className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-4 py-2"
                  onClick={handleCreateCategory}
                  disabled={!newCategoryName.trim() || isCreating}
                  loading={isCreating}
                >
                  Tạo danh mục
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* Delete Confirmation Dialog */}
      <Dialog.Root
        open={deleteDialogOpen}
        onOpenChange={(e) => {
          setDeleteDialogOpen(e.open);
          if (!e.open) {
            setCategoryToDelete(null);
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
                    Bạn có chắc chắn muốn xóa danh mục{" "}
                    <Text as="span" fontWeight="bold">
                      "{categoryToDelete?.name}"
                    </Text>{" "}
                    không?
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Hành động này không thể hoàn tác.
                  </Text>
                </VStack>
              </Dialog.Body>

              <Dialog.Footer className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
                <Dialog.ActionTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={!!deletingId}
                    className="rounded-lg px-4 py-2 border-2 border-gray-200 hover:border-gray-300"
                  >
                    Hủy
                  </Button>
                </Dialog.ActionTrigger>
                <Button
                  className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-2"
                  onClick={confirmDelete}
                  disabled={!!deletingId}
                  loading={!!deletingId}
                >
                  Xóa danh mục
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Box>
  );
};

export default CategoryManagement;
