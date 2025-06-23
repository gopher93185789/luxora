import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";
import { SimpleProductCard } from "~/components/ProductCard";
import { useUserInfo } from "~/hooks/use-user-info";
import { GetProductsParams } from "~/pkg/api/products";




export default function DashboardProfile() {
  const user = useUserInfo();
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const [loadingListings, setLoadingListings] = useState(true);
  const [userListings, setUserListings] = useState([]);



   const userListingsParams: GetProductsParams = {
      limit: 2,
      page: 1,
      creator: user.user?.id || ""
    };


  return(
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-text-primary">My Profile</h1>
      </div>
      <div className="bg-primary rounded-lg p-8 w-full">
        <div className="flex items-center gap-4">
          <img
            src={user.user?.profile_image_link}
            alt="User Profile"
            className="h-16 w-16 rounded-md"
          />
          <div>
            <h2 className="text-xl font-semibold text-text-primary">{user.user?.username}</h2>
          </div>
        </div>
      </div>
  
    </div>
  )
}
