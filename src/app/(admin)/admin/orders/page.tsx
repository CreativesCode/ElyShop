import AdminShell from "@/components/admin/AdminShell";
import { DataTableSkeleton } from "@/features/cms";
import { OrdersColumns, OrdersDataTable } from "@/features/orders";
import { gql } from "@/gql";
import { getClient } from "@/lib/urql";
import { notFound } from "next/navigation";
import { Suspense } from "react";

type AdminOrdersPageProps = {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
};

const AdminOrdersPageQuery = gql(/* GraphQL */ `
  query AdminOrdersPageQuery {
    ordersCollection(orderBy: [{ created_at: DescNullsLast }]) {
      edges {
        node {
          __typename
          id
          ...OrderColumnsFragment
        }
      }
    }
  }
`);

async function OrdersPage({}: AdminOrdersPageProps) {
  const { data } = await getClient().query(AdminOrdersPageQuery, {});

  if (!data) return notFound();

  return (
    <AdminShell
      heading="Órdenes"
      description={"Edite las órdenes desde el dashboard. "}
    >
      {/* <section className="flex justify-end items-center pb-5 w-full">
        <Link href="/admin/orders/new" className={cn(buttonVariants())}>
          Nueva Orden
        </Link>
      </section> */}

      <Suspense fallback={<DataTableSkeleton />}>
        <OrdersDataTable
          columns={OrdersColumns}
          data={data.ordersCollection.edges || []}
        />
      </Suspense>
    </AdminShell>
  );
}

export default OrdersPage;
