import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { productApi, type Product, type Category, type Brand, type ProductsParams } from '../api/product.api';

interface ProductState {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  selectedProduct: Product | null;
  isLoading: boolean;
  error: string | null;
  
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
      
      activeCategory: null,
      activeBrand: null,
      searchQuery: '',
      priceRange: null,

      fetchProducts: async (params) => {
        set({ isLoading: true, error: null });
        try {
          const { activeCategory, activeBrand, searchQuery, priceRange } = get();
          
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
          
          const products = await productApi.getProducts(queryParams);
          set({ products, isLoading: false });
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to fetch products', 
            isLoading: false 
          });
        }
      },

      fetchCategories: async () => {
        try {
          const categories = await productApi.getCategories({ page_size: 100 });
          set({ categories });
        } catch (error: any) {
          set({ error: error.message || 'Failed to fetch categories' });
        }
      },

      fetchBrands: async () => {
        try {
          const brands = await productApi.getBrands({ page_size: 100 });
          set({ brands });
        } catch (error: any) {
          set({ error: error.message || 'Failed to fetch brands' });
        }
      },

      fetchProductById: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const product = await productApi.getProductById(id);
          set({ selectedProduct: product, isLoading: false });
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to fetch product', 
            isLoading: false 
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

      clearFilters: () => {
        set({ 
          activeCategory: null,
          activeBrand: null,
          searchQuery: '',
          priceRange: null
        });
        get().fetchProducts();
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    { name: 'ProductStore' }
  )
);
