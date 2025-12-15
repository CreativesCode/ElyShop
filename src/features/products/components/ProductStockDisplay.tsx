"use client";
import { useAvailableStock } from "@/features/carts/hooks/useAvailableStock";

interface ProductStockDisplayProps {
  productId: string;
  totalStock: number;
  selectedColor?: string | null;
  selectedSize?: string | null;
  selectedMaterial?: string | null;
}

export function ProductStockDisplay({
  productId,
  totalStock,
  selectedColor,
  selectedSize,
  selectedMaterial,
}: ProductStockDisplayProps) {
  // Determinar si hay variantes seleccionadas (no undefined)
  const hasVariantsSelected =
    selectedColor !== undefined ||
    selectedSize !== undefined ||
    selectedMaterial !== undefined;

  // Solo consultar el stock de la variante si hay alguna seleccionada
  const { availableStock, isLoading } = useAvailableStock(
    productId,
    hasVariantsSelected ? selectedColor : undefined,
    hasVariantsSelected ? selectedSize : undefined,
    hasVariantsSelected ? selectedMaterial : undefined,
    hasVariantsSelected, // Solo hacer la llamada si hay variantes seleccionadas
  );

  // Si hay variantes seleccionadas y tenemos el stock disponible, usarlo
  // De lo contrario, usar el stock total
  const displayStock =
    hasVariantsSelected && availableStock !== null && !isLoading
      ? availableStock
      : totalStock;

  if (displayStock === 0) {
    return (
      <div className="text-red-500 font-semibold text-lg">
        Sin stock disponible
      </div>
    );
  }

  if (displayStock < 5) {
    return (
      <div className="text-yellow-600 font-semibold">
        Stock bajo - ¡Solo {displayStock} disponible
        {displayStock === 1 ? "" : "s"}!
      </div>
    );
  }

  return (
    <div className="text-green-600 font-semibold">
      En Stock ({displayStock} disponible{displayStock === 1 ? "" : "s"})
    </div>
  );
}
