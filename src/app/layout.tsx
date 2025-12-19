import { Toaster } from "@/components/ui/toaster";
import { getPageMetadata } from "@/config/site";
import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import CustomProvider from "../providers/CustomProvider";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = getPageMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={spaceGrotesk.variable}>
      <CustomProvider>
        <body className={spaceGrotesk.className}>
          {children}
          <Toaster />
        </body>
      </CustomProvider>
    </html>
  );
}
