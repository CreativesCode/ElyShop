import Header from "@/components/layouts/Header";
import { Shell } from "@/components/layouts/Shell";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getPageMetadata } from "@/config/site";
// import { ProductCommentsSection } from "@/features/comments";
import {
  ProductCard,
  ProductImageShowcase,
  ProductStockAndFormWrapper,
} from "@/features/products";
import { AddToWishListButton } from "@/features/wishlists";
import { gql } from "@/gql";
import { getServiceClient } from "@/lib/urql-service";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

type Props = {
  params: {
    slug: string;
  };
};
export const metadata: Metadata = getPageMetadata();

const ProductDetailPageQuery = gql(/* GraphQL */ `
  query ProductDetailPageQuery($productSlug: String) {
    productsCollection(filter: { slug: { eq: $productSlug } }) {
      edges {
        node {
          id
          name
          description
          rating
          price
          stock
          tags
          totalComments
          colors
          sizes
          materials
          ...ProductImageShowcaseFragment
          commentsCollection(first: 5) {
            edges {
              node {
                ...ProductCommentsSectionFragment
              }
            }
          }
          collections {
            id
            label
            slug
          }
        }
      }
    }
    recommendations: productsCollection(first: 4) {
      edges {
        node {
          id
          ...ProductCardFragment
        }
      }
    }
  }
`);

async function ProductDetailPage({ params }: Props) {
  const { data } = await getServiceClient().query(ProductDetailPageQuery, {
    productSlug: params.slug,
  });

  if (!data || !data.productsCollection || !data.productsCollection.edges)
    return notFound();

  const { id, name, description, price, colors, sizes, materials } =
    data.productsCollection.edges[0].node;

  return (
    <Shell className="max-w-screen-2xl mx-auto">
      <div className="grid grid-cols-12 gap-x-8">
        <div className="space-y-8 relative col-span-12 md:col-span-7">
          <ProductImageShowcase data={data.productsCollection.edges[0].node} />
        </div>

        <div className="col-span-12 md:col-span-5">
          <section className="flex justify-between items-start max-w-lg">
            <div>
              <h1 className="text-4xl font-semibold tracking-wide mb-2">
                {name}
              </h1>
              <p className="text-2xl font-semibold mb-2">{`$${price}`}</p>
            </div>
            <AddToWishListButton productId={id} />
          </section>

          <Suspense>
            <ProductStockAndFormWrapper
              productId={id}
              totalStock={data.productsCollection.edges[0].node.stock || 0}
              colors={colors as string[] | null}
              sizes={sizes as string[] | null}
              materials={materials as string[] | null}
            />
          </Suspense>

          {/* <BuyNowButton productId={id} /> */}

          <section>
            <Accordion type="single" collapsible>
              {/* <AccordionItem value="item-1">
                <AccordionTrigger>Is it accessible?</AccordionTrigger>
                <AccordionContent>
                  Yes. It adheres to the WAI-ARIA design pattern.
                </AccordionContent>
              </AccordionItem> */}
              {/* <AccordionItem value="item-2">
                <AccordionTrigger>Is it accessible?</AccordionTrigger>
                <AccordionContent>
                  Yes. It adheres to the WAI-ARIA design pattern.
                </AccordionContent>
              </AccordionItem> */}
              <AccordionItem value="item-3">
                <AccordionTrigger>Envío y devoluciones</AccordionTrigger>
                <AccordionContent>
                  El costo de envío se calcula según tu dirección y se muestra
                  al finalizar la compra. Si tu pedido aplica, coordinamos
                  entrega a domicilio o punto de recogida según tu zona.
                  <br />
                  Las devoluciones o cambios solo se aceptan en el momento de la
                  entrega, si el producto no le sirve o no le gusta. Una vez
                  recibido y confirmado, no realizamos devoluciones.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>
        </div>
      </div>

      <Header heading={`Descripción:`} className="pt-2 pb-2">
        <div
          className="mt-2 text-sm leading-relaxed [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-2 [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-2 [&_li]:mb-1 [&_strong]:font-bold [&_em]:italic [&_u]:underline [&_a]:text-blue-600 [&_a]:underline [&_a:hover]:text-blue-800"
          dangerouslySetInnerHTML={{ __html: description || "" }}
        />
      </Header>

      <Header heading={`We Think You'll Love`} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4">
        {data.recommendations &&
          data.recommendations.edges.map(({ node }) => (
            <ProductCard key={node.id} product={node} />
          ))}
      </div>

      {/* <ProductCommentsSection
        comments={
          commentsCollection
            ? commentsCollection.edges.map(({ node }) => node)
            : []
        }
        totalComments={totalComments}
      /> */}
    </Shell>
  );
}

export default ProductDetailPage;
