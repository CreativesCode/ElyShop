import AdminShell from "@/components/admin/AdminShell";
import ShippingZonesAdminClient, {
  type ShippingZoneRow,
} from "@/features/shipping/components/admin/ShippingZonesAdminClient";
import db from "@/lib/supabase/db";
import { shippingZones } from "@/lib/supabase/schema";
import { asc } from "drizzle-orm";

export default async function ShippingZonesPage() {
  const zones = await db
    .select()
    .from(shippingZones)
    .orderBy(asc(shippingZones.name));

  const initialZones: ShippingZoneRow[] = zones.map((z) => ({
    id: z.id,
    name: z.name,
    cost: z.cost,
    isActive: z.isActive,
  }));

  return (
    <AdminShell
      heading="Zonas de envío"
      description="Configura el costo de envío por zona. En el checkout, el cliente puede elegir una zona registrada o seleccionar “Otro” para que el costo se confirme por WhatsApp."
    >
      <ShippingZonesAdminClient initialZones={initialZones} />
    </AdminShell>
  );
}
