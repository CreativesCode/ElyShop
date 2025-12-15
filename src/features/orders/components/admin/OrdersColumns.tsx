"use client";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DocumentType, gql } from "@/gql";
import { OrderStatus } from "@/lib/supabase/schema";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { getOrderStatusInfo } from "../../utils/orderStatus";
import { formatOrderNumber } from "../../utils/whatsapp";

export const OrderColumnsFragment = gql(/* GraphQL */ `
  fragment OrderColumnsFragment on orders {
    id
    order_status
    payment_status
    order_linesCollection {
      edges {
        node {
          id
          product_id
        }
      }
    }
  }
`);

const OrdersColumns: ColumnDef<{
  node: DocumentType<typeof OrderColumnsFragment>;
}>[] = [
  {
    accessorKey: "label",
    header: () => <div className="text-left capitalize">Order Number</div>,
    cell: ({ row }) => {
      const order = row.original.node;

      return (
        <Link
          href={`/admin/orders/${order.id}`}
          className="text-center font-medium capitalize px-3 hover:underline"
        >
          {formatOrderNumber(order.id)}
        </Link>
      );
    },
  },
  {
    accessorKey: "order_status",
    header: () => <div className="">Order Status</div>,
    cell: ({ row }) => {
      const order = row.original.node;
      const status = order.order_status as OrderStatus;

      if (!status) {
        return <span className="text-muted-foreground">Sin estado</span>;
      }

      // Validar que el status existe en nuestro enum
      const statusInfo = getOrderStatusInfo(status);

      if (!statusInfo) {
        return (
          <Badge variant="outline" className="text-muted-foreground">
            {status}
          </Badge>
        );
      }

      const Icon = statusInfo.icon;

      return (
        <Badge
          variant="outline"
          className={cn(
            "font-medium flex items-center gap-2 w-fit",
            statusInfo.color,
            statusInfo.borderColor,
          )}
        >
          <Icon size={14} />
          {statusInfo.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "payment_status",
    header: () => <div className="text-left capitalize">Payment Status</div>,
    cell: ({ row }) => {
      const order = row.original.node;

      return (
        <div
          className={cn(
            "font-medium capitalize px-5 py-1 flex items-center",
            order.payment_status == "unpaid"
              ? "text-red-500"
              : "text-green-500",
          )}
        >
          <Badge
            variant="outline"
            className={cn(
              order.payment_status == "unpaid"
                ? "text-red-500 border-red-500"
                : "text-green-500 border-green-500",
            )}
          >
            {order.payment_status}
          </Badge>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center capitalize">Actions</div>,
    cell: ({ row }) => {
      const order = row.original.node;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="flex flex-col items-start"
          >
            <DropdownMenuLabel>Actions</DropdownMenuLabel>

            <Link
              href={`/admin/orders/${order.id}`}
              className={buttonVariants({ variant: "ghost" })}
            >
              Edit Orders
            </Link>
            {/* <DeleteCategoryDialog categoryId={category.id} /> */}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default OrdersColumns;
