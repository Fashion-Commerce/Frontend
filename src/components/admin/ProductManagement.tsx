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
  Package,
  Edit,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  productApi,
  Product,
  ProductsParams,
  CreateProductRequest,
  ProductVariant,
  ProductVariantsParams,
  CreateProductVariantRequest,
  UpdateProductVariantRequest,
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

  // Product Variants modal
  const [variantsDialogOpen, setVariantsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [isLoadingVariants, setIsLoadingVariants] = useState(false);
  const [variantPage, setVariantPage] = useState(1);
  const [variantPageSize] = useState(10);
  const [variantTotalPages, setVariantTotalPages] = useState(1);
  const [variantTotal, setVariantTotal] = useState(0);

  // Create/Edit Variant modal
  const [variantFormOpen, setVariantFormOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(
    null
  );
  const [variantForm, setVariantForm] = useState({
    sku: "",
    color: "",
    size: "",
    price: "",
    stock_quantity: "",
  });
  const [isSubmittingVariant, setIsSubmittingVariant] = useState(false);

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

  // Variant handlers
  const handleOpenVariants = async (product: Product) => {
    setSelectedProduct(product);
    setVariantsDialogOpen(true);
    setVariantPage(1);
    await loadVariants(product.product_id, 1);
  };

  const loadVariants = async (
    productId: string,
    page: number = variantPage
  ) => {
    try {
      setIsLoadingVariants(true);
      const params: ProductVariantsParams = {
        page,
        page_size: variantPageSize,
        product_id_filter: productId,
      };

      const response = await productApi.getProductVariants(params);
      setVariants(response.info.variants);
      setVariantTotal(response.info.total_count);
      setVariantTotalPages(response.info.total_pages);
    } catch (error: any) {
      toast.error(error.message || "Không thể tải danh sách biến thể");
    } finally {
      setIsLoadingVariants(false);
    }
  };

  const handleCreateVariant = () => {
    setEditingVariant(null);
    setVariantForm({
      sku: "",
      color: "",
      size: "",
      price: "",
      stock_quantity: "",
    });
    setVariantFormOpen(true);
  };

  const handleEditVariant = (variant: ProductVariant) => {
    setEditingVariant(variant);
    setVariantForm({
      sku: variant.sku,
      color: variant.color || "",
      size: variant.size || "",
      price: variant.price.toString(),
      stock_quantity: variant.stock_quantity.toString(),
    });
    setVariantFormOpen(true);
  };

  const handleSubmitVariant = async () => {
    if (!selectedProduct) return;

    // Validation
    if (
      !variantForm.sku ||
      !variantForm.color ||
      !variantForm.size ||
      !variantForm.price ||
      !variantForm.stock_quantity
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      setIsSubmittingVariant(true);

      if (editingVariant) {
        // Update variant
        const updateData: UpdateProductVariantRequest = {
          sku: variantForm.sku,
          color: variantForm.color,
          size: variantForm.size,
          price: parseFloat(variantForm.price),
          stock_quantity: parseInt(variantForm.stock_quantity),
        };

        const variantId =
          editingVariant.variant_id || editingVariant.product_variant_id;
        if (!variantId) {
          throw new Error("Variant ID not found");
        }

        await productApi.updateProductVariant(variantId, updateData);
        toast.success("Cập nhật biến thể thành công!");
      } else {
        // Create new variant
        const createData: CreateProductVariantRequest = {
          product_id: selectedProduct.product_id,
          sku: variantForm.sku,
          color: variantForm.color,
          size: variantForm.size,
          price: parseFloat(variantForm.price),
          stock_quantity: parseInt(variantForm.stock_quantity),
        };

        await productApi.createProductVariant(createData);
        toast.success("Tạo biến thể mới thành công!");
      }

      setVariantFormOpen(false);
      await loadVariants(selectedProduct.product_id);
    } catch (error: any) {
      toast.error(error.message || "Thao tác thất bại");
    } finally {
      setIsSubmittingVariant(false);
    }
  };

  const resetVariantForm = () => {
    setVariantForm({
      sku: "",
      color: "",
      size: "",
      price: "",
      stock_quantity: "",
    });
    setEditingVariant(null);
  };

  const getColorCode = (colorName: string): string => {
    const colorMap: Record<string, string> = {
      Đen: "#000000",
      Trắng: "#FFFFFF",
      Đỏ: "#FF0000",
      "Xanh dương": "#0000FF",
      "Xanh lá": "#00FF00",
      Vàng: "#FFFF00",
      Cam: "#FFA500",
      Hồng: "#FFC0CB",
      Tím: "#800080",
      Nâu: "#8B4513",
      Xám: "#808080",
      Be: "#F5F5DC",
      "Xanh navy": "#000080",
      XS: "#E0E0E0",
      S: "#E0E0E0",
      M: "#E0E0E0",
      L: "#E0E0E0",
      XL: "#E0E0E0",
      XXL: "#E0E0E0",
    };
    return colorMap[colorName] || "#E0E0E0";
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
                      <HStack gap={2} justify="center">
                        <IconButton
                          size="sm"
                          variant="ghost"
                          className="text-blue-500 hover:bg-blue-50"
                          onClick={() => handleOpenVariants(product)}
                          title="Quản lý biến thể"
                        >
                          <Package size={18} />
                        </IconButton>
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
                      </HStack>
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
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="relative group cursor-pointer transition-all duration-200 border-0 bg-transparent p-0 w-full"
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
                      </button>
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

      {/* Product Variants Dialog */}
      <Dialog.Root
        open={variantsDialogOpen}
        onOpenChange={(e) => {
          setVariantsDialogOpen(e.open);
          if (!e.open) {
            setSelectedProduct(null);
            setVariants([]);
          }
        }}
        size="xl"
      >
        <Portal>
          <Dialog.Backdrop className="!bg-black/50" />
          <Dialog.Positioner>
            <Dialog.Content className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
              <Dialog.Header className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <VStack align="stretch" gap={1}>
                  <Dialog.Title className="text-2xl font-bold">
                    Quản lý biến thể sản phẩm
                  </Dialog.Title>
                  <Text fontSize="sm" color="gray.600">
                    {selectedProduct?.name}
                  </Text>
                </VStack>
              </Dialog.Header>

              <Dialog.Body className="px-6 py-6 overflow-y-auto flex-1">
                <VStack gap={4} align="stretch">
                  {/* Header Actions */}
                  <Flex justify="space-between" align="center">
                    <Text fontSize="sm" color="gray.600">
                      Tổng số: {variantTotal} biến thể
                    </Text>
                    <Button
                      className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-4 py-2"
                      onClick={handleCreateVariant}
                    >
                      <HStack gap={2}>
                        <Plus size={18} />
                        <Text>Thêm biến thể</Text>
                      </HStack>
                    </Button>
                  </Flex>

                  {/* Variants Table */}
                  {isLoadingVariants ? (
                    <Flex justify="center" align="center" py={12}>
                      <VStack gap={4}>
                        <Spinner size="xl" />
                        <Text color="gray.500">Đang tải...</Text>
                      </VStack>
                    </Flex>
                  ) : variants.length === 0 ? (
                    <Flex justify="center" align="center" py={12}>
                      <VStack gap={4}>
                        <Package size={48} className="text-gray-300" />
                        <Heading size="md">Chưa có biến thể</Heading>
                        <Text color="gray.500">
                          Thêm biến thể đầu tiên cho sản phẩm này
                        </Text>
                        <Button
                          className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-4 py-2"
                          onClick={handleCreateVariant}
                        >
                          <HStack gap={2}>
                            <Plus size={18} />
                            <Text>Thêm biến thể</Text>
                          </HStack>
                        </Button>
                      </VStack>
                    </Flex>
                  ) : (
                    <Box className="border border-gray-200 rounded-lg overflow-hidden">
                      <Table.Root variant="outline">
                        <Table.Header>
                          <Table.Row>
                            <Table.ColumnHeader className="px-4 py-3">
                              STT
                            </Table.ColumnHeader>
                            <Table.ColumnHeader className="px-4 py-3">
                              SKU
                            </Table.ColumnHeader>
                            <Table.ColumnHeader className="px-4 py-3">
                              Màu sắc
                            </Table.ColumnHeader>
                            <Table.ColumnHeader className="px-4 py-3">
                              Kích cỡ
                            </Table.ColumnHeader>
                            <Table.ColumnHeader className="px-4 py-3">
                              Giá
                            </Table.ColumnHeader>
                            <Table.ColumnHeader className="px-4 py-3">
                              Tồn kho
                            </Table.ColumnHeader>
                            <Table.ColumnHeader className="px-4 py-3 text-center">
                              Thao tác
                            </Table.ColumnHeader>
                          </Table.Row>
                        </Table.Header>
                        <Table.Body>
                          {variants.map((variant, index) => (
                            <Table.Row
                              key={
                                variant.variant_id || variant.product_variant_id
                              }
                            >
                              <Table.Cell className="px-4 py-3">
                                {(variantPage - 1) * variantPageSize +
                                  index +
                                  1}
                              </Table.Cell>
                              <Table.Cell className="px-4 py-3 font-mono text-sm">
                                {variant.sku}
                              </Table.Cell>
                              <Table.Cell className="px-4 py-3">
                                <HStack gap={2}>
                                  <Box
                                    className="w-4 h-4 rounded-full border border-gray-300"
                                    style={{
                                      backgroundColor: getColorCode(
                                        variant.color || ""
                                      ),
                                    }}
                                  />
                                  <Text>{variant.color}</Text>
                                </HStack>
                              </Table.Cell>
                              <Table.Cell className="px-4 py-3">
                                <Box className="inline-block px-2 py-1 bg-gray-100 rounded text-sm font-medium">
                                  {variant.size}
                                </Box>
                              </Table.Cell>
                              <Table.Cell className="px-4 py-3 text-blue-600 font-medium">
                                {formatPrice(variant.price)}
                              </Table.Cell>
                              <Table.Cell className="px-4 py-3">
                                <Box
                                  className={`inline-block px-2 py-1 rounded text-sm font-medium ${
                                    variant.stock_quantity > 50
                                      ? "bg-green-100 text-green-700"
                                      : variant.stock_quantity > 10
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {variant.stock_quantity}
                                </Box>
                              </Table.Cell>
                              <Table.Cell
                                className="px-4 py-3"
                                textAlign="center"
                              >
                                <IconButton
                                  size="sm"
                                  variant="ghost"
                                  className="text-blue-500 hover:bg-blue-50"
                                  onClick={() => handleEditVariant(variant)}
                                >
                                  <Edit size={16} />
                                </IconButton>
                              </Table.Cell>
                            </Table.Row>
                          ))}
                        </Table.Body>
                      </Table.Root>
                    </Box>
                  )}

                  {/* Pagination */}
                  {variantTotalPages > 1 && (
                    <Flex justify="space-between" align="center">
                      <Text fontSize="sm" color="gray.600">
                        Trang {variantPage} / {variantTotalPages}
                      </Text>
                      <HStack gap={2}>
                        <IconButton
                          variant="outline"
                          size="sm"
                          className="rounded-lg border-2 border-gray-200"
                          onClick={() => {
                            const newPage = Math.max(1, variantPage - 1);
                            setVariantPage(newPage);
                            if (selectedProduct) {
                              loadVariants(selectedProduct.product_id, newPage);
                            }
                          }}
                          disabled={variantPage === 1}
                        >
                          <ChevronLeft size={18} />
                        </IconButton>
                        <IconButton
                          variant="outline"
                          size="sm"
                          className="rounded-lg border-2 border-gray-200"
                          onClick={() => {
                            const newPage = Math.min(
                              variantTotalPages,
                              variantPage + 1
                            );
                            setVariantPage(newPage);
                            if (selectedProduct) {
                              loadVariants(selectedProduct.product_id, newPage);
                            }
                          }}
                          disabled={variantPage === variantTotalPages}
                        >
                          <ChevronRight size={18} />
                        </IconButton>
                      </HStack>
                    </Flex>
                  )}
                </VStack>
              </Dialog.Body>

              <Dialog.Footer className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <Flex justify="flex-end">
                  <Dialog.CloseTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-2 border-gray-200 hover:border-gray-300 rounded-lg px-4 py-2"
                    >
                      Đóng
                    </Button>
                  </Dialog.CloseTrigger>
                </Flex>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* Create/Edit Variant Dialog */}
      <Dialog.Root
        open={variantFormOpen}
        onOpenChange={(e) => {
          setVariantFormOpen(e.open);
          if (!e.open) resetVariantForm();
        }}
      >
        <Portal>
          <Dialog.Backdrop className="!bg-black/50" />
          <Dialog.Positioner>
            <Dialog.Content className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4">
              <Dialog.Header className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <Dialog.Title className="text-xl font-bold">
                  {editingVariant ? "Cập nhật biến thể" : "Thêm biến thể mới"}
                </Dialog.Title>
              </Dialog.Header>

              <Dialog.Body className="px-6 py-6">
                <VStack gap={4} align="stretch">
                  <Field.Root>
                    <Field.Label className="font-medium mb-2">
                      SKU <span className="text-red-500">*</span>
                    </Field.Label>
                    <Input
                      placeholder="VD: SKU-001"
                      value={variantForm.sku}
                      onChange={(e) =>
                        setVariantForm({ ...variantForm, sku: e.target.value })
                      }
                      className="border-2 border-gray-200 focus:border-blue-500 rounded-lg px-4 py-2"
                    />
                  </Field.Root>

                  <Field.Root>
                    <Field.Label className="font-medium mb-2">
                      Màu sắc <span className="text-red-500">*</span>
                    </Field.Label>
                    <Input
                      placeholder="VD: Đen, Trắng, Xanh dương"
                      value={variantForm.color}
                      onChange={(e) =>
                        setVariantForm({
                          ...variantForm,
                          color: e.target.value,
                        })
                      }
                      className="border-2 border-gray-200 focus:border-blue-500 rounded-lg px-4 py-2"
                    />
                  </Field.Root>

                  <Field.Root>
                    <Field.Label className="font-medium mb-2">
                      Kích cỡ <span className="text-red-500">*</span>
                    </Field.Label>
                    <Input
                      placeholder="VD: S, M, L, XL"
                      value={variantForm.size}
                      onChange={(e) =>
                        setVariantForm({ ...variantForm, size: e.target.value })
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
                      placeholder="Nhập giá"
                      value={variantForm.price}
                      onChange={(e) =>
                        setVariantForm({
                          ...variantForm,
                          price: e.target.value,
                        })
                      }
                      className="border-2 border-gray-200 focus:border-blue-500 rounded-lg px-4 py-2"
                    />
                  </Field.Root>

                  <Field.Root>
                    <Field.Label className="font-medium mb-2">
                      Số lượng tồn kho <span className="text-red-500">*</span>
                    </Field.Label>
                    <Input
                      type="number"
                      placeholder="Nhập số lượng"
                      value={variantForm.stock_quantity}
                      onChange={(e) =>
                        setVariantForm({
                          ...variantForm,
                          stock_quantity: e.target.value,
                        })
                      }
                      className="border-2 border-gray-200 focus:border-blue-500 rounded-lg px-4 py-2"
                    />
                  </Field.Root>
                </VStack>
              </Dialog.Body>

              <Dialog.Footer className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <Flex justify="flex-end" gap={3}>
                  <Dialog.CloseTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-2 border-gray-200 hover:border-gray-300 rounded-lg px-4 py-2"
                    >
                      Hủy
                    </Button>
                  </Dialog.CloseTrigger>
                  <Button
                    className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-4 py-2"
                    onClick={handleSubmitVariant}
                    loading={isSubmittingVariant}
                    disabled={isSubmittingVariant}
                  >
                    {editingVariant ? "Cập nhật" : "Tạo mới"}
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
