import type { MetaFunction } from "@remix-run/cloudflare";
import { Link } from "@remix-run/react";
import { motion, useInView } from "framer-motion";
import { DropdownMenu } from "~/components/navigation/menu";
import { useRef } from "react";

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
      <DropdownMenu />
      <div className="pointer-events-none absolute top-0 left-0 w-full h-64 z-10 bg-gradient-to-b from-black/70 to-transparent" />
      <div className="pointer-events-none absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-black/70 to-transparent" />

      <video
        className="absolute w-full -z-10 h-full object-cover"
        src="/aston.mp4"
        autoPlay
        loop
        muted
        playsInline
        // poster="/poster.jpg"
      />

      <div className="w-full h-24 flex flex-row items-center justify-center relative ">
        <motion.p
          className="text-luxora font-bold text-2xl md:text-4xl lg:text-2xl z-10"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          whileHover={{ scale: 1.05 }}
        >
          Luxora
        </motion.p>
        <div className="absolute w-full h-42 -z-5 bg-gradient-to-b from-black " />
      </div>

      <motion.div
        className="absolute bottom-15 left-1/2 md:left-[1%] -translate-x-1/2 md:translate-x-0 flex flex-col gap-10"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        
      >
        <motion.p
          className="text-white text-3xl md:text-5xl font-semi text-center mt-10 md:mt-20 px-2"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 1 }}
        >
          Indulge in Distinction
        </motion.p>

        <motion.div className="flex flex-col md:flex-row gap-4 md:gap-10 items-center justify-center w-full mt-6 md:mt-0">
          <Link to="/auth" className="w-full md:w-auto">
            <motion.button
              className="w-full md:w-auto font-thin text-xl md:text-3xl items-center border hover:bg-white/15 justify-center border-border/10 flex flex-row gap-2 hover:cursor-pointer duration-200 text-luxora hover:text-white rounded p-3 px-8 md:px-12"
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.5 }}
            >
              Get Started
            </motion.button>
          </Link>
          <Link to="#linkje" className="w-full md:w-auto">
            <motion.button
              className="w-full md:w-auto font-thin text-xl md:text-3xl items-center border hover:bg-white/15 justify-center border-border/10 flex flex-row gap-2 hover:cursor-pointer duration-200 text-luxora hover:text-white rounded p-3 px-8 md:px-12"
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.5 }}
            >
              Learn more
            </motion.button>
          </Link>
        </motion.div>
    </motion.div>
      

    </main >

    
  <div id="linkje" ref={linkjeRef} className=" border border-luxora/80 h-[100vh] bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-950 via-black to-blue-900 [--tw-gradient-stops:from_blue-950,via_black,to_blue-900] relative overflow-hidden [background-size:200%_200%] before:content-[''] before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_20%_30%,rgba(100,149,237,0.2)_0%,transparent_40%)] after:content-[''] after:absolute after:inset-0 after:bg-[linear-gradient(135deg,rgba(30,58,138,0.3)_0%,transparent_30%,transparent_70%,rgba(30,58,138,0.3)_100%)]">
      <div className="border-white border flex flex-col items-center justify-center mx-6 w-1/3 mt-10 py-20">
    
    <motion.p
          className="text-luxora text-5xl font-semibold text-center "
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1, delay: 0.2 }}
        >
          LUXORA: 
      </motion.p>
    
        <motion.p
          className="text-white text-4xl font-semi text-center mt-10"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1, delay: 0.5 }}
        >
          The worlds most luxorious <br></br> marketplace

          
        </motion.p>

        <motion.p
          className="text-white text-[20px] font-semi text-center mt-5 px-4 w-full"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1, delay: 0.8 }}
          >
          <p className="opacity-75">Luxora is the premier marketplace for the wealthy to trade ultra-high-end goods—from supercars and private jets to penthouses, rare watches, and designer collections. Connect with verified buyers and sellers in an exclusive, secure platform designed for seamless luxury transactions. If it's lavish, rare, or extraordinary, you'll find it on Luxora..</p>
          </motion.p>
      </div>
    </div>

    
    
    
    </div>
  );
}
