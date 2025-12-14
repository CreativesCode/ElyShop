import db from "@/lib/supabase/db";
import { inventoryReservations, products } from "@/lib/supabase/schema";
import { and, eq, sql } from "drizzle-orm";

/**
 * Calcula el stock disponible para un producto considerando las reservas activas
 * @param productId - ID del producto
 * @param variantOptions - Opciones de la variante (color, size, material)
 * @returns Stock disponible o null si no hay stock
 */
export async function getAvailableStock(
  productId: string,
  variantOptions?: {
    color?: string | null;
    size?: string | null;
    material?: string | null;
  },
): Promise<number> {
  // Obtener el stock total del producto
  const product = await db
    .select({ stock: products.stock })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  if (!product.length || product[0].stock === null) {
    return 0;
  }

  const totalStock = product[0].stock;

  // Construir condiciones para las variantes
  const conditions = [
    eq(inventoryReservations.productId, productId),
    eq(inventoryReservations.status, "active"),
  ];

  // Agregar condiciones de variante si están especificadas
  if (variantOptions?.color !== undefined) {
    conditions.push(
      variantOptions.color === null
        ? sql`${inventoryReservations.color} IS NULL`
        : eq(inventoryReservations.color, variantOptions.color),
    );
  }

  if (variantOptions?.size !== undefined) {
    conditions.push(
      variantOptions.size === null
        ? sql`${inventoryReservations.size} IS NULL`
        : eq(inventoryReservations.size, variantOptions.size),
    );
  }

  if (variantOptions?.material !== undefined) {
    conditions.push(
      variantOptions.material === null
        ? sql`${inventoryReservations.material} IS NULL`
        : eq(inventoryReservations.material, variantOptions.material),
    );
  }

  // Calcular cantidad reservada activa
  const reservedQtyResult = await db
    .select({
      total: sql<number>`COALESCE(SUM(${inventoryReservations.quantity}), 0)`,
    })
    .from(inventoryReservations)
    .where(and(...conditions));

  const reservedQty = Number(reservedQtyResult[0]?.total || 0);

  // Stock disponible = stock total - reservas activas
  const availableStock = totalStock - reservedQty;

  console.log(`📦 Stock calculation for ${productId}:`, {
    totalStock,
    reservedQty,
    availableStock,
    variant: variantOptions,
    reservedResult: reservedQtyResult,
  });

  return Math.max(0, availableStock);
}

/**
 * Verifica si hay suficiente stock disponible para una cantidad solicitada
 * @param productId - ID del producto
 * @param requestedQty - Cantidad solicitada
 * @param variantOptions - Opciones de la variante
 * @returns true si hay suficiente stock, false si no
 */
export async function hasAvailableStock(
  productId: string,
  requestedQty: number,
  variantOptions?: {
    color?: string | null;
    size?: string | null;
    material?: string | null;
  },
): Promise<boolean> {
  const available = await getAvailableStock(productId, variantOptions);
  return available >= requestedQty;
}

/**
 * Reserva stock para un producto en una orden (dentro de una transacción)
 * IMPORTANTE: Esta función debe llamarse dentro de una transacción con lock
 * @param tx - Transacción de Drizzle
 * @param orderId - ID de la orden
 * @param productId - ID del producto
 * @param quantity - Cantidad a reservar
 * @param variantOptions - Opciones de la variante
 * @returns ID de la reserva creada
 */
export async function createReservation(
  tx: any,
  orderId: string,
  productId: string,
  quantity: number,
  variantOptions?: {
    color?: string | null;
    size?: string | null;
    material?: string | null;
  },
): Promise<string> {
  const [reservation] = await tx
    .insert(inventoryReservations)
    .values({
      orderId,
      productId,
      quantity,
      color: variantOptions?.color || null,
      size: variantOptions?.size || null,
      material: variantOptions?.material || null,
      status: "active",
    })
    .returning({ id: inventoryReservations.id });

  return reservation.id;
}

/**
 * Libera las reservas de una orden (cambia estado a 'released')
 * @param orderId - ID de la orden
 */
export async function releaseReservations(orderId: string): Promise<void> {
  await db
    .update(inventoryReservations)
    .set({
      status: "released",
      updatedAt: new Date().toISOString(),
    })
    .where(
      and(
        eq(inventoryReservations.orderId, orderId),
        eq(inventoryReservations.status, "active"),
      ),
    );
}

/**
 * Consume las reservas de una orden y descuenta el stock real
 * IMPORTANTE: Esta función debe llamarse dentro de una transacción
 * @param tx - Transacción de Drizzle
 * @param orderId - ID de la orden
 */
export async function consumeReservationsAndDeductStock(
  tx: any,
  orderId: string,
): Promise<void> {
  // Obtener todas las reservas activas de la orden
  const reservations = await tx
    .select()
    .from(inventoryReservations)
    .where(
      and(
        eq(inventoryReservations.orderId, orderId),
        eq(inventoryReservations.status, "active"),
      ),
    );

  if (!reservations.length) {
    throw new Error("No active reservations found for this order");
  }

  // Marcar reservas como consumidas
  await tx
    .update(inventoryReservations)
    .set({
      status: "consumed",
      updatedAt: new Date().toISOString(),
    })
    .where(
      and(
        eq(inventoryReservations.orderId, orderId),
        eq(inventoryReservations.status, "active"),
      ),
    );

  // Descontar stock de cada producto
  for (const reservation of reservations) {
    await tx
      .update(products)
      .set({
        stock: sql`${products.stock} - ${reservation.quantity}`,
      })
      .where(eq(products.id, reservation.productId));
  }
}
