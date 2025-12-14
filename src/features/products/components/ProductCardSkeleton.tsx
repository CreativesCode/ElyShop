import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const ProductCardSkeleton = () => (
  <Card className="w-full border-0 rounded-lg">
    <CardContent className="relative p-0 overflow-hidden rounded-t-lg">
      <Skeleton className="w-full aspect-[1/1] rounded-t-lg" />
      {/* Skeleton para el badge (opcional) */}
      <Skeleton className="absolute top-2 left-2 w-16 h-5 rounded-full" />
      {/* Skeleton para el botón de wishlist */}
      <Skeleton className="absolute top-2 right-2 w-8 h-8 md:w-10 md:h-10 rounded-full" />
    </CardContent>

    <CardHeader className="p-1 px-2 md:px-4 mb-2 md:mb-3 flex flex-col">
      <div>
        <CardTitle>
          <Skeleton className="w-[180px] h-5 md:h-6 mb-2" />
        </CardTitle>

        <div className="flex md:justify-between flex-col md:flex-row gap-2">
          <Skeleton className="w-16 h-5" />
          <Skeleton className="w-24 h-4" />
        </div>
      </div>
      <div className="flex flex-col md:flex-row md:justify-between mt-0 gap-y-2">
        {/* Skeleton para los colores */}
        <div className="flex items-center gap-x-1 flex-wrap">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="w-4 h-4 rounded-full" />
          ))}
        </div>
        {/* Skeleton para los sizes */}
        <div className="flex items-center gap-x-1 flex-wrap">
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className="w-8 h-5 rounded" />
          ))}
        </div>
      </div>
    </CardHeader>
  </Card>
);

export default ProductCardSkeleton;
