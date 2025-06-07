import type { MetaFunction } from "@remix-run/cloudflare";
import { Link } from "@remix-run/react";
import { motion } from "framer-motion";
import { DropdownMenu } from "~/components/navigation/menu";

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

      <div className="w-full h-24 flex flex-row items-center justify-center relative">
        <motion.p
          className="text-white font-bold text-2xl md:text-4xl lg:text-2xl z-10"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Luxoras
        </motion.p>
        <div className="absolute w-full h-42 -z-5 bg-gradient-to-b from-black " />
      </div>
      <motion.div
        className=" absolute bottom-15 left-15 flex flex-col gap-10"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <motion.p
          className="text-white text-5xl font-semi text-center mt-20"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 1 }}
        >
          Indulge in Distinction
        </motion.p>
        <Link to="/auth">
          <motion.button
            className=" font-thin text-3xl items-center border hover:bg-white/15 justify-center border-border/10 flex flex-row gap-2 hover:cursor-pointer duration-200 text-text-primary rounded p-3 px-16"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.5 }}
          >
            Dive into
          </motion.button>
        </Link>
      </motion.div>

    </main>


    <div className="h-[100vh] bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-950 via-black to-blue-900 [--tw-gradient-stops:from_blue-950,via_black,to_blue-900] relative overflow-hidden [background-size:200%_200%] before:content-[''] before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_20%_30%,rgba(100,149,237,0.2)_0%,transparent_40%)] after:content-[''] after:absolute after:inset-0 after:bg-[linear-gradient(135deg,rgba(30,58,138,0.3)_0%,transparent_30%,transparent_70%,rgba(30,58,138,0.3)_100%)]">
    
    </div>
    </div>
  );
}
