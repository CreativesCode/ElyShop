/**
 * Script para actualizar estados de órdenes antiguas
 *
 * Este script actualiza las órdenes que tienen estados antiguos
 * o null al nuevo sistema de estados.
 *
 * Ejecutar con: npx tsx scripts/update-order-statuses.ts
 */

import { eq } from "drizzle-orm";
import db from "../src/lib/supabase/db";
import { orders } from "@/lib/supabase/schema";

async function updateOrderStatuses() {
  console.log("🔄 Iniciando actualización de estados de órdenes...\n");

  try {
    // Obtener todas las órdenes
    const allOrders = await db
      .select({
        id: orders.id,
        order_status: orders.order_status,
        payment_status: orders.payment_status,
      })
      .from(orders);

    console.log(`📊 Total de órdenes encontradas: ${allOrders.length}\n`);

    let updatedCount = 0;

    for (const order of allOrders) {
      let newStatus = order.order_status;

      // Si el estado es null, establecer un valor por defecto
      if (!order.order_status) {
        if (order.payment_status === "paid") {
          newStatus = "paid";
        } else {
          newStatus = "pending_confirmation";
        }

        console.log(`📝 Orden ${order.id}: null -> ${newStatus}`);

        await db
          .update(orders)
          .set({ order_status: newStatus })
          .where(eq(orders.id, order.id));

        updatedCount++;
      }
      // Mapear estados antiguos si existen
      else if (order.order_status === "pending") {
        newStatus = "pending_confirmation";

        console.log(`📝 Orden ${order.id}: pending -> ${newStatus}`);

        await db
          .update(orders)
          .set({ order_status: newStatus })
          .where(eq(orders.id, order.id));

        updatedCount++;
      } else if (order.order_status === "preparing") {
        newStatus = "processing";

        console.log(`📝 Orden ${order.id}: preparing -> ${newStatus}`);

        await db
          .update(orders)
          .set({ order_status: newStatus })
          .where(eq(orders.id, order.id));

        updatedCount++;
      }
    }

    console.log(`\n✅ Actualización completada!`);
    console.log(`📊 Órdenes actualizadas: ${updatedCount}`);
    console.log(`📊 Órdenes sin cambios: ${allOrders.length - updatedCount}`);
  } catch (error) {
    console.error("❌ Error al actualizar estados:", error);
    throw error;
  }
}

// Ejecutar el script
updateOrderStatuses()
  .then(() => {
    console.log("\n🎉 Script completado exitosamente");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Error fatal:", error);
    process.exit(1);
  });
