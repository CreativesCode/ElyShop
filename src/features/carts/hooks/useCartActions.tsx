"use client";
import { useToast } from "@/components/ui/use-toast";
import { User } from "@supabase/auth-helpers-nextjs";
import { useState } from "react";
import {
  createCartItem,
  findCartItemByOptions,
  updateCartItemQuantity,
} from "../api";
import useCartStore from "../useCartStore";

function useCartActions(user: User | null, productId: string) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const addProductStorage = useCartStore((s) => s.addProductToCart);

  const authAddOrUpdateProduct = async (
    quantity: number,
    color?: string | null,
    size?: string | null,
    material?: string | null,
  ) => {
    try {
      setIsLoading(true);

      // Buscar si ya existe esta combinación específica en el carrito
      const existedItem = await findCartItemByOptions(
        user!.id,
        productId,
        color,
        size,
        material,
      );

      if (existedItem) {
        // Actualizar cantidad de la combinación existente
        await updateCartItemQuantity(
          existedItem.id,
          existedItem.quantity + quantity,
        );
      } else {
        // Crear nueva entrada para esta combinación
        await createCartItem({
          product_id: productId,
          user_id: user!.id,
          quantity,
          color,
          size,
          material,
        });
      }

      toast({ title: "Success, Added a Product to the Cart." });

      // Refrescar el carrito (se hará mediante el componente padre)
      window.dispatchEvent(new Event("cart-updated"));
    } catch (err) {
      console.error("Error adding to cart:", err);
      toast({ title: "Error, Unexpected Error occurred." });
    } finally {
      setIsLoading(false);
    }
  };

  const guestAddProduct = (
    quantity: number,
    color?: string | null,
    size?: string | null,
    material?: string | null,
  ) => {
    addProductStorage(productId, quantity, color, size, material);
    toast({ title: "Success, Added a Product to the Cart." });
  };

  const addProductToCart = (
    quantity: number,
    color?: string | null,
    size?: string | null,
    material?: string | null,
  ) =>
    !user
      ? guestAddProduct(quantity, color, size, material)
      : authAddOrUpdateProduct(quantity, color, size, material);

  return { addProductToCart, isLoading };
}

export default useCartActions;
