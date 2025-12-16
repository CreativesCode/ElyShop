"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { DocumentType, gql } from "@/gql";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { Home, MoreHorizontal } from "lucide-react";
import Link from "next/link";

export const CollectionColumnsFragment = gql(/* GraphQL */ `
  fragment CollectionColumnsFragment on collections {
    id
    title
    label
    description
    slug
    parent_id
    show_in_home
    collections {
      id
      label
      title
    }
  }
`);

const CollectionsColumns: ColumnDef<{
  node: DocumentType<typeof CollectionColumnsFragment>;
}>[] = [
  {
    accessorKey: "label",
    header: () => <div className="text-left capitalize">Etiqueta</div>,
    cell: ({ row }) => {
      const collection = row.original.node;

      return (
        <Link
          href={`/admin/collections/${collection.id}`}
          className="text-left font-medium capitalize hover:underline flex items-center gap-2"
        >
          {collection.label}
          {collection.show_in_home && (
            <span
              className="inline-flex items-center"
              aria-label="Visible en el home"
            >
              <Home className="h-4 w-4 text-primary" />
            </span>
          )}
        </Link>
      );
    },
  },
  {
    accessorKey: "slug",
    header: () => <div className="">Slug</div>,
    cell: ({ row }) => {
      const collection = row.original.node;

      return <div className="font-medium">{collection.slug}</div>;
    },
  },
  {
    accessorKey: "title",
    header: () => <div className="text-left capitalize">Título</div>,
    cell: ({ row }) => {
      const collection = row.original.node;

      return (
        <p className="font-medium capitalize hover:underline">
          {collection.title}
        </p>
      );
    },
  },
  {
    accessorKey: "parent",
    header: () => <div className="text-left capitalize">Padre</div>,
    cell: ({ row }) => {
      const collection = row.original.node;

      return (
        <div className="font-medium">
          {collection.collections ? (
            <Link
              href={`/admin/collections/${collection.collections.id}`}
              className="text-left font-medium capitalize hover:underline"
            >
              {collection.collections.label}
            </Link>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center capitalize">Acc</div>,
    cell: ({ row }) => {
      const collection = row.original.node;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="flex flex-col items-start"
          >
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>

            <Link
              href={`/admin/collections/${collection.id}`}
              className={buttonVariants({ variant: "ghost" })}
            >
              Editar Colecciones
            </Link>
            {/* <DeleteCollectionDialog collectionId={collection.id} /> */}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default CollectionsColumns;
