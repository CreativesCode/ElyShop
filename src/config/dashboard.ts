import type { SidebarNavItem } from "@/types";

export type DashboardConfig = {
  sidebarNav: SidebarNavItem[];
};

export const dashboardConfig: DashboardConfig = {
  sidebarNav: [
    {
      title: "Dashboard",
      href: "/admin/dashboard",
      icon: "layoutDashboard",
      items: [],
    },
    {
      title: "Productos",
      href: "/admin/products",
      icon: "cart",
      items: [],
    },
    {
      title: "Colecciones",
      href: "/admin/collections",
      icon: "folder",
      items: [],
    },
    {
      title: "Multimedia",
      href: "/admin/medias",
      icon: "image",
      items: [],
    },
    {
      title: "Usuarios",
      href: "/admin/users",
      icon: "user",
      items: [],
    },
    {
      title: "Órdenes",
      href: "/admin/orders",
      icon: "receipt",
      items: [],
    },
    {
      title: "Envíos",
      href: "/admin/shipping-zones",
      icon: "truck",
      items: [],
    },
  ],
};
