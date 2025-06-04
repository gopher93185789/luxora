import {  Outlet, useNavigate } from "@remix-run/react";
import { useEffect } from "react";
import { Sidebar } from "~/components/navigation/sidebar";
import { Refresh, VerifyToken } from "~/pkg/api/auth";
import { GetTokenFromLocalStorage } from "~/pkg/helpers/tokenHandling";

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
      <Sidebar />
      <div className="w-[calc(100vw-256px)] h-full overflow-auto p-5">
        <Outlet />
      </div>
    </div>
  );
}
