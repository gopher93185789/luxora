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
        // navigate("/auth");
      }
    };
    handle();
  });

  return (
    <main className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 px-64 p-5">
        <UserButton />
        <div className="w-full">
          <Outlet />
        </div>
      </div>
    </main>
  );
}
