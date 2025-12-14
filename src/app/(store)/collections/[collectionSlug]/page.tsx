import { Shell } from "@/components/layouts/Shell";
import { Skeleton } from "@/components/ui/skeleton";
import { getPageTitle, siteConfig } from "@/config/site";
import { CollectionBanner } from "@/features/collections";
import { SearchProductsGridSkeleton } from "@/features/products";
import {
  FilterSelections,
  SearchProductsInifiteScroll,
} from "@/features/search";
import { gql } from "@/gql";
import { getServiceClient } from "@/lib/urql-service";
import { toTitleCase, unslugify } from "@/lib/utils";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface CategoryPageProps {
  params: {
    collectionSlug: string;
  };
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

export function generateMetadata({ params }: CategoryPageProps) {
  const collectionTitle = toTitleCase(unslugify(params.collectionSlug));
  return {
    title: getPageTitle(collectionTitle),
    description: `${siteConfig.name} | Buy ${params.collectionSlug} furniture.`,
  };
}

const CollectionRouteQuery = gql(/* GraphQL */ `
  query CollectionRouteQuery($collectionSlug: String) {
    collectionsCollection(
      filter: { slug: { eq: $collectionSlug } }
      orderBy: [{ order: DescNullsLast }]
      first: 1
    ) {
      edges {
        node {
          id
          title
          label
          description
          ...CollectionBannerFragment
          productsCollection(orderBy: [{ created_at: DescNullsLast }]) {
            pageInfo {
              hasNextPage
            }
            edges {
              node {
                id
                ...ProductCardFragment
              }
            }
          }
        }
      }
    }
  }
`);

const GetChildCollectionsQuery = gql(/* GraphQL */ `
  query GetChildCollectionsQuery($parentId: String) {
    collectionsCollection(filter: { parent_id: { eq: $parentId } }) {
      edges {
        node {
          id
        }
      }
    }
  }
`);

// Helper function to recursively get all child collection IDs
async function getAllChildCollectionIds(
  collectionId: string,
  client: ReturnType<typeof getServiceClient>,
): Promise<string[]> {
  const childIds: string[] = [];

  const result = await client.query(GetChildCollectionsQuery, {
    parentId: collectionId,
  });

  const directChildren =
    result.data?.collectionsCollection?.edges.map((edge) => edge.node.id) || [];

  childIds.push(...directChildren);

  // Recursively get children of children
  for (const childId of directChildren) {
    const grandChildren = await getAllChildCollectionIds(childId, client);
    childIds.push(...grandChildren);
  }

  return childIds;
}

async function CategoryPage({ params }: CategoryPageProps) {
  const { collectionSlug } = params;

  const client = getServiceClient();
  const collectionResult = await client.query(CollectionRouteQuery, {
    collectionSlug,
  });

  if (
    collectionResult.data === null ||
    !collectionResult.data?.collectionsCollection?.edges[0]?.node ||
    collectionResult.data?.collectionsCollection === null ||
    collectionResult.data?.collectionsCollection?.edges[0].node
      .productsCollection === null
  )
    return notFound();

  const collection = collectionResult.data.collectionsCollection.edges[0].node;
  const productsList = collection.productsCollection;

  if (!productsList) return notFound();

  // Get all child collection IDs recursively
  const childCollectionIds = await getAllChildCollectionIds(
    collection.id,
    client,
  );

  // Combine main collection ID with all child collection IDs
  const allCollectionIds = [collection.id, ...childCollectionIds];

  return (
    <Shell className="max-w-screen-2xl mx-auto">
      <CollectionBanner collectionBannerData={collection} />
      <Suspense
        fallback={
          <div>
            <Skeleton className="max-w-xl h-8 mb-3" />
            <Skeleton className="max-w-2xl h-8" />
          </div>
        }
      >
        <FilterSelections shopLayout={false} />
      </Suspense>

      <Suspense fallback={<SearchProductsGridSkeleton />}>
        <SearchProductsInifiteScroll collectionIds={allCollectionIds} />
      </Suspense>
    </Shell>
  );
}

export default CategoryPage;
