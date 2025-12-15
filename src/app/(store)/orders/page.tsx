import { Shell } from "@/components/layouts/Shell";
import { BuyAgainCard, OrdersList } from "@/features/orders/components";
import { gql } from "@/gql";
import { createClient } from "@/lib/supabase/server";
import { getClient } from "@/lib/urql";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

const OrderPageQuery = gql(/* GraphQL */ `
  query OrderPageQuery($first: Int!, $userId: UUID) {
    ordersCollection(
      first: $first
      orderBy: [{ created_at: DescNullsLast }]
      filter: { user_id: { eq: $userId } }
    ) {
      __typename
      edges {
        ...OrdersListFragment
      }
    }

    productsCollection(first: 8) {
      edges {
        ...BuyAgainCardFragment
      }
    }
  }
`);

async function OrderPage() {
  const cookieStore = cookies();
  const supabase = createClient({ cookieStore });

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/sign-in");
  }

  const { data, error } = await getClient().query(OrderPageQuery, {
    first: 4,
    userId: user.id,
  });

  if (!data) return notFound();

  return (
    <Shell layout="narrow" className="max-w-screen-2xl mx-auto">
      <h1 className="pb-8 text-3xl font-semibold border-b">Órdenes</h1>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-x-5">
        <section className="col-span-1 md:col-span-9">
          <OrdersList orders={data.ordersCollection.edges} />
        </section>

        <section className="col-span-1 md:col-span-3">
          <BuyAgainCard products={data.productsCollection.edges} />
        </section>
      </div>
    </Shell>
  );
}

export default OrderPage;
