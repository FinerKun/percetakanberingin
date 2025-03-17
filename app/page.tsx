"use client";

import { ShoppingCartProvider } from "@/context/ShoppingCartContext";
import { NavBar } from "@/components/store/NavBar";
import { HeroSection } from "@/components/store/HeroSection";
import { Footer } from "@/components/store/Footer";
import { StoreSection } from "@/components/store/StoreSection";

export default function Home() {
  return (
    <ShoppingCartProvider>
      <NavBar />
      <HeroSection />
      <StoreSection />
      <Footer />
    </ShoppingCartProvider>
  );
}
