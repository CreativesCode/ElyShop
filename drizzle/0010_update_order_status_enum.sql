-- Agregar nuevos estados al enum de order_status
-- Los valores existentes son: pending_confirmation, pending_payment, paid, cancelled
-- Agregamos: processing, shipped, delivered

-- No podemos modificar un check constraint directamente, 
-- así que necesitamos eliminar el constraint y crear uno nuevo

-- Primero, eliminamos el constraint actual
DO $$ 
BEGIN
    -- Verificar si existe el constraint y eliminarlo
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name LIKE '%order_status%' 
        AND table_name = 'orders'
    ) THEN
        ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_order_status_check;
    END IF;
END $$;

-- Crear el nuevo constraint con todos los estados
ALTER TABLE orders ADD CONSTRAINT orders_order_status_check 
CHECK (order_status IN (
    'pending_confirmation',
    'pending_payment', 
    'paid',
    'processing',
    'shipped',
    'delivered',
    'cancelled'
));

