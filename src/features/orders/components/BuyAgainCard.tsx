"use client";
import { DocumentType, gql } from "@/gql";
import { keytoUrl } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "../../../components/ui/card";

type BuyAgainCardProps = {
  products: DocumentType<typeof BuyAgainCardFragment>[];
};

export const BuyAgainCardFragment = gql(/* GraphQL */ `
  fragment BuyAgainCardFragment on productsEdge {
    node {
      id
      featured
      price
      name
      slug
      description
      featuredImage: medias {
        id
        key
        alt
      }
    }
  }
`);

function BuyAgainCard({ products }: BuyAgainCardProps) {
  return (
    <Card>
      <CardHeader className="px-6 py-3 flex flex-row justify-between items-center bg-zinc-100 rounded-t-md">
        <h2 className="text-lg font-semibold text-primary">Comprar de nuevo</h2>
      </CardHeader>
      <CardContent className="flex flex-col gap-y-5 py-5">
        {products.map(({ node }) => (
          <div key={node.id} className="flex gap-5">
            <div className="relative w-[80px] h-[80px]">
              <Image
                width={120}
                height={120}
                src={keytoUrl(node.featuredImage.key)}
                alt={node.featuredImage.alt}
                className="object-cover w-[80px] h-[80px] rounded-md"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Link
                href={"/shop/" + node.slug}
                className="text-primary-800 line-clamp-2"
              >
                {node.name}
              </Link>
              <Link href={"/shop/" + node.slug} className="font-bold">
                <p>${node.price}</p>
              </Link>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default BuyAgainCard;
