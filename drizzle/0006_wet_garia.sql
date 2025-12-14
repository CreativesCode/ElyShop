ALTER TABLE "carts" DROP CONSTRAINT "user_product_options_cart_id";--> statement-breakpoint
ALTER TABLE "carts" ADD COLUMN "id" text NOT NULL;