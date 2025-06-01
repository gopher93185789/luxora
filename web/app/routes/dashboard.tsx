import { Link, Outlet } from "@remix-run/react";


export default function DashboardLayout() {
  return (
    <div className="dashboard-container flex">
      <div className="dashboard-sidebar w-64 bg-gray-100 min-h-screen p-4">
        {/* menu */}
        <nav className="flex flex-col gap-2">
          <Link to="/dashboard" className="font-bold text-lg mb-4">Dashboard</Link>
          <Link to="/dashboard/listings" className="hover:bg-gray-200 p-2 rounded">Listings</Link>
          <Link to="/dashboard/products" className="hover:bg-gray-200 p-2 rounded">Products</Link>
          <Link to="/dashboard/settings" className="hover:bg-gray-200 p-2 rounded">Settings</Link>
        </nav>
      </div>
      <main className="dashboard-content flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
