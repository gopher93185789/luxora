import type { MetaFunction } from "@remix-run/cloudflare";
import { Link } from "@remix-run/react";
import { motion, useInView } from "framer-motion";
import { DropdownMenu } from "~/components/navigation/menu";
import { useRef } from "react";
import { Navbar } from "~/components/navigation/navbar";
import { Hero } from "~/components/hero";
import { Features } from "~/components/Features";

export const meta: MetaFunction = () => {
  return [
    { title: "luxora" },
    {
      name: "description",
      content: "The marketplace for the rich by the rich",
    },
  ];
};

export default function HomePage() {
  const linkjeRef = useRef(null);
  const inView = useInView(linkjeRef, { once: true, margin: "-100px" }); //dit is voor als je wilt dat de animatie pas start als het element in beeld is

  return ( 
  
  <div className="w-full overflow-hidden flex flex-col">
    <main className="bg w-screen h-screen relative overflow-hidden">
      <div className="md:hidden"> 
        <DropdownMenu /> 
      </div>
      <div className="pointer-events-none absolute top-0 left-0 w-full h-64 z-10 bg-gradient-to-b from-black/70 to-transparent" />
      <div className="pointer-events-none absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-black/70 to-transparent" />

      <video
        className="absolute w-full -z-10 h-full object-cover"
        src="/luxvideo.mp4"
        autoPlay
        loop
        muted
        playsInline
        
      />

      <Navbar />  
      <Hero />

    </main>
    <Features />

    
    </div>
  );
}
