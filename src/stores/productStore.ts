import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  productApi,
  type Product as ApiProduct,
  type ProductsParams,
} from "../api/product.api";
import { categoryApi, type Category } from "../api/category.api";
import { brandApi, type Brand } from "../api/brand.api";
import type { Product } from "../types";

// Normalize API product to frontend product
const normalizeProduct = (apiProduct: ApiProduct): Product => {
  const product = apiProduct as any;
  return {
    ...product,
    id: product.product_id || product.id,
    product_id: product.product_id || product.id,
    basePrice: product.base_price || product.price || 0,
    imageUrls: product.image_urls || product.images || [],
    averageRating: product.average_rating || 0,
    reviewCount: product.review_count || 0,
    variants: product.variants || [],
  } as Product;
};

interface ProductState {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  selectedProduct: Product | null;
  isLoading: boolean;
  error: string | null;

  // Pagination
  currentPage: number;
  totalPages: number;
  totalCount: number;

  // Filters
  activeCategory: string | null;
  activeBrand: string | null;
  searchQuery: string;
  priceRange: [number, number] | null;

  // Actions
  fetchProducts: (params?: ProductsParams) => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchBrands: () => Promise<void>;
  fetchProductById: (id: string) => Promise<void>;
  setSelectedProduct: (product: Product | null) => void;
  setActiveCategory: (categoryId: string | null) => void;
  setActiveBrand: (brandId: string | null) => void;
  setSearchQuery: (query: string) => void;
  setPriceRange: (range: [number, number] | null) => void;
  setCurrentPage: (page: number) => void;
  clearFilters: () => void;
  clearError: () => void;
}

export const useProductStore = create<ProductState>()(
  devtools(
    (set, get) => ({
      products: [],
      categories: [],
      brands: [],
      selectedProduct: null,
      isLoading: false,
      error: null,

      currentPage: 1,
      totalPages: 1,
      totalCount: 0,

      activeCategory: null,
      activeBrand: null,
      searchQuery: "",
      priceRange: null,

      fetchProducts: async (params) => {
        set({ isLoading: true, error: null });
        try {
          const { activeCategory, activeBrand, searchQuery, priceRange } =
            get();

          const queryParams: ProductsParams = {
            page: 1,
            page_size: 100,
            ...params,
          };

          // Apply filters from state if not overridden
          if (!params?.category_id_filter && activeCategory) {
            queryParams.category_id_filter = activeCategory;
          }
          if (!params?.brand_id_filter && activeBrand) {
            queryParams.brand_id_filter = activeBrand;
          }
          if (!params?.name_search && searchQuery) {
            queryParams.name_search = searchQuery;
          }
          if (!params?.price_min && priceRange) {
            queryParams.price_min = priceRange[0];
            queryParams.price_max = priceRange[1];
          }

          const response = await productApi.getProducts(queryParams);
          const normalizedProducts =
            response.info.products.map(normalizeProduct);
          set({
            products: normalizedProducts,
            totalPages: response.info.total_pages,
            totalCount: response.info.total_count,
            currentPage: response.info.current_page,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.message || "Failed to fetch products",
            isLoading: false,
          });
        }
      },

      fetchCategories: async () => {
        try {
          const response = await categoryApi.getCategories({ page_size: 100 });
          set({ categories: response.info.categories });
        } catch (error: any) {
          set({ error: error.message || "Failed to fetch categories" });
        }
      },

      fetchBrands: async () => {
        try {
          const response = await brandApi.getBrands({ page_size: 100 });
          set({ brands: response.info.brands });
        } catch (error: any) {
          set({ error: error.message || "Failed to fetch brands" });
        }
      },

      fetchProductById: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await productApi.getProductById(id);
          const normalizedProduct = normalizeProduct(response.info.product);
          set({ selectedProduct: normalizedProduct, isLoading: false });
        } catch (error: any) {
          set({
            error: error.message || "Failed to fetch product",
            isLoading: false,
          });
        }
      },

      setSelectedProduct: (product) => {
        set({ selectedProduct: product });
      },

      setActiveCategory: (categoryId) => {
        set({ activeCategory: categoryId });
        get().fetchProducts();
      },

      setActiveBrand: (brandId) => {
        set({ activeBrand: brandId });
        get().fetchProducts();
      },

      setSearchQuery: (query) => {
        set({ searchQuery: query });
        get().fetchProducts();
      },

      setPriceRange: (range) => {
        set({ priceRange: range });
        get().fetchProducts();
      },

      setCurrentPage: (page) => {
        set({ currentPage: page });
      },

      clearFilters: () => {
        set({
          activeCategory: null,
          activeBrand: null,
          searchQuery: "",
          priceRange: null,
        });
        get().fetchProducts();
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    { name: "ProductStore" }
  )
);
