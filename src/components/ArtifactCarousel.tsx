import React from "react";
import { Box, Flex, Text } from "@chakra-ui/react";

export interface ArtifactProduct {
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

interface ArtifactCarouselProps {
  products: ArtifactProduct[];
  onViewAll: () => void;
}

const ArtifactCarousel: React.FC<ArtifactCarouselProps> = ({
  products,
  onViewAll,
}) => {
  // Show only first 3 products as thumbnails
  const displayProducts = products.slice(0, 3);
  const remainingCount = products.length > 3 ? products.length - 3 : 0;

  return (
    <Flex
      onClick={onViewAll}
      style={{
        width: "100%",
        backgroundColor: "rgba(200, 155, 109, 0.05)",
        borderRadius: "12px",
        border: "1px solid rgba(200, 155, 109, 0.2)",
        padding: "8px",
        cursor: "pointer",
        transition: "all 0.2s",
      }}
      align="center"
      gap={2}
      className="hover:bg-opacity-80"
    >
      {/* Show 3 thumbnails */}
      {displayProducts.map((product, idx) => {
        const imageUrl = product.image_urls?.[0] || "";
        const isLastImage = idx === 2 && remainingCount > 0;

        return (
          <Box
            key={`${product.id}-${idx}`}
            style={{
              minWidth: "60px",
              width: "60px",
              height: "60px",
              borderRadius: "8px",
              overflow: "hidden",
              border: "2px solid #E9ECEF",
              backgroundColor: "#F4F6F8",
              position: "relative",
            }}
          >
            {imageUrl ? (
              <>
                <img
                  src={imageUrl}
                  alt={product.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                />
                {/* Dark overlay with +X on 3rd image */}
                {isLastImage && (
                  <Box
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      backgroundColor: "rgba(0, 0, 0, 0.6)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      fontSize="xl"
                      fontWeight="bold"
                      style={{ color: "white" }}
                    >
                      +{remainingCount}
                    </Text>
                  </Box>
                )}
              </>
            ) : (
              <Box
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text fontSize="xs" style={{ color: "#999999" }}>
                  No Image
                </Text>
              </Box>
            )}
          </Box>
        );
      })}

      {/* "Xem sản phẩm" text on the right */}
      <Text
        fontSize="sm"
        fontWeight="600"
        style={{
          color: "#C89B6D",
          fontFamily: "Montserrat, sans-serif",
          flex: 1,
        }}
      >
        Xem sản phẩm
      </Text>
    </Flex>
  );
};

export default ArtifactCarousel;
