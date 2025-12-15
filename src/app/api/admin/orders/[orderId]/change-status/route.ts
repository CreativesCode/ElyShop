import { isValidStatusTransition } from "@/features/orders/utils/orderStatus";
import db from "@/lib/supabase/db";
import { orders, OrderStatus } from "@/lib/supabase/schema";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { orderId: string } },
) {
  try {
    const { orderId } = params;
    const body = await request.json();
    const { newStatus } = body as { newStatus: OrderStatus };

    if (!newStatus) {
      return NextResponse.json(
        { error: "El nuevo estado es requerido" },
        { status: 400 },
      );
    }

    // Verificar que el usuario sea admin
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Verificar si es admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Realizar operación en transacción
    const result = await db.transaction(async (tx) => {
      // 1. Verificar que la orden existe
      const [order] = await tx
        .select()
        .from(orders)
        .where(eq(orders.id, orderId))
        .for("update");

      if (!order) {
        throw new Error("Orden no encontrada");
      }

      const currentStatus = order.order_status as OrderStatus;

      // 2. Verificar que la transición de estado es válida
      if (!isValidStatusTransition(currentStatus, newStatus)) {
        throw new Error(
          `No se puede cambiar de ${currentStatus} a ${newStatus}`,
        );
      }

      // 3. Actualizar estado de la orden
      const [updatedOrder] = await tx
        .update(orders)
        .set({
          order_status: newStatus,
        })
        .where(eq(orders.id, orderId))
        .returning();

      return updatedOrder;
    });

    return NextResponse.json({
      success: true,
      order: result,
      message: `Estado actualizado a ${newStatus}`,
    });
  } catch (error: any) {
    console.error("Error changing order status:", error);

    return NextResponse.json(
      {
        error: "Error al cambiar estado de la orden",
        message: error.message || "Error desconocido",
      },
      { status: 500 },
    );
  }
}
