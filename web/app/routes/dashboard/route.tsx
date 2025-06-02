import { Link, Outlet } from "@remix-run/react";
import { Sidebar } from "~/components/navigation/sidebar";
import { useUserInfo } from "~/hooks/use-user-info";


export default function DashboardLayout() {
  const { user, loading } = useUserInfo();
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
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
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 p-4 overflow-y-auto">
        <h1 className="text-2xl mb-4">Welcome, {user.username}!</h1>
        <img
          src={user.profile_image_link}
          alt="Profile"
          className="w-24 h-24 rounded-full mb-4"
        />
        <Outlet />
      </div>
    </div>
  );
}