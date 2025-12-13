ALTER TABLE "collections" ADD COLUMN "parent_id" text;--> statement-breakpoint
ALTER TABLE "collections" ADD COLUMN "show_in_home" boolean DEFAULT false;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "collections" ADD CONSTRAINT "collections_parent_id_collections_id_fk" FOREIGN KEY ("parent_id") REFERENCES "collections"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "collections" ADD CONSTRAINT "parent_collection" FOREIGN KEY ("parent_id") REFERENCES "collections"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
