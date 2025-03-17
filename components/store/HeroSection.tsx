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
      <div className="z-10 flex max-h-[1920px] w-full flex-col items-center justify-center px-6 pb-24 tracking-wide">
        <p className="text-center text-2xl text-[#F5EEC5] md:text-4xl">
          WELCOME TO
        </p>
        <h1 className="my-4 -rotate-[3deg] bg-[#F5EEC5] px-4 py-2 text-center text-4xl font-bold text-[#892217] md:text-6xl">
          EKRAF&apos;S THINGS
        </h1>
      </div>
    </section>
  );
}
