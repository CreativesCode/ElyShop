import AdminShell from "@/components/admin/AdminShell";
import ErrorToaster from "@/components/layouts/ErrorToaster";
import {
  AdminUserNav,
  UsersColumns,
  UsersDataTable,
  getCurrentUser,
  listUsers,
} from "@/features/users";

type AdminUsersPageProps = {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
};

async function UsersPage({ searchParams }: AdminUsersPageProps) {
  const users = await listUsers({});

  return (
    <AdminShell
      heading="Usuarios"
      description="Edite/Cree nuevos usuarios por admin."
    >
      <AdminUserNav />
      <UsersDataTable columns={UsersColumns} data={users || []} />
      <ErrorToaster />
    </AdminShell>
  );
}

export default UsersPage;
