"use client";
import { QuantityInput } from "@/components/layouts/QuantityInput";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { ColorPicker } from "@/features/products/components/ColorPicker";
import { MaterialSelector } from "@/features/products/components/MaterialSelector";
import { SizeSelector } from "@/features/products/components/SizeSelector";
import { useAuth } from "@/providers/AuthProvider";
import { useAvailableStock } from "../hooks/useAvailableStock";
import useCartActions from "../hooks/useCartActions";
import { AddProductCartData, AddProductToCartSchema } from "../validations";

interface AddProductToCartFormProps {
  productId: string;
  colors?: string[] | null;
  sizes?: string[] | null;
  materials?: string[] | null;
  onVariantChange?: {
    color?: (color: string | undefined) => void;
    size?: (size: string | undefined) => void;
    material?: (material: string | undefined) => void;
  };
}

function AddProductToCartForm({
  productId,
  colors,
  sizes,
  materials,
  onVariantChange,
}: AddProductToCartFormProps) {
  const { user } = useAuth();
  const { addProductToCart } = useCartActions(user, productId);

  const form = useForm<AddProductCartData>({
    resolver: zodResolver(AddProductToCartSchema),
    defaultValues: {
      quantity: 1,
      color: undefined,
      size: undefined,
      material: undefined,
    },
  });

  // Observar los valores actuales del formulario
  const selectedColor = form.watch("color");
  const selectedSize = form.watch("size");
  const selectedMaterial = form.watch("material");

  // Notificar cambios en las variantes
  useEffect(() => {
    onVariantChange?.color?.(selectedColor);
  }, [selectedColor, onVariantChange]);

  useEffect(() => {
    onVariantChange?.size?.(selectedSize);
  }, [selectedSize, onVariantChange]);

  useEffect(() => {
    onVariantChange?.material?.(selectedMaterial);
  }, [selectedMaterial, onVariantChange]);

  // Obtener el stock disponible para la variante seleccionada
  const { availableStock, isLoading: isLoadingStock } = useAvailableStock(
    productId,
    selectedColor,
    selectedSize,
    selectedMaterial,
  );

  // Limitar la cantidad máxima al stock disponible o 8 (lo que sea menor)
  const maxQuantity = availableStock !== null ? Math.min(availableStock, 8) : 8;

  async function onSubmit(values: AddProductCartData) {
    addProductToCart(
      values.quantity,
      values.color,
      values.size,
      values.material,
    );
  }

  const addOne = () => {
    const currQuantity = form.getValues("quantity");
    if (currQuantity < maxQuantity) form.setValue("quantity", currQuantity + 1);
  };
  const minusOne = () => {
    const currQuantity = form.getValues("quantity");
    if (currQuantity > 1) form.setValue("quantity", currQuantity - 1);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        {colors && colors.length > 0 && (
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <ColorPicker
                    colors={colors}
                    selectedColor={field.value || undefined}
                    onColorSelect={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {sizes && sizes.length > 0 && (
          <FormField
            control={form.control}
            name="size"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <SizeSelector
                    sizes={sizes}
                    selectedSize={field.value || undefined}
                    onSizeSelect={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {materials && materials.length > 0 && (
          <FormField
            control={form.control}
            name="material"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <MaterialSelector
                    materials={materials}
                    selectedMaterial={field.value || undefined}
                    onMaterialSelect={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex items-end gap-x-2">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Quantity</FormLabel>
                <div className="flex items-center gap-x-2">
                  <FormControl>
                    <QuantityInput
                      {...field}
                      addOneHandler={addOne}
                      minusOneHandler={minusOne}
                    />
                  </FormControl>
                  <Button
                    type="submit"
                    disabled={isLoadingStock || availableStock === 0}
                  >
                    Add to Cart
                  </Button>
                </div>
                {availableStock !== null && (
                  <p
                    className={`text-xs mt-1 ${
                      availableStock === 0
                        ? "text-red-500"
                        : availableStock <= 5
                          ? "text-orange-500"
                          : "text-gray-500"
                    }`}
                  >
                    {availableStock === 0
                      ? "Sin stock disponible"
                      : availableStock === 1
                        ? "¡Solo 1 unidad disponible!"
                        : availableStock <= 5
                          ? `¡Solo ${availableStock} unidades disponibles!`
                          : `${availableStock} unidades disponibles`}
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
}

export default AddProductToCartForm;
