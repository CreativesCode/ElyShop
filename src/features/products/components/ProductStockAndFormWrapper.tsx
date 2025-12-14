"use client";
import { AddProductToCartForm } from "@/features/carts";
import { useState } from "react";
import { ProductStockDisplay } from "./ProductStockDisplay";

interface ProductStockAndFormWrapperProps {
  productId: string;
  totalStock: number;
  colors?: string[] | null;
  sizes?: string[] | null;
  materials?: string[] | null;
}

export function ProductStockAndFormWrapper({
  productId,
  totalStock,
  colors,
  sizes,
  materials,
}: ProductStockAndFormWrapperProps) {
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    undefined,
  );
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    undefined,
  );
  const [selectedMaterial, setSelectedMaterial] = useState<string | undefined>(
    undefined,
  );

  return (
    <>
      <section className="mb-2">
        <ProductStockDisplay
          productId={productId}
          totalStock={totalStock}
          selectedColor={selectedColor}
          selectedSize={selectedSize}
          selectedMaterial={selectedMaterial}
        />
      </section>

      <section className="flex mb-2 items-end space-x-2">
        <AddProductToCartForm
          productId={productId}
          colors={colors}
          sizes={sizes}
          materials={materials}
          onVariantChange={{
            color: setSelectedColor,
            size: setSelectedSize,
            material: setSelectedMaterial,
          }}
        />
      </section>
    </>
  );
}
