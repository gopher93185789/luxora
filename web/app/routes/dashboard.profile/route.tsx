import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";
import { GetUserDetails, Refresh } from "~/pkg/api/auth";
import { GetProducts, ProductInfo } from "~/pkg/api/products";
import { ProductCard } from "~/components/ProductCard";
import { getTokenFromServerSideCaller } from "~/pkg/helpers/server";
import { GetTokenFromLocalStorage } from "~/pkg/helpers/tokenHandling";
import { UserDetails } from "~/pkg/models/api";

export async function loader(lfa: LoaderFunctionArgs) {
  const token = await getTokenFromServerSideCaller(lfa);
  const resp = await GetUserDetails(token);

  if ("code" in resp) {
    return { requireRefresh: true };
  }

  return { requireRefresh: false, user: resp };
}

export default function Dashboard() {
  const { requireRefresh, user } = useLoaderData<typeof loader>();
  const [data, setData] = useState<UserDetails | undefined>(
    !requireRefresh ? user : undefined
  );
  const [userListings, setUserListings] = useState<ProductInfo[]>([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handle = async () => {
      if (!requireRefresh) return;

      console.log("defaulting to csr");
      try {
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

        const token = GetTokenFromLocalStorage();
        const userData = await GetUserDetails(token);
        if ("code" in userData) throw new Error("Failed to fetch user");

        setData(userData);

        await fetchUserListings(userData.username);
      } catch {
        // navigate("/auth");
      }
    };

    handle();
  }, [requireRefresh, navigate]);

  const fetchUserListings = async (username: string) => {
    setLoadingListings(true);
    try {
      const listings = await GetProducts({
        limit: 20,
        page: 1,
        creator: username,
      });

      if (!("code" in listings)) {
        setUserListings(listings);
      }
    } catch (error) {
      console.error("Failed to fetch user listings:", error);
    } finally {
      setLoadingListings(false);
    }
  };

  useEffect(() => {
    if (data?.username) {
      fetchUserListings(data.username);
    }
  }, [data?.username]);

  return (
    <div className="flex flex-col gap-8 items-start">
      <div className="bg-primary rounded-lg p-8 w-full">
        <div className="flex items-center gap-6">
          <img
            className="h-24 w-24 rounded-full "
            src={data?.profile_image_link || "/images/default-avatar.png"}
            alt="User Avatar"
          />
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-text-primary">
              Welcome, {data?.username}!
            </h1>
            {data?.email.String && (
              <p className="text-text-primary/70">
                Email: {data?.email.String}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-primary rounded-lg p-8 w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text-primary">Your Listings</h2>
          <span className="text-text-primary/70 text-sm">
            {userListings.length} listing
            {userListings.length !== 1 ? "s" : ""}
          </span>
        </div>

        {loadingListings ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-text-primary"></div>
            <span className="ml-3 text-text-primary/70">
              Loading your listings...
            </span>
          </div>
        ) : userListings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-text-primary/50 mb-4">
              <svg
                className="w-16 h-16 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              No listings yet
            </h3>
            <p className="text-text-primary/70 mb-4">
              You haven't created any listings yet. Start selling your luxury
              items today!
            </p>
            <button
              onClick={() => navigate("/dashboard/listings")}
              className="bg-black/90 hover:bg-accent/50 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Create Your First Listing
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userListings.map((listing) => (
              <ProductCard
                key={listing.id}
                product={listing}
                showDeleteButton={true}
                onDelete={(productId) => {
                  setUserListings((prev) =>
                    prev.filter((item) => item.id !== productId)
                  );
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
