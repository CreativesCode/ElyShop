import { getAvailableStock } from "@/features/orders/utils/inventory";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, color, size, material, requestedQty } = body;

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 },
      );
    }

    if (!requestedQty || requestedQty < 1) {
      return NextResponse.json(
        { error: "Valid quantity is required" },
        { status: 400 },
      );
    }

    // Obtener stock disponible considerando reservas activas
    const availableStock = await getAvailableStock(productId, {
      color: color || null,
      size: size || null,
      material: material || null,
    });

    const hasStock = availableStock >= requestedQty;

    return NextResponse.json({
      productId,
      availableStock,
      requestedQty,
      hasStock,
      variant: {
        color: color || null,
        size: size || null,
        material: material || null,
      },
    });
  } catch (error) {
    console.error("Error checking stock:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
