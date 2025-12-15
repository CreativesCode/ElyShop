"use client";
import { useEffect, useState } from "react";
import { checkAvailableStock } from "../api";

export function useAvailableStock(
  productId: string,
  color?: string | null,
  size?: string | null,
  material?: string | null,
  enabled: boolean = true,
) {
  const [availableStock, setAvailableStock] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Solo hacer la llamada si está habilitado (todas las variantes requeridas están seleccionadas)
    if (!enabled) {
      setAvailableStock(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    async function fetchStock() {
      try {
        setIsLoading(true);
        setError(null);

        const result = await checkAvailableStock(
          productId,
          1, // Solo queremos saber cuánto stock hay disponible
          color,
          size,
          material,
        );

        setAvailableStock(result.availableStock);
      } catch (err) {
        console.error("Error fetching stock:", err);
        setError("No se pudo obtener el stock disponible");
        setAvailableStock(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStock();
  }, [productId, color, size, material, enabled]);

  return { availableStock, isLoading, error };
}
