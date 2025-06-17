import type { MetaFunction } from "@remix-run/cloudflare";
import { Link } from "@remix-run/react";
import { motion } from "framer-motion";
import { DropdownMenu } from "~/components/navigation/menu";

export const meta: MetaFunction = () => {
  return [
    { title: "About Us - Luxora" },
    {
      name: "description",
      content: "Learn about Luxora - The premier marketplace for luxury goods, where distinction meets exclusivity.",
    },
  ];
};

export default function AboutPage() {
  return (
    <main className="bg-black min-h-screen relative overflow-x-hidden">
      <DropdownMenu />
      
      <section className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
        <div className="relative z-10 text-center px-8 max-w-4xl">
          <motion.h1
            className="text-9xl md:text-8xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            About Luxora
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-gray-300 font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            Where luxury meets legacy, and distinction becomes destiny
          </motion.p>
        </div>
      </section>

        
    </main>
  );
}
