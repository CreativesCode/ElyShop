import { releaseReservations } from "@/features/orders/utils/inventory";
import db from "@/lib/supabase/db";
import { orders } from "@/lib/supabase/schema";
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

      if (order.order_status === "cancelled") {
        throw new Error("La orden ya está cancelada");
      }

      if (order.order_status === "paid") {
        throw new Error(
          "No se puede cancelar una orden pagada. El stock ya fue descontado.",
        );
      }

      // 2. Liberar reservas
      await releaseReservations(orderId);

      // 3. Actualizar estado de la orden
      const [updatedOrder] = await tx
        .update(orders)
        .set({
          order_status: "cancelled",
        })
        .where(eq(orders.id, orderId))
        .returning();

      return updatedOrder;
    });

    return NextResponse.json({
      success: true,
      order: result,
      message: "Orden cancelada y reservas liberadas",
    });
  } catch (error: any) {
    console.error("Error cancelling order:", error);

    return NextResponse.json(
      {
        error: "Error al cancelar orden",
        message: error.message || "Error desconocido",
      },
      { status: 500 },
    );
  }
}
