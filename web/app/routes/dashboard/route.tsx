import { Link, Outlet, useNavigate, useNavigation } from "@remix-run/react";
import { useEffect } from "react";
import { Sidebar } from "~/components/navigation/sidebar";
import { useUserInfo } from "~/hooks/use-user-info";
import { Refresh, VerifyToken } from "~/pkg/api/auth";
import { GetTokenFromLocalStorage } from "~/pkg/helpers/tokenHandling";
import { motion } from "framer-motion";
import { UserButton } from "~/components/UserButton";

export default function DashboardLayout() {
  const navigate = useNavigate();
  useEffect(() => {
    const handle = async () => {
      try {
        const ok = await VerifyToken();
        if (ok === 200) return;

        const rt = await Refresh();
        if (rt !== 200) throw new Error("Failed to refresh");

        const tk = GetTokenFromLocalStorage();
        await fetch("/auth/cookie", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tk }),
        });
      } catch {
        navigate("/auth");
      }
    };
    handle()
  });

  return (
    <div className="flex w-full h-screen">
        <motion.p
          className="text-white font-bold text-2xl md:text-4xl lg:text-2xl z-10 absolute top-3 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Luxoras
        </motion.p>
        <UserButton />
      <Sidebar />
        <div className="w-[calc(100vw-256px)] h-full overflow-auto p-10">
          <Outlet />
      </div>
    </div>
  );
}
