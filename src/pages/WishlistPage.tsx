import React from "react";
import { useNavigate } from "react-router-dom";
import Wishlist from "@/components/Wishlist";
import { useProductStore } from "@/stores/productStore";

const WishlistPage: React.FC = () => {
  const navigate = useNavigate();
  const { products } = useProductStore();

  // Placeholder - sẽ có wishlist store sau
  const wishlist: string[] = [];
  const wishlistItems = products.filter((p) =>
    wishlist.includes(p.id || p.product_id),
  );

  const handleRemoveFromWishlist = (productId: string) => {
    console.log("Remove from wishlist:", productId);
  };

  const handleProductClick = (product: any) => {
    console.log("Product clicked:", product);
  };

  return (
    <Wishlist
      wishlistItems={wishlistItems}
      onClose={() => navigate("/")}
      onRemoveFromWishlist={handleRemoveFromWishlist}
      onProductClick={handleProductClick}
    />
  );
};

export default WishlistPage;
