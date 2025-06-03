import { Link, Outlet } from "@remix-run/react";
import { Sidebar } from "~/components/navigation/sidebar";
import { useUserInfo } from "~/hooks/use-user-info";

export default function DashboardLayout() {
  const { user, loading } = useUserInfo();
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <h1 className="text-2xl">You are not logged in!</h1>
        <Link to="/auth" className="ml-4 text-blue-500 hover:underline">
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="flex w-full h-screen">
      <Sidebar />
      <div className="w-[calc(100vw-256px)] h-full overflow-auto p-5">

      <Outlet />
      </div>
    </div>
  );
}
