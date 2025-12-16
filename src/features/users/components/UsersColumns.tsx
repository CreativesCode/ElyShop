"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";

import { useToast } from "@/components/ui/use-toast";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const UsersColumns: ColumnDef<User>[] = [
  {
    accessorKey: "id",
    header: () => <div className="text-left capitalize">ID</div>,
    cell: ({ row }) => {
      const user = row.original;

      return (
        <Link
          href={`/admin/users/${user.id}`}
          className="text-center font-medium capitalize"
        >
          {user.id}
        </Link>
      );
    },
  },
  {
    accessorKey: "name",
    header: () => <div className="text-left capitalize">Nombre</div>,
    cell: ({ row }) => {
      const user = row.original;
      return <p>{user.user_metadata.name || "-"}</p>;
    },
  },
  {
    accessorKey: "email",
    header: () => <div className="text-left capitalize">Email</div>,
    cell: ({ row }) => {
      const user = row.original;
      return <p className="text-truncate sm:text-nowrap">{user.email}</p>;
    },
  },
  {
    accessorKey: "role",
    header: () => <div className="text-left capitalize">Rol</div>,
    cell: ({ row }) => {
      const user = row.original;
      return <p>{user.role}</p>;
    },
  },

  {
    id: "actions",
    header: () => <div className="text-center capitalize">Acc</div>,
    cell: ({ row }) => {
      const user = row.original;
      const { toast } = useToast();
      const router = useRouter();

      const promoteAdminHandler = async (userId: string) => {
        try {
          const res = await fetch("/api/users/promote-user", {
            method: "POST",
            body: JSON.stringify({
              userId,
            }),
          });

          const { message } = await res.json();
          toast({
            title: !res.ok ? "Error" : "Success",
            description: message,
          });

          router.refresh();
        } catch (err) {
          toast({
            title: "Error",
            description: "Unexpected Error occured.",
          });
        }
      };

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
              href={`/admin/products/${user.id}`}
              className={buttonVariants({ variant: "ghost" })}
            >
              Editar Usuario
            </Link>
            <Button onClick={() => promoteAdminHandler(user.id)}>
              Promover a Admin
            </Button>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default UsersColumns;
