import { useNavigate } from "@remix-run/react";
import { SimpleProductGrid } from "~/components/ProductGrid";
import { LogoutButton } from "~/components/LogoutButton";
import { useUserInfo } from "~/hooks/use-user-info";
import { GetProductsParams } from "~/pkg/api/products";




export default function DashboardProfile() {
  const { user, loading: userLoading } = useUserInfo();
  const navigate = useNavigate();

  if (userLoading || !user?.id) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">My Profile</h1>
        </div>
        <div className="flex items-center justify-center min-h-32 md:min-h-64">
          <div className="animate-spin h-6 w-6 md:h-8 md:w-8 border-2 border-text-primary/30 border-t-text-primary rounded-full"></div>
        </div>
      </div>
    );
  }

  const userListingsParams: Partial<GetProductsParams> = {
    creator: user.id,
    limit: 20,
  };

  return(
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">My Profile</h1>
      </div>
      
      <div className="bg-primary rounded-lg p-4 md:p-8 w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
            <img
              src={user.profile_image_link}
              alt="User Profile"
              className="h-12 w-12 md:h-16 md:w-16 rounded-md flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h2 className="text-lg md:text-xl font-semibold text-text-primary truncate">{user.username}</h2>
              <p className="text-sm md:text-base text-text-primary/70 truncate">{user.email?.String}</p>
            </div>
          </div>
          <LogoutButton
            className="bg-red-500 hover:bg-red-600 text-white px-3 md:px-4 py-2 rounded-lg transition-colors font-medium flex items-center gap-2 text-sm md:text-base w-full sm:w-auto justify-center"
            onClick={() => navigate('/auth')}
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="md:w-4 md:h-4">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16,17 21,12 16,7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            }
          >
            Logout
          </LogoutButton>
        </div>
      </div>

      <div className="bg-primary rounded-lg p-4 md:p-6 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-4">
          <h2 className="text-xl md:text-2xl font-semibold text-text-primary">My Listings</h2>
          <button
            onClick={() => navigate('/dashboard/listings')}
            className="bg-secondary hover:bg-secondary/80 text-accent px-3 md:px-4 py-2 rounded-lg transition-colors font-medium text-sm md:text-base w-full sm:w-auto"
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
