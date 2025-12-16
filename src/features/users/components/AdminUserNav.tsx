"use client";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

function AdminUserNav() {
  return (
    <section className="flex justify-end mb-3">
      <Link className={cn(buttonVariants())} href="/admin/users/new">
        Crear Nuevo Usuario
      </Link>
    </section>
  );
}

export default AdminUserNav;
