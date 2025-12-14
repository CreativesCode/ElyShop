"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { DocumentType, gql } from "@/gql";
import { useQuery } from "@urql/next";
import { useMemo } from "react";
import useCartStore, {
  CartItems,
  calcProductCountStorage,
} from "../useCartStore";
import CartItemCard from "./CartItemCard";
import CheckoutButton from "./CheckoutButton";
import EmptyCart from "./EmptyCart";

function GuestCartSection() {
  const { toast } = useToast();
  const cartItems = useCartStore((s) => s.cart);
  const addProductToCart = useCartStore((s) => s.addProductToCart);
  const removeProduct = useCartStore((s) => s.removeProduct);

  // Extraer IDs únicos de productos (sin las opciones)
  const productIds = Array.from(
    new Set(Object.keys(cartItems).map((key) => key.split("-")[0])),
  );

  const [{ data, fetching, error }, _] = useQuery({
    query: FetchGuestCartQuery,
    variables: {
      cartItems: productIds,
      first: 8,
    },
  });

  const subtotal = useMemo(
    () => calcSubtotal({ prdouctsDetails: data, quantity: cartItems }),
    [data, cartItems],
  );

  const productCount = useMemo(
    () => calcProductCountStorage(cartItems),
    [cartItems],
  );
  if (fetching) return LoadingCartSection();
  if (error) return <div>Error</div>;

  const addOneHandler = (cartKey: string, quantity: number) => {
    if (quantity < 8) {
      const currentItem = cartItems[cartKey];
      // Extraer el productId de la clave (formato: productId-color-size-material)
      const productId = cartKey.split("-")[0];
      addProductToCart(
        productId,
        1,
        currentItem?.color,
        currentItem?.size,
        currentItem?.material,
      );
    } else {
      toast({ title: "Product Limit is reached." });
    }
  };
  const minusOneHandler = (cartKey: string, quantity: number) => {
    if (quantity > 1) {
      const currentItem = cartItems[cartKey];
      const productId = cartKey.split("-")[0];
      addProductToCart(
        productId,
        -1,
        currentItem?.color,
        currentItem?.size,
        currentItem?.material,
      );
    } else {
      toast({ title: "Minimum is reached." });
    }
  };
  const removeHandler = (cartKey: string) => {
    removeProduct(cartKey);
    toast({ title: "Product Removed." });
  };

  return (
    <>
      {Object.keys(cartItems).length > 0 ? (
        <section
          aria-label="Cart Section"
          className="grid grid-cols-12 gap-x-6 gap-y-5"
        >
          <div className="col-span-12 md:col-span-9 max-h-[420px] md:max-h-[640px] overflow-y-auto">
            {data.productsCollection.edges.flatMap(({ node }) => {
              // Encontrar todas las combinaciones de este producto en el carrito
              return Object.entries(cartItems)
                .filter(([key]) => key.startsWith(node.id + "-"))
                .map(([cartKey, item]) => (
                  <CartItemCard
                    key={cartKey}
                    id={cartKey}
                    product={node}
                    quantity={item.quantity}
                    selectedColor={item.color}
                    selectedSize={item.size}
                    selectedMaterial={item.material}
                    addOneHandler={() => addOneHandler(cartKey, item.quantity)}
                    minusOneHandler={() =>
                      minusOneHandler(cartKey, item.quantity)
                    }
                    removeHandler={() => removeHandler(cartKey)}
                  />
                ));
            })}
          </div>

          <Card className="w-full h-[180px] px-3 col-span-12 md:col-span-3">
            <CardHeader className="px-3 pt-2 pb-0 text-md">
              <CardTitle className="text-lg mb-0">Subtotoal: </CardTitle>
              <CardDescription>{`${productCount} Items`}</CardDescription>
            </CardHeader>
            <CardContent className="relative overflow-hidden px-3 py-2">
              <p className="text-3xl md:text-lg lg:text-2xl font-bold">{`$ ${subtotal.toFixed(2).toString()}`}</p>
            </CardContent>

            <CardFooter className="gap-x-2 md:gap-x-5 px-3">
              <CheckoutButton guest={true} order={cartItems} />
            </CardFooter>
          </Card>
        </section>
      ) : (
        <EmptyCart />
      )}
    </>
  );
}

export default GuestCartSection;

export const LoadingCartSection = () => (
  <section
    className="grid grid-cols-12 gap-x-6 gap-y-5"
    aria-label="Loading Skeleton"
  >
    <div className="col-span-12 md:col-span-9 space-y-8">
      {[...Array(4)].map((_, index) => (
        <div
          className="flex items-center justify-between gap-x-6 gap-y-8 border-b p-5"
          key={index}
        >
          <Skeleton className="h-[120px] w-[120px]" />
          <div className="space-y-3 w-full">
            <Skeleton className="h-6 max-w-xs" />
            <Skeleton className="h-4" />
            <Skeleton className="h-4 w-full max-w-xl" />
            <Skeleton className="h-4 w-full max-w-lg" />
          </div>
        </div>
      ))}
    </div>
    <div className="w-full h-[180px] px-3 col-span-12 md:col-span-3 border p-5">
      <div className="space-y-3 w-full">
        <Skeleton className="h-6 max-w-xs" />
        <Skeleton className="h-4" />
        <Skeleton className="h-4 mb-6" />
        <Skeleton className="h-4 mb-6 max-w-[280px]" />
      </div>
    </div>
  </section>
);

const calcSubtotal = ({
  prdouctsDetails,
  quantity,
}: {
  prdouctsDetails: DocumentType<typeof FetchGuestCartQuery>;
  quantity: CartItems;
}) => {
  const productPrices =
    prdouctsDetails && prdouctsDetails.productsCollection.edges
      ? prdouctsDetails.productsCollection.edges
      : [];

  if (!productPrices.length) return 0;

  // Sumar todas las combinaciones de cada producto
  return productPrices.reduce((acc, cur) => {
    const productSubtotal = Object.entries(quantity)
      .filter(([key]) => key.startsWith(cur.node.id + "-"))
      .reduce((sum, [_, item]) => sum + item.quantity * cur.node.price, 0);
    return acc + productSubtotal;
  }, 0);
};

const FetchGuestCartQuery = gql(/* GraphQL */ `
  query FetchGuestCartQuery(
    $cartItems: [String!]
    $first: Int
    $after: Cursor
  ) {
    productsCollection(
      first: $first
      after: $after
      filter: { id: { in: $cartItems } }
    ) {
      edges {
        node {
          id
          ...CartItemCardFragment
        }
      }
    }
  }
`);
