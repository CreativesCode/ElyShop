"use client";
import { QuantityInput } from "@/components/layouts/QuantityInput";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
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
import useCartActions from "../hooks/useCartActions";
import { AddProductCartData, AddProductToCartSchema } from "../validations";

interface AddProductToCartFormProps {
  productId: string;
  colors?: string[] | null;
  sizes?: string[] | null;
  materials?: string[] | null;
}

function AddProductToCartForm({
  productId,
  colors,
  sizes,
  materials,
}: AddProductToCartFormProps) {
  const { user } = useAuth();
  const { addProductToCart } = useCartActions(user, productId);
  const maxQuantity = 8;

  const form = useForm<AddProductCartData>({
    resolver: zodResolver(AddProductToCartSchema),
    defaultValues: {
      quantity: 1,
      color: undefined,
      size: undefined,
      material: undefined,
    },
  });

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
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <QuantityInput
                    {...field}
                    addOneHandler={addOne}
                    minusOneHandler={minusOne}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Add to Cart</Button>
        </div>
      </form>
    </Form>
  );
}

export default AddProductToCartForm;
