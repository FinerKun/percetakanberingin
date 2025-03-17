import HeroImage from "@/public/hero-images.png";
import Image from "next/image";

export function HeroSection() {
  return (
    <section className="bg-nordic-gray-light relative mx-auto flex  h-screen w-full bg-cover bg-right pt-12 md:items-center md:pt-0">
      <Image
        src={HeroImage}
        fill
        priority
        alt="Picture of the author"
        className="absolute overflow-clip object-cover"
      />
    </section>
  );
}
