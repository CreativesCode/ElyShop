import { Shell } from "@/components/layouts/Shell";
import {
  WishlistProducts,
  WishlistProductsSkeleton,
} from "@/features/products";
import Link from "next/link";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

type Props = {};

function WishListPage({}: Props) {
  return (
    <Shell className="max-w-screen-2xl mx-auto">
      <section className="flex justify-between items-center py-8">
        <h1 className="text-3xl">Your Wishlist</h1>
        <Link href="/shop">Continue shopping</Link>
      </section>
      {/*
      <Suspense fallback={<CartSectionSkeleton />}>
        <CartSection />
      </Suspense> */}

      <Suspense fallback={<WishlistProductsSkeleton />}>
        <WishlistProducts />
      </Suspense>
    </Shell>
  );
}

export default WishListPage;
