import AdminShell from "@/components/admin/AdminShell";
import { ImageGridSkeleton, MediasPageContent } from "@/features/medias";
import { Suspense } from "react";

type Props = {};

async function MediasPage({}: Props) {
  return (
    <AdminShell
      heading="Multimedias"
      description="Puede agregar/editar las multimedias desde el dashboard"
    >
      <Suspense fallback={<ImageGridSkeleton />}>
        <MediasPageContent />
      </Suspense>
    </AdminShell>
  );
}

export default MediasPage;
