import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, Heading, Flex, Text, IconButton } from "@chakra-ui/react";
import { ArrowLeft } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import ProductDetailModal from "@/components/ProductDetailModal";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";
import { productApi } from "@/api/product.api";
import type { Product, ProductVariant } from "@/types";
import type { ArtifactProduct } from "@/components/ArtifactCarousel";

const ArtifactProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { addToCart } = useCartStore();

  const products = (location.state?.products as ArtifactProduct[]) || [];
  const artifactTitle = location.state?.title || "Sản phẩm gợi ý";

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loadingProductDetail, setLoadingProductDetail] = useState(false);
  const [wishlist] = useState<string[]>([]);

  const handleProductClick = async (artifactProduct: ArtifactProduct) => {
    try {
      setLoadingProductDetail(true);
      const response = await productApi.getProductById(artifactProduct.id);

      const fullProduct: Product = {
        ...response.info.product,
        id: response.info.product.product_id || response.info.product.id,
        product_id:
          response.info.product.product_id || response.info.product.id,
        basePrice:
          response.info.product.base_price || response.info.product.price || 0,
        base_price:
          response.info.product.base_price || response.info.product.price || 0,
        price:
          response.info.product.base_price || response.info.product.price || 0,
        imageUrls: response.info.product.image_urls || [],
        image_urls: response.info.product.image_urls || [],
        averageRating: response.info.product.average_rating || 0,
        average_rating: response.info.product.average_rating || 0,
        reviewCount: response.info.product.review_count || 0,
        review_count: response.info.product.review_count || 0,
        brand: {
          name: response.info.product.brand_name || "",
        },
        category: {
          name: response.info.product.category_name || "",
        },
        variants: response.info.product.variants || [],
      };

      setSelectedProduct(fullProduct);
    } catch (error) {
      console.error("Failed to load product details:", error);
    } finally {
      setLoadingProductDetail(false);
    }
  };

  const handleToggleWishlist = (productId: string) => {
    if (!user) {
      console.log("Need login");
      return;
    }
    console.log("Toggle wishlist:", productId);
  };

  const handleAddToCart = async (
    product: Product,
    variant: ProductVariant,
    quantity: number
  ) => {
    if (!user) {
      console.log("Need login");
      return;
    }

    const userId = user.user_id || user.id || "";
    const variantId =
      variant.variant_id || variant.product_variant_id || variant.id || "";

    if (userId && variantId) {
      await addToCart(userId, variantId, quantity);
    }
  };

  return (
    <>
      <Box
        style={{
          backgroundColor: "#F4F6F8",
          minHeight: "100vh",
          padding: "2rem 1rem",
        }}
      >
        {/* Header */}
        <Flex
          align="center"
          gap={3}
          mb={6}
          style={{ maxWidth: "1400px", margin: "0 auto" }}
        >
          <IconButton
            aria-label="Quay lại"
            onClick={() => navigate("/")}
            size="md"
            borderRadius="full"
            style={{
              backgroundColor: "white",
              color: "#C89B6D",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
            _hover={{
              backgroundColor: "#C89B6D",
              color: "white",
            }}
          >
            <ArrowLeft size={20} />
          </IconButton>
          <Box>
            <Heading
              size="lg"
              style={{
                fontFamily: "Montserrat, sans-serif",
                color: "#333333",
              }}
            >
              {artifactTitle}
            </Heading>
            <Text fontSize="sm" style={{ color: "#666666", marginTop: "4px" }}>
              {products.length} sản phẩm
            </Text>
          </Box>
        </Flex>

        {/* Products Grid using ProductCard */}
        <Box style={{ maxWidth: "1400px", margin: "0 auto" }}>
          {products.length === 0 ? (
            <Flex justify="center" align="center" py={20}>
              <Text style={{ color: "#666666", fontSize: "18px" }}>
                Không có sản phẩm nào
              </Text>
            </Flex>
          ) : (
            <Box
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "16px",
              }}
            >
              {products.map((product) => {
                // Convert ArtifactProduct to Product format for ProductCard
                const productData: Product = {
                  id: product.id,
                  product_id: product.id,
                  name: product.name,
                  basePrice: product.base_price,
                  base_price: product.base_price,
                  price: product.base_price,
                  imageUrls: product.image_urls,
                  image_urls: product.image_urls,
                  description: product.description,
                  averageRating: product.average_rating,
                  average_rating: product.average_rating,
                  reviewCount: product.review_count,
                  review_count: product.review_count,
                  brand_id: product.brand_id || "",
                  category_id: product.category_id || "",
                  brand: { name: "" },
                  category: { name: "" },
                  variants: [],
                };

                return (
                  <ProductCard
                    key={product.id}
                    product={productData}
                    onProductClick={() => handleProductClick(product)}
                    onToggleWishlist={handleToggleWishlist}
                    isWishlisted={wishlist.includes(product.id)}
                  />
                );
              })}
            </Box>
          )}
        </Box>
      </Box>

      {/* Loading Spinner */}
      {loadingProductDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && !loadingProductDetail && (
        <ProductDetailModal
          product={selectedProduct}
          relatedProducts={[]}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          onProductClick={async (p) => {
            const artifactProd = products.find(
              (ap) => ap.id === (p.id || p.product_id)
            );
            if (artifactProd) {
              await handleProductClick(artifactProd);
            }
          }}
        />
      )}
    </>
  );
};

export default ArtifactProductsPage;
