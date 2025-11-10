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
  Textarea,
  Image,
} from "@chakra-ui/react";
import {
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Check,
  X,
  Upload,
  ImageIcon,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  productApi,
  Product,
  ProductsParams,
  CreateProductRequest,
} from "@/api/product.api";
import { categoryApi, Category } from "@/api/category.api";
import { brandApi, Brand } from "@/api/brand.api";

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Search & Sort & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [brandFilter, setBrandFilter] = useState<string>("");

  // Create modal
  const [isOpen, setIsOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    base_price: "",
    category_id: "",
    brand_id: "",
    description: "",
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Delete confirmation modal
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{
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
      "base_price-asc": "Giá tăng dần",
      "base_price-desc": "Giá giảm dần",
    };
    return labels[key] || "Sắp xếp";
  };

  // Get category name
  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.category_id === categoryId);
    return category?.name || "N/A";
  };

  // Get brand name
  const getBrandName = (brandId: string) => {
    const brand = brands.find((b) => b.brand_id === brandId);
    return brand?.name || "N/A";
  };

  // Format price
  const formatPrice = (price?: number) => {
    if (!price && price !== 0) return "N/A";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  useEffect(() => {
    loadProducts();
  }, [currentPage, searchTerm, sortBy, sortOrder, categoryFilter, brandFilter]);

  useEffect(() => {
    loadCategories();
    loadBrands();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const params: ProductsParams = {
        page: currentPage,
        page_size: pageSize,
        sort_by: sortBy,
        sort_order: sortOrder,
      };

      if (searchTerm) {
        params.name_search = searchTerm;
      }
      if (categoryFilter) {
        params.category_id_filter = categoryFilter;
      }
      if (brandFilter) {
        params.brand_id_filter = brandFilter;
      }

      const response = await productApi.getProducts(params);
      setProducts(response.info.products);
      setTotal(response.info.total_count);
      setTotalPages(response.info.total_pages);
    } catch (error: any) {
      toast.error(error.message || "Không thể tải danh sách sản phẩm");
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoryApi.getCategories({
        page: 1,
        page_size: 100,
      });
      setCategories(response.info.categories);
    } catch (error: any) {
      console.error("Failed to load categories:", error);
    }
  };

  const loadBrands = async () => {
    try {
      const response = await brandApi.getBrands({
        page: 1,
        page_size: 100,
      });
      setBrands(response.info.brands);
    } catch (error: any) {
      console.error("Failed to load brands:", error);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedImages.length > 5) {
      toast.error("Chỉ được chọn tối đa 5 ảnh");
      return;
    }

    // Validate file types
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`File ${file.name} không phải là ảnh`);
        return false;
      }
      return true;
    });

    setSelectedImages([...selectedImages, ...validFiles]);

    // Create previews
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateProduct = async () => {
    if (!newProduct.name.trim()) {
      toast.error("Vui lòng nhập tên sản phẩm");
      return;
    }
    if (!newProduct.base_price || parseFloat(newProduct.base_price) <= 0) {
      toast.error("Vui lòng nhập giá hợp lệ");
      return;
    }
    if (!newProduct.category_id) {
      toast.error("Vui lòng chọn danh mục");
      return;
    }
    if (!newProduct.brand_id) {
      toast.error("Vui lòng chọn thương hiệu");
      return;
    }

    try {
      setIsCreating(true);
      const productData: CreateProductRequest = {
        name: newProduct.name.trim(),
        base_price: parseFloat(newProduct.base_price),
        category_id: newProduct.category_id,
        brand_id: newProduct.brand_id,
        description: newProduct.description.trim() || undefined,
        images: selectedImages.length > 0 ? selectedImages : undefined,
      };

      await productApi.createProduct(productData);
      toast.success("Tạo sản phẩm thành công!");
      setIsOpen(false);
      resetForm();
      setCurrentPage(1);
      await loadProducts();
    } catch (error: any) {
      toast.error(error.message || "Tạo sản phẩm thất bại");
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setNewProduct({
      name: "",
      base_price: "",
      category_id: "",
      brand_id: "",
      description: "",
    });
    setSelectedImages([]);
    setImagePreviews([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDeleteProduct = async (
    productId: string,
    productName: string
  ) => {
    setProductToDelete({ id: productId, name: productName });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      setDeletingId(productToDelete.id);
      await productApi.deleteProduct(productToDelete.id);
      toast.success("Xóa sản phẩm thành công!");
      await loadProducts();
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch (error: any) {
      toast.error(error.message || "Xóa sản phẩm thất bại");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString?: string | null) => {
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
    <Box p={6}>
      {/* Header */}
      <VStack align="stretch" gap={6} mb={6}>
        <Box>
          <Heading className="text-4xl font-bold" mb={2}>
            Quản lý sản phẩm
          </Heading>
          <Text color="gray.600">Quản lý các sản phẩm trong hệ thống</Text>
        </Box>

        {/* Stats Cards */}
        <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
          <Card.Root>
            <Card.Body className="px-6 py-4">
              <Stack gap={1}>
                <Text fontSize="sm" color="gray.600">
                  Tổng sản phẩm
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
                <Heading size="2xl">{products.length}</Heading>
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
                placeholder="Tìm kiếm theo tên sản phẩm..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                maxW={{ md: "400px" }}
                className="border-2 border-gray-200 focus:border-blue-500 rounded-lg px-4 py-2"
              />

              {/* Filters & Sort & Create Button */}
              <Flex
                gap={3}
                align="center"
                wrap="wrap"
                flex={1}
                justify="flex-end"
              >
                <NativeSelectRoot maxW={{ md: "180px" }}>
                  <NativeSelectField
                    value={categoryFilter}
                    onChange={(e) => {
                      setCategoryFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="border-2 border-gray-200 rounded-lg px-3 py-2"
                  >
                    <option value="">Tất cả danh mục</option>
                    {categories.map((category) => (
                      <option
                        key={category.category_id}
                        value={category.category_id}
                      >
                        {category.name}
                      </option>
                    ))}
                  </NativeSelectField>
                </NativeSelectRoot>

                <NativeSelectRoot maxW={{ md: "180px" }}>
                  <NativeSelectField
                    value={brandFilter}
                    onChange={(e) => {
                      setBrandFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="border-2 border-gray-200 rounded-lg px-3 py-2"
                  >
                    <option value="">Tất cả thương hiệu</option>
                    {brands.map((brand) => (
                      <option key={brand.brand_id} value={brand.brand_id}>
                        {brand.name}
                      </option>
                    ))}
                  </NativeSelectField>
                </NativeSelectRoot>

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
                      <Menu.Item
                        value="base_price-asc"
                        onClick={() => {
                          setSortBy("base_price");
                          setSortOrder("asc");
                        }}
                        className="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <HStack justify="space-between" flex={1}>
                          <Text>Giá tăng dần</Text>
                          {sortBy === "base_price" && sortOrder === "asc" && (
                            <Check size={16} className="text-green-500" />
                          )}
                        </HStack>
                      </Menu.Item>
                      <Menu.Item
                        value="base_price-desc"
                        onClick={() => {
                          setSortBy("base_price");
                          setSortOrder("desc");
                        }}
                        className="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <HStack justify="space-between" flex={1}>
                          <Text>Giá giảm dần</Text>
                          {sortBy === "base_price" && sortOrder === "desc" && (
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
              </Flex>
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
        ) : products.length === 0 ? (
          <Card.Body>
            <Flex justify="center" align="center" py={12}>
              <VStack gap={4}>
                <Heading size="lg">Chưa có sản phẩm</Heading>
                <Text color="gray.500">
                  Bắt đầu bằng cách tạo sản phẩm đầu tiên
                </Text>
                <Button
                  className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-4 py-2"
                  onClick={() => setIsOpen(true)}
                >
                  <HStack gap={2}>
                    <Plus size={18} />
                    <Text>Tạo sản phẩm mới</Text>
                  </HStack>
                </Button>
              </VStack>
            </Flex>
          </Card.Body>
        ) : (
          <>
            <Table.Root variant="outline">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader className="px-6 py-4">
                    STT
                  </Table.ColumnHeader>
                  <Table.ColumnHeader className="px-6 py-4">
                    Ảnh
                  </Table.ColumnHeader>
                  <Table.ColumnHeader className="px-6 py-4">
                    Tên sản phẩm
                  </Table.ColumnHeader>
                  <Table.ColumnHeader className="px-6 py-4">
                    Giá
                  </Table.ColumnHeader>
                  <Table.ColumnHeader className="px-6 py-4">
                    Danh mục
                  </Table.ColumnHeader>
                  <Table.ColumnHeader className="px-6 py-4">
                    Thương hiệu
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
                {products.map((product, index) => (
                  <Table.Row key={product.product_id}>
                    <Table.Cell className="px-6 py-4">
                      {(currentPage - 1) * pageSize + index + 1}
                    </Table.Cell>
                    <Table.Cell className="px-6 py-4">
                      {product.image_urls && product.image_urls.length > 0 ? (
                        <Image
                          src={product.image_urls[0]}
                          alt={product.name}
                          boxSize="50px"
                          objectFit="cover"
                          borderRadius="md"
                        />
                      ) : (
                        <Box
                          boxSize="50px"
                          bg="gray.200"
                          borderRadius="md"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <ImageIcon size={20} className="text-gray-400" />
                        </Box>
                      )}
                    </Table.Cell>
                    <Table.Cell className="px-6 py-4 font-semibold">
                      {product.name}
                    </Table.Cell>
                    <Table.Cell className="px-6 py-4 text-blue-600 font-medium">
                      {formatPrice(product.base_price || product.price)}
                    </Table.Cell>
                    <Table.Cell className="px-6 py-4 text-gray-600">
                      {product.category_name ||
                        getCategoryName(product.category_id)}
                    </Table.Cell>
                    <Table.Cell className="px-6 py-4 text-gray-600">
                      {product.brand_name || getBrandName(product.brand_id)}
                    </Table.Cell>
                    <Table.Cell className="px-6 py-4 text-gray-600">
                      {formatDate(product.created_at)}
                    </Table.Cell>
                    <Table.Cell className="px-6 py-4" textAlign="center">
                      <IconButton
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:bg-red-50"
                        onClick={() =>
                          handleDeleteProduct(
                            product.product_id || "",
                            product.name
                          )
                        }
                        loading={deletingId === product.product_id}
                        disabled={deletingId === product.product_id}
                      >
                        <Trash2 size={18} />
                      </IconButton>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>

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
                    {total} sản phẩm
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

      {/* Create Product Dialog */}
      <Dialog.Root
        open={isOpen}
        onOpenChange={(e) => {
          setIsOpen(e.open);
          if (!e.open) resetForm();
        }}
        size="xl"
      >
        <Portal>
          <Dialog.Backdrop className="!bg-black/50" />
          <Dialog.Positioner>
            <Dialog.Content className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full mx-4">
              <Dialog.Header className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <Dialog.Title className="text-2xl font-bold">
                  Tạo sản phẩm mới
                </Dialog.Title>
              </Dialog.Header>

              <Dialog.Body className="px-6 py-6">
                <VStack gap={4} align="stretch">
                  <Field.Root>
                    <Field.Label className="font-medium mb-2">
                      Tên sản phẩm <span className="text-red-500">*</span>
                    </Field.Label>
                    <Input
                      placeholder="Nhập tên sản phẩm"
                      value={newProduct.name}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, name: e.target.value })
                      }
                      className="border-2 border-gray-200 focus:border-blue-500 rounded-lg px-4 py-2"
                    />
                  </Field.Root>

                  <Field.Root>
                    <Field.Label className="font-medium mb-2">
                      Giá <span className="text-red-500">*</span>
                    </Field.Label>
                    <Input
                      type="number"
                      placeholder="Nhập giá sản phẩm"
                      value={newProduct.base_price}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          base_price: e.target.value,
                        })
                      }
                      className="border-2 border-gray-200 focus:border-blue-500 rounded-lg px-4 py-2"
                    />
                  </Field.Root>

                  <Field.Root>
                    <Field.Label className="font-medium mb-2">
                      Danh mục <span className="text-red-500">*</span>
                    </Field.Label>
                    <NativeSelectRoot>
                      <NativeSelectField
                        value={newProduct.category_id}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            category_id: e.target.value,
                          })
                        }
                        className="border-2 border-gray-200 rounded-lg px-4 py-2"
                      >
                        <option value="">Chọn danh mục</option>
                        {categories.map((category) => (
                          <option
                            key={category.category_id}
                            value={category.category_id}
                          >
                            {category.name}
                          </option>
                        ))}
                      </NativeSelectField>
                    </NativeSelectRoot>
                  </Field.Root>

                  <Field.Root>
                    <Field.Label className="font-medium mb-2">
                      Thương hiệu <span className="text-red-500">*</span>
                    </Field.Label>
                    <NativeSelectRoot>
                      <NativeSelectField
                        value={newProduct.brand_id}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            brand_id: e.target.value,
                          })
                        }
                        className="border-2 border-gray-200 rounded-lg px-4 py-2"
                      >
                        <option value="">Chọn thương hiệu</option>
                        {brands.map((brand) => (
                          <option key={brand.brand_id} value={brand.brand_id}>
                            {brand.name}
                          </option>
                        ))}
                      </NativeSelectField>
                    </NativeSelectRoot>
                  </Field.Root>

                  <Field.Root>
                    <Field.Label className="font-medium mb-2">
                      Mô tả
                    </Field.Label>
                    <Textarea
                      placeholder="Nhập mô tả sản phẩm"
                      value={newProduct.description}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          description: e.target.value,
                        })
                      }
                      rows={4}
                      className="border-2 border-gray-200 focus:border-blue-500 rounded-lg px-4 py-2"
                    />
                  </Field.Root>

                  <Field.Root>
                    <Field.Label className="font-medium mb-2">
                      Ảnh sản phẩm (Tối đa 5 ảnh)
                    </Field.Label>
                    <VStack gap={4} align="stretch">
                      <Box
                        as="button"
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="relative group cursor-pointer transition-all duration-200"
                      >
                        <Box className="border-2 border-dashed border-gray-300 group-hover:border-blue-500 rounded-xl p-8 bg-gray-50 group-hover:bg-blue-50 transition-all duration-200">
                          <VStack gap={3}>
                            <Box className="p-4 bg-white rounded-full group-hover:bg-blue-100 transition-all duration-200 shadow-sm">
                              <Upload
                                size={28}
                                className="text-gray-400 group-hover:text-blue-500 transition-colors duration-200"
                              />
                            </Box>
                            <VStack gap={1}>
                              <Text className="font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-200">
                                Nhấn để chọn ảnh
                              </Text>
                              <Text fontSize="sm" color="gray.500">
                                Hỗ trợ: JPG, PNG, WEBP (Tối đa 5 ảnh)
                              </Text>
                            </VStack>
                          </VStack>
                        </Box>
                      </Box>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageSelect}
                        className="hidden"
                        aria-label="Upload product images"
                      />

                      {imagePreviews.length > 0 && (
                        <Box className="bg-gray-50 rounded-lg p-4">
                          <Text
                            fontSize="sm"
                            fontWeight="medium"
                            mb={3}
                            color="gray.700"
                          >
                            Ảnh đã chọn ({imagePreviews.length}/5)
                          </Text>
                          <SimpleGrid columns={5} gap={3}>
                            {imagePreviews.map((preview, index) => (
                              <Box
                                key={index}
                                position="relative"
                                className="group"
                              >
                                <Box className="relative overflow-hidden rounded-lg border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                                  <Image
                                    src={preview}
                                    alt={`Preview ${index + 1}`}
                                    boxSize="100px"
                                    objectFit="cover"
                                  />
                                  <Box className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity duration-200" />
                                </Box>
                                <IconButton
                                  size="xs"
                                  position="absolute"
                                  top={-2}
                                  right={-2}
                                  className="bg-red-500 text-white hover:bg-red-600 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                  onClick={() => removeImage(index)}
                                >
                                  <X size={14} />
                                </IconButton>
                              </Box>
                            ))}
                          </SimpleGrid>
                        </Box>
                      )}
                    </VStack>
                  </Field.Root>
                </VStack>
              </Dialog.Body>

              <Dialog.Footer className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <Flex justify="flex-end" gap={3}>
                  <Dialog.CloseTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsOpen(false);
                        resetForm();
                      }}
                      className="border-2 border-gray-200 hover:border-gray-300 rounded-lg px-4 py-2"
                    >
                      Hủy
                    </Button>
                  </Dialog.CloseTrigger>
                  <Button
                    className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-4 py-2"
                    onClick={handleCreateProduct}
                    loading={isCreating}
                    disabled={isCreating}
                  >
                    Tạo sản phẩm
                  </Button>
                </Flex>
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
          if (!e.open) setProductToDelete(null);
        }}
      >
        <Portal>
          <Dialog.Backdrop className="!bg-black/50" />
          <Dialog.Positioner>
            <Dialog.Content className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4">
              <Dialog.Header className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <Dialog.Title className="text-2xl font-bold text-red-600">
                  Xác nhận xóa
                </Dialog.Title>
              </Dialog.Header>

              <Dialog.Body className="px-6 py-6">
                <Text>
                  Bạn có chắc chắn muốn xóa sản phẩm{" "}
                  <span className="font-bold">"{productToDelete?.name}"</span>{" "}
                  không?
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
                      onClick={() => {
                        setDeleteDialogOpen(false);
                        setProductToDelete(null);
                      }}
                      className="border-2 border-gray-200 hover:border-gray-300 rounded-lg px-4 py-2"
                    >
                      Hủy
                    </Button>
                  </Dialog.CloseTrigger>
                  <Button
                    className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-2"
                    onClick={confirmDelete}
                    loading={!!deletingId}
                    disabled={!!deletingId}
                  >
                    Xóa
                  </Button>
                </Flex>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Box>
  );
};

export default ProductManagement;
