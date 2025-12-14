import Header from "@/components/layouts/Header";
import { Shell } from "@/components/layouts/Shell";
import {
  SearchProductsGridSkeleton,
  SearchProductsInifiteScroll,
} from "@/features/search";
import { Suspense } from "react";

interface ProductsPageProps {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

async function ProductsPage({}: ProductsPageProps) {
  // TODO: PROBLEM in server actrion
  // const collectionsData = await listCollectionsAction();

  return (
    <Shell className="max-w-screen-2xl mx-auto">
      <Header heading="Shop Now" />

      {/* <Suspense
        fallback={
          <div>
            <Skeleton className="max-w-xl h-8 mb-3" />
            <Skeleton className="max-w-2xl h-8" />
          </div>
        }
      >
        <FilterSelections collectionsSection={collectionsData} />
      </Suspense>
       */}

      <Suspense fallback={<SearchProductsGridSkeleton />}>
        <SearchProductsInifiteScroll />
      </Suspense>
    </Shell>
  );
}

export default ProductsPage;
