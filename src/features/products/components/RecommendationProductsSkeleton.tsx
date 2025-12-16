import Header from "@/components/layouts/Header";
import { ProductCardSkeleton } from "./ProductCardSkeleton";

function RecommendationProductsSkeleton() {
  return (
    <Header heading={`Te puede interesar`}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4">
        {[...Array(4)].map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    </Header>
  );
}

export default RecommendationProductsSkeleton;
