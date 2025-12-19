import db from "@/lib/supabase/db";
import { shippingZones } from "@/lib/supabase/schema";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { asc } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

const createShippingZoneSchema = z.object({
  name: z.string().min(2).max(200),
  cost: z.coerce.number().min(0),
  isActive: z.boolean().optional().default(true),
});

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const zones = await db
      .select()
      .from(shippingZones)
      .orderBy(asc(shippingZones.name));

    return NextResponse.json({ zones }, { status: 200 });
  } catch (error) {
    console.error("Error loading admin shipping zones:", error);
    return NextResponse.json(
      { error: "Error cargando zonas de envío" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = createShippingZoneSchema.safeParse(body);
    if (parsed.success === false) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { name, cost, isActive } = parsed.data;

    const [created] = await db
      .insert(shippingZones)
      .values({
        name: name.trim(),
        cost: cost.toString(),
        isActive,
      })
      .returning();

    return NextResponse.json({ zone: created }, { status: 201 });
  } catch (error) {
    console.error("Error creating shipping zone:", error);
    return NextResponse.json(
      { error: "Error creando zona de envío" },
      { status: 500 }
    );
  }
}
