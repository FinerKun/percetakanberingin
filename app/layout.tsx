import "./globals.css";
import { montserrat } from "@/lib/fonts";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ekraf's Things",
  description: "Ekraf's Website from BEM FKG ULM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.className} scroll-smooth p-0`}>
        {children}
      </body>
    </html>
  );
}
