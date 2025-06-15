import { useState } from "react"
import { useUserInfo } from "~/hooks/use-user-info"
import { Link } from "@remix-run/react"
import { motion, AnimatePresence } from "framer-motion"
import { Layout } from "lucide-react"

export function DashboardButton() {


  return (
    <Link
      to="/dashboard"
      className="absolute bottom-9 left-7 inline-block text-left z-[100]"
      title="Dashboard"
    >
      <motion.div
        animate={{ rotate: 0, opacity: 1, y: 0, scale: 1 }}
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="p-2 rounded bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
      >
        <Layout className="text-text-primary duration-200 ease-in-out" size={30} />
      </motion.div>
    </Link>
  );
}
