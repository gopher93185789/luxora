import { useNavigate } from "@remix-run/react";
import { SimpleProductGrid } from "~/components/ProductGrid";
import { useUserInfo } from "~/hooks/use-user-info";
import { GetProductsParams } from "~/pkg/api/products";




export default function DashboardProfile() {
  const { user, loading: userLoading } = useUserInfo();
  const navigate = useNavigate();

  if (userLoading || !user?.id) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-text-primary">My Profile</h1>
        </div>
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin h-8 w-8 border-2 border-text-primary/30 border-t-text-primary rounded-full"></div>
        </div>
      </div>
    );
  }

  const userListingsParams: Partial<GetProductsParams> = {
    creator: user.id,
    limit: 20,
  };

  return(
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-text-primary">My Profile</h1>
      </div>
      
      <div className="bg-primary rounded-lg p-8 w-full">
        <div className="flex items-center gap-4">
          <img
            src={user.profile_image_link}
            alt="User Profile"
            className="h-16 w-16 rounded-md"
          />
          <div>
            <h2 className="text-xl font-semibold text-text-primary">{user.username}</h2>
            <p className="text-text-primary/70">{user.email?.String}</p>
          </div>
        </div>
      </div>

      <div className="bg-primary rounded-lg p-6 w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-text-primary">My Listings</h2>
          <button
            onClick={() => navigate('/dashboard/listings')}
            className="bg-secondary hover:bg-secondary/80 text-accent px-4 py-2 rounded-lg transition-colors font-medium"
          >
            Manage Listings
          </button>
        </div>
        
        <SimpleProductGrid
          initialParams={userListingsParams}
          className="mt-4"
        />
      </div>
    </div>
  )
}
