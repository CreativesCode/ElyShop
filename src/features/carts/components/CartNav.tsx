"use client";
import { useAuth } from "@/providers/AuthProvider";
import { User } from "@supabase/auth-helpers-nextjs";
import { useEffect, useMemo, useState } from "react";
import { getCartItems } from "../api";
import useCartStore, { calcProductCountStorage } from "../useCartStore";
import CartLink from "./CartLink";

function CartNav() {
  const { user } = useAuth();
  return <>{!user ? <GuestCart /> : <UserCartNav currentUser={user} />}</>;
}

const GuestCart = () => {
  const cart = useCartStore((s) => s.cart);

  const productCountStorage = useMemo(
    () => calcProductCountStorage(cart),
    [cart],
  );
  return <CartLink productCount={productCountStorage} />;
};

const UserCartNav = ({ currentUser }: { currentUser: User }) => {
  const [cart, setCart] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  const loadCart = async () => {
    try {
      setFetching(true);
      const items = await getCartItems(currentUser.id);
      setCart(items || []);
    } catch (error) {
      console.error("Error loading cart:", error);
      setCart([]);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadCart();

    // Escuchar evento de actualización del carrito
    const handleCartUpdate = () => loadCart();
    window.addEventListener("cart-updated", handleCartUpdate);
    return () => window.removeEventListener("cart-updated", handleCartUpdate);
  }, [currentUser.id]);

  const productCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + (item.quantity || 0), 0);
  }, [cart]);

  if (fetching) {
    return <CartLink productCount={0} />;
  }

  return <CartLink productCount={productCount} />;
};

export default CartNav;
