-- Migración para limpiar y corregir la tabla inventory_reservations
-- Esta migración elimina los datos de prueba y asegura la estructura correcta

-- 1. Eliminar todos los datos existentes (datos de prueba)
TRUNCATE TABLE "inventory_reservations" CASCADE;

-- 2. Verificar que las columnas existan con los tipos correctos
-- Si la tabla tiene problemas, la recreamos

-- Primero, eliminar la tabla si existe
DROP TABLE IF EXISTS "inventory_reservations" CASCADE;

-- Recrear la tabla con la estructura correcta
CREATE TABLE "inventory_reservations" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"product_id" text NOT NULL,
	"color" text,
	"size" text,
	"material" text,
	"quantity" integer NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- 3. Agregar las foreign keys
DO $$ BEGIN
 ALTER TABLE "inventory_reservations" ADD CONSTRAINT "inventory_reservations_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "inventory_reservations" ADD CONSTRAINT "inventory_reservations_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "inventory_reservations" ADD CONSTRAINT "reservation_to_order" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "inventory_reservations" ADD CONSTRAINT "reservation_to_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- 4. Deshabilitar RLS (uso interno)
ALTER TABLE "inventory_reservations" DISABLE ROW LEVEL SECURITY;

-- 5. Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS "idx_inventory_reservations_order" ON "inventory_reservations" ("order_id");
CREATE INDEX IF NOT EXISTS "idx_inventory_reservations_product" ON "inventory_reservations" ("product_id");
CREATE INDEX IF NOT EXISTS "idx_inventory_reservations_status" ON "inventory_reservations" ("status");

