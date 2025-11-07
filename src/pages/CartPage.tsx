import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cart from "@/components/Cart";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    items: cartItems,
    fetchCart,
    updateQuantity,
    removeItem,
  } = useCartStore();

  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user, fetchCart]);

  const handleCheckout = () => {
    if (!user) {
      console.log("Need login");
      return;
    }
    // Navigate to checkout page hoặc process order
    console.log("Proceed to checkout");
  };

  const handleUpdateQuantity = (cartItemId: string, newQuantity: number) => {
    updateQuantity(cartItemId, newQuantity);
  };

  const handleRemoveItem = (cartItemId: string) => {
    removeItem(cartItemId);
  };

  return (
    <Cart
      cartItems={cartItems}
      onClose={() => navigate("/")}
      onCheckout={handleCheckout}
      onUpdateQuantity={handleUpdateQuantity}
      onRemoveItem={handleRemoveItem}
    />
  );
};

export default CartPage;
