import CategoriesSubNav from "@/components/layouts/CategoriesSubNav";
import MainFooter from "@/components/layouts/MainFooter";
import Navbar from "@/components/layouts/MainNavbar";
import { CartSheet } from "@/features/carts";
import { ReactNode } from "react";

type Props = { children: ReactNode };

async function StoreLayout({ children }: Props) {
  return (
    <>
      <Navbar />
      <CategoriesSubNav />
      <main className="pt-[50px] md:pt-[114px] min-h-screen">{children}</main>
      <CartSheet />
      <MainFooter />
    </>
  );
}

export default StoreLayout;
