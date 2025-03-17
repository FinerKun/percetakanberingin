import { montserrat } from "@/lib/fonts";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Percetakan Beringin",
  description: "Percetakan Beringin Website",
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
