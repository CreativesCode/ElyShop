import AdminShell from "@/components/admin/AdminShell";
import { CollectionForm } from "@/features/collections";

type Props = {};

async function NewProjectPage({}: Props) {
  return (
    <AdminShell
      heading="Agregar Colección"
      description="Ingrese los campos a continuación, después de eso presione el botón Agregar Colección para guardar la colección."
    >
      <CollectionForm />
    </AdminShell>
  );
}

export default NewProjectPage;
