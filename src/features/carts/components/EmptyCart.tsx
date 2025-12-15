import { Icons } from "@/components/layouts/icons";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

function EmptyCart() {
  return (
    <section className="w-full border border-foreground min-h-[450px] flex flex-col gap-5 justify-center items-center">
      <p className="text-muted-foreground text-sm">Tu carrito está vacío.</p>
      <Link
        href="/shop"
        className={cn(buttonVariants({ size: "lg" }), "font-semibold")}
      >
        <Icons.cart className="mr-3 w-5 h-5" />
        Continuar comprando
      </Link>
    </section>
  );
}

export default EmptyCart;
